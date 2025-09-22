import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class PDFDocument extends Document {
  @Prop() filename: string;

  @Prop() summary: string;

  @Prop() category: string;

  @Prop([String]) highlights: string[];

  @Prop([String]) keywords: string[]; // ✅ new field for keywords
}

export const PDFDocumentSchema = SchemaFactory.createForClass(PDFDocument);
