// src/mongo/terrain.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TerrainMongoDocument = TerrainMongo & Document;

@Schema({ timestamps: true })
export class TerrainMongo {
  @Prop({ required: true })
  terrainId: number;

  @Prop({ required: true })
  clientId: number;

  @Prop({ type: Number })
  latitude: number;

  @Prop({ type: Number })
  longitude: number;

  @Prop({ type: Number })
  surface: number;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String })
  culture: string;

  @Prop({ type: Object, default: {} })
  indicators: Record<string, any>;
}


export const TerrainMongoSchema = SchemaFactory.createForClass(TerrainMongo);
