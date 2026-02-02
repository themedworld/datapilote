import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Param, 
  Body, 
  Delete, 
  ParseIntPipe,
  UseGuards,
  Req
} from '@nestjs/common';
import { Request } from 'express';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UserEntity, UserRole } from 'src/user/entities/user.entity';
import { CreateProjectCallCenterDto } from './dto/create-project-callcenter.dto';
import { CreateProjectMarketingDto } from './dto/create-project-marketing.dto';
import { ProjectITDto } from './dto/create-project-it.dto';
import { CreateTaskITDto } from './dto/create-task-it.dto';
import { CreateSprintITDto } from './dto/create-sprint-it.dto';

// Guards / Roles - ajustez les chemins si nécessaire
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

/**
 * Extend Express Request to include user injected by auth guard
 */
interface RequestWithUser extends Request {
  user?: UserEntity;
}

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // 🔹 Créer un projet (Manager)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
  @Post()
  async createProject(
    @Body() dto: CreateProjectDto,
    @Req() req: RequestWithUser,
  ) {
    const manager = req.user as UserEntity;
    return this.projectsService.create(dto, manager);
  }

  // 🔹 Affecter un Project Manager à un projet (Manager only)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
  @Patch(':projectId/assign-pm/:pmId')
  async assignProjectManager(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('pmId', ParseIntPipe) pmId: number,
    @Req() req: RequestWithUser,
  ) {
    const manager = req.user as UserEntity;
    return this.projectsService.assignProjectManager(projectId, pmId, manager);
  }

  // 🔹 Ajouter des membres à un projet (Project Manager)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROJECT_MANAGER)
  @Patch(':projectId/add-members')
  async addMembers(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body('memberIds') memberIds: number[],
    @Req() req: RequestWithUser,
  ) {
    const projectManager = req.user as UserEntity;
    return this.projectsService.addMembers(projectId, memberIds, projectManager);
  }

  // 🔹 Ajouter détails IT (Manager)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
  @Post(':projectId/it-details')
  async addITDetails(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: ProjectITDto,
  ) {
    const project = await this.projectsService.findOne(projectId);
    return this.projectsService.addITDetails(project, dto);
  }

  // 🔹 Ajouter détails Marketing (Manager)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
  @Post(':projectId/marketing-details')
  async addMarketingDetails(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: CreateProjectMarketingDto,
  ) {
    const project = await this.projectsService.findOne(projectId);
    return this.projectsService.addMarketingDetails(project, dto);
  }

  // 🔹 Ajouter détails CallCenter (Manager)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
  @Post(':projectId/callcenter-details')
  async addCallCenterDetails(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: CreateProjectCallCenterDto,
  ) {
    const project = await this.projectsService.findOne(projectId);
    return this.projectsService.addCallCenterDetails(project, dto);
  }

  // 🔹 Initialiser automatiquement les détails selon le domaine (Manager)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
  @Post(':projectId/init-domain')
  async initializeDomain(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: ProjectITDto | CreateProjectMarketingDto | CreateProjectCallCenterDto,
  ) {
    const project = await this.projectsService.findOne(projectId);
    return this.projectsService.initializeDomainDetails(project, dto);
  }

  // 🔹 Voir tous les projets (authentifié)
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return this.projectsService.findAll();
  }

  // 🔹 Voir un projet (authentifié)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.findOne(id);
  }

  // 🔹 Mettre à jour un projet (Manager)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, dto);
  }

  // 🔹 Supprimer un projet (Manager)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.remove(id);
  }

  // 🔹 Project Manager crée des sprints (et tâches incluses)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROJECT_MANAGER)
  @Post(':projectId/sprints')
  async createSprintsWithTasks(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() sprintsDto: CreateSprintITDto[],
  ) {
    return this.projectsService.createSprintsWithTasks(projectId, sprintsDto);
  }

  // 🔹 Ajouter une tâche à un sprint (Project Manager)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROJECT_MANAGER)
  @Post('sprint/:sprintId/tasks')
  async addTaskToSprint(
    @Param('sprintId', ParseIntPipe) sprintId: number,
    @Body() taskDto: CreateTaskITDto,
  ) {
    return this.projectsService.addTaskToSprint(sprintId, taskDto);
  }

  // 🔹 Affecter une tâche d'un sprint à un membre (Project Manager)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROJECT_MANAGER)
  @Patch('task/:taskId/assign/:memberId')
  async assignTaskToMember(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Req() req: RequestWithUser,
  ) {
    const projectManager = req.user as UserEntity;
    return this.projectsService.assignTaskToMember(taskId, memberId, projectManager);
  }

  // 🔹 Récupérer tous les sprints d’un projet IT (authentifié)
  @UseGuards(JwtAuthGuard)
  @Get(':projectId/sprints')
  async getSprints(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.projectsService.getSprintsOfProjectIT(projectId);
  }

  // 🔹 Récupérer toutes les tâches d’un sprint (authentifié)
  @UseGuards(JwtAuthGuard)
  @Get('sprint/:sprintId/tasks')
  async getTasksOfSprint(@Param('sprintId', ParseIntPipe) sprintId: number) {
    return this.projectsService.getTasksOfSprint(sprintId);
  }

  // 🔹 Affecter un Project Manager à un projet (Manager)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
  @Patch(':projectId/assign-to-pm/:pmId')
  async assignProjectToPM(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('pmId', ParseIntPipe) pmId: number,
    @Req() req: RequestWithUser,
  ) {
    const manager = req.user as UserEntity;
    return this.projectsService.assignProjectToPM(projectId, pmId, manager);
  }
}