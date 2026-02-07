import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TerrainEntity } from './entities/terrain.entity';
import { CreateTerrainDto } from './dto/create-terrain.dto';
import { UpdateTerrainDto } from './dto/update-terrain.dto';
import { UserEntity } from '../user/entities/user.entity';
import {TerrainMongoService} from 'src/mongo/terrain-mongo.service';
@Injectable()
export class TerrainService {
  constructor(
    @InjectRepository(TerrainEntity)
    private readonly terrainRepo: Repository<TerrainEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly terrainMongoService: TerrainMongoService, // Mongo injecté
  ) {}

  // -------------------- CRÉER UN TERRAIN --------------------
  async create(dto: CreateTerrainDto): Promise<TerrainEntity> {
    if (!dto.clientId) {
      throw new NotFoundException('ClientId est requis pour créer un terrain');
    }

    const client = await this.userRepo.findOne({ where: { id: dto.clientId } });
    if (!client) throw new NotFoundException(`Client avec ID ${dto.clientId} introuvable`);

    const terrain = this.terrainRepo.create({
      latitude: dto.latitude,
      longitude: dto.longitude,
      surface: dto.surface,
      description: dto.description,
      culture: dto.culture,
      client,
    });

    const savedTerrain = await this.terrainRepo.save(terrain);

    // --- Synchronisation Mongo ---
    await this.terrainMongoService.create({
      terrainId: savedTerrain.id,
      clientId: client.id,
      latitude: savedTerrain.latitude,
      longitude: savedTerrain.longitude,
      surface: savedTerrain.surface,
      description: savedTerrain.description,
      culture: savedTerrain.culture,
      indicators: {}, // pour stocker les calculs futurs (NDVI, humidité...)
    });

    return savedTerrain;
  }

  // -------------------- TOUS LES TERRAINS --------------------
  async findAll(): Promise<TerrainEntity[]> {
    return this.terrainRepo.find({ relations: ['client'] });
  }

  // -------------------- UN TERRAIN PAR ID --------------------
  async findOne(id: number): Promise<TerrainEntity> {
    const terrain = await this.terrainRepo.findOne({ where: { id }, relations: ['client'] });
    if (!terrain) throw new NotFoundException(`Terrain avec ID ${id} introuvable`);
    return terrain;
  }



  // -------------------- SUPPRIMER UN TERRAIN --------------------
  async remove(id: number): Promise<void> {
    const terrain = await this.findOne(id);
    await this.terrainRepo.remove(terrain);

    // --- Suppression Mongo ---
    await this.terrainMongoService.remove(id);
  }

  // -------------------- TERRAINS D'UN CLIENT --------------------
  async findByClient(clientId: number): Promise<TerrainEntity[]> {
    return this.terrainRepo.find({
      where: { client: { id: clientId } },
      relations: ['client'],
    });
  }
}
