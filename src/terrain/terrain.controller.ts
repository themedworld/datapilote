import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { TerrainService } from './terrain.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import { CreateTerrainDto } from './dto/create-terrain.dto';
import { UpdateTerrainDto } from './dto/update-terrain.dto';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('terrain')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TerrainController {
  constructor(private readonly terrainService: TerrainService) {}

  @Post()
  @Roles(UserRole.MEMBER, UserRole.SUPER_ADMIN)
  async create(
    @Body() dto: CreateTerrainDto,
    @CurrentUser() user: any,
  ) {
    
    if (user.role === UserRole.MEMBER) {
      dto.clientId = user.id;
    }

    return this.terrainService.create(dto);
  }


  @Get()
  @Roles(UserRole.MEMBER, UserRole.SUPER_ADMIN)
  async findAll(@CurrentUser() user: any) {
    if (user.role === UserRole.SUPER_ADMIN) {
      return this.terrainService.findAll();
    }

    
    return this.terrainService.findByClient(user.id);
  }


  @Get(':id')
  @Roles(UserRole.MEMBER, UserRole.SUPER_ADMIN)
  async findOne(
    @Param('id') id: number,
    @CurrentUser() user: any,
  ) {
    const terrain = await this.terrainService.findOne(+id);

    if (user.role === UserRole.MEMBER && terrain.client.id !== user.id) {
      throw new ForbiddenException('Accès interdit à ce terrain');
    }

    return terrain;
  }




  // -------------------- SUPPRIMER --------------------
@Delete(':id')
@Roles(UserRole.SUPER_ADMIN, UserRole.MEMBER)
async remove(
  @Param('id') id: number,
  @CurrentUser() user: any,
) {
  const terrain = await this.terrainService.findOne(+id);

  if (user.role === UserRole.MEMBER && terrain.client.id !== user.id) {
    throw new ForbiddenException('Suppression interdite');
  }

  return this.terrainService.remove(+id);
}

}
