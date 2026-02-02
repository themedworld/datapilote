import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Param, 
  Body, 
  Delete, 
  ParseIntPipe 
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UserEntity } from 'src/user/entities/user.entity';
import { CreateProjectCallCenterDto } from './dto/create-project-callcenter.dto';
import { CreateProjectMarketingDto } from './dto/create-project-marketing.dto';
import { ProjectITDto } from './dto/create-project-it.dto';
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // 🔹 Créer un projet (Manager)
  @Post()
  async createProject(
    @Body() dto: CreateProjectDto,
    @Body('manager') manager: UserEntity, // Idéalement récupéré via AuthGuard
  ) {
    return this.projectsService.create(dto, manager);
  }

  // 🔹 Affecter un Project Manager à un projet
  @Patch(':projectId/assign-pm/:pmId')
  async assignProjectManager(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('pmId', ParseIntPipe) pmId: number,
    @Body('manager') manager: UserEntity,
  ) {
    return this.projectsService.assignProjectManager(projectId, pmId, manager);
  }

  // 🔹 Ajouter des membres à un projet (Project Manager)
  @Patch(':projectId/add-members')
  async addMembers(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body('memberIds') memberIds: number[],
    @Body('projectManager') projectManager: UserEntity,
  ) {
    return this.projectsService.addMembers(projectId, memberIds, projectManager);
  }

  // 🔹 Ajouter détails IT
  @Post(':projectId/it-details')
  async addITDetails(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: ProjectITDto,
  ) {
    const project = await this.projectsService.findOne(projectId);
    return this.projectsService.addITDetails(project, dto);
  }

  // 🔹 Ajouter détails Marketing
  @Post(':projectId/marketing-details')
  async addMarketingDetails(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: CreateProjectMarketingDto,
  ) {
    const project = await this.projectsService.findOne(projectId);
    return this.projectsService.addMarketingDetails(project, dto);
  }

  // 🔹 Ajouter détails CallCenter
  @Post(':projectId/callcenter-details')
  async addCallCenterDetails(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: CreateProjectCallCenterDto,
  ) {
    const project = await this.projectsService.findOne(projectId);
    return this.projectsService.addCallCenterDetails(project, dto);
  }

  // 🔹 Initialiser automatiquement les détails selon le domaine
  @Post(':projectId/init-domain')
  async initializeDomain(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: ProjectITDto | CreateProjectMarketingDto | CreateProjectCallCenterDto,
  ) {
    const project = await this.projectsService.findOne(projectId);
    return this.projectsService.initializeDomainDetails(project, dto);
  }

  // 🔹 Voir tous les projets
  @Get()
  async findAll() {
    return this.projectsService.findAll();
  }

  // 🔹 Voir un projet
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.findOne(id);
  }

  // 🔹 Mettre à jour un projet
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, dto);
  }

  // 🔹 Supprimer un projet
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.remove(id);
  }
}
