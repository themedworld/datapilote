// src/mongo/terrain-mongo.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TerrainMongo, TerrainMongoDocument } from './terrain.schema';
import { DeleteResult } from 'mongodb'; // <-- important si tu veux le résultat

@Injectable()
export class TerrainMongoService {
  constructor(
    @InjectModel(TerrainMongo.name) private terrainMongoModel: Model<TerrainMongoDocument>,
  ) {}

  async create(data: Partial<TerrainMongo>) {
    const terrain = new this.terrainMongoModel(data);
    return terrain.save();
  }

  // --- Suppression Mongo ---
  async remove(terrainId: number): Promise<DeleteResult> {
    try {
      return await this.terrainMongoModel.deleteOne({ terrainId }).exec();
    } catch (error) {
      console.error('Erreur Mongo remove:', error);
      throw error; // mieux de relancer l'erreur plutôt que return null
    }
  }
}
