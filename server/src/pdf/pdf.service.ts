/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import pdfParse from 'pdf-parse';
import { PDFDocument } from './schema/pdf.schema';
import { GeminiService } from './gemini.service';
import { StateGraph, Annotation } from '@langchain/langgraph';

@Injectable()
export class DocumentService {
  constructor(
    @InjectModel(PDFDocument.name) private readonly pdfModel: Model<PDFDocument>,
    private readonly geminiService: GeminiService,
  ) {}

  async processPDF(file: Express.Multer.File) {
    const pdfContent = await pdfParse(file.buffer);
    const fullText = pdfContent.text;

    // State definition
    const DocumentState = Annotation.Root({
      text: Annotation<string>,
      chunks: Annotation<string[]>,
      summary: Annotation<string>,
      category: Annotation<string>,
      highlights: Annotation<string[]>,
      keywords: Annotation<string[]>,
    });

    // Graph pipeline
    const pipeline = new StateGraph(DocumentState)
      .addNode('splitText', async (state) => {
        const chunks: string[] = [];
        for (let i = 0; i < state.text.length; i += 1000) {
          chunks.push(state.text.slice(i, i + 1000));
        }
        return { chunks };
      })

      .addNode('generateSummary', async (state) => {
        const summary = await this.geminiService.generateText(
          `Summarize the following document:
          ${state.text.substring(0, 3000)}`,
        );
        return { summary };
      })

      .addNode('classifyCategory', async (state) => {
        const category = await this.geminiService.generateText(
          `Classify this document into one of the following:
          Research Paper, Resume, Business Report, User Manual, Other.

          Content:
          ${state.text.substring(0, 1000)}`,
        );
        return { category };
      })

      .addNode('extractHighlights', async (state) => {
        const highlightsRaw = await this.geminiService.generateText(
          `Extract 5 key bullet-point highlights:
          ${state.text.substring(0, 2000)}`,
        );
        const highlights = highlightsRaw.split('\n').map((h) => h.trim()).filter(Boolean);
        return { highlights };
      })

      .addNode('extractKeywords', async (state) => {
        const keywordsRaw = await this.geminiService.generateText(
          `Extract 10 relevant keywords from this document:
          ${state.text.substring(0, 1500)}`,
        );
        const keywords = keywordsRaw.split(/[\n,]+/).map((k) => k.trim()).filter(Boolean);
        return { keywords };
      });

    // Graph sequence
    pipeline
      .addEdge('__start__', 'splitText')
      .addEdge('splitText', 'generateSummary')
      .addEdge('generateSummary', 'classifyCategory')
      .addEdge('classifyCategory', 'extractHighlights')
      .addEdge('extractHighlights', 'extractKeywords')
      .addEdge('extractKeywords', '__end__');

    const compiledPipeline = pipeline.compile();
    const analysis = await compiledPipeline.invoke({ text: fullText });

    const newDocument = new this.pdfModel({
      filename: file.originalname,
      summary: analysis.summary,
      category: analysis.category,
      highlights: analysis.highlights,
      keywords: analysis.keywords,
    });

    return newDocument.save();
  }

  /**
   * Answers user questions based only on stored document metadata.
   */
  async askQuestion(documentId: string, question: string) {
    const document = await this.pdfModel.findById(documentId);
    if (!document) return { answer: 'Document not found' };

    const context = [
      document.summary,
      document.category,
      ...document.highlights,
      ...(document.keywords || []),
    ].join('\n');

    const prompt = `Answer the question using only the provided document context. 
If the information is missing, reply with: "Answer not found in document".

Context:
${context}

Question: ${question}`;

    const answer = await this.geminiService.generateText(prompt);
    return { answer };
  }
}
