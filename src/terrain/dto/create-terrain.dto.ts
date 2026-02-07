import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';
import { CultureType } from '../entities/terrain.entity';
export class CreateTerrainDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsNumber()
  surface: number;

  @IsString()
  description: string;

  @IsString()
  culture: CultureType;

  @IsOptional()
  @IsNumber()
  clientId?: number; // uniquement si l’admin crée pour un client
}
