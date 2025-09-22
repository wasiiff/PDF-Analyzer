import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentController } from './pdf.controller';
import { DocumentService } from './pdf.service';
import { PDFDocument, PDFDocumentSchema } from './schema/pdf.schema';
import { GeminiService } from './gemini.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PDFDocument.name, schema: PDFDocumentSchema },
    ]),
  ],
  controllers: [DocumentController],
  providers: [DocumentService, GeminiService],
})
export class DocumentModule {}
