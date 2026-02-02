import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ProjectEntity } from './entities/project.entity';
import { UserEntity, UserRole } from 'src/user/entities/user.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectITEntity } from './entities/projectIT.entity';
import { ProjectMarketingEntity } from './entities/projectMarketing.entity';
import { ProjectCallCenterEntity } from './entities/projectCallCenter.entity';
import { CreateProjectCallCenterDto } from './dto/create-project-callcenter.dto';
import { CreateProjectMarketingDto } from './dto/create-project-marketing.dto';
import { ProjectITDto } from './dto/create-project-it.dto';
import { SprintITEntity } from './entities/SprintITEntity.entity';
import { TaskITEntity } from './entities/TaskITEntity.entity';
import { CreateSprintITDto } from './dto/create-sprint-it.dto';
import { CreateTaskITDto } from './dto/create-task-it.dto';
@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(ProjectEntity)
    private projectRepo: Repository<ProjectEntity>,

    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,

      @InjectRepository(ProjectITEntity)
  private projectITRepo: Repository<ProjectITEntity>,

  @InjectRepository(ProjectMarketingEntity)
  private projectMarketingRepo: Repository<ProjectMarketingEntity>,

  @InjectRepository(ProjectCallCenterEntity)
  private projectCallCenterRepo: Repository<ProjectCallCenterEntity>,
  @InjectRepository(SprintITEntity)
    private sprintITRepo: Repository<SprintITEntity>,

  @InjectRepository(TaskITEntity)
    private taskITRepo: Repository<TaskITEntity>,
  ) {}

  // 🔹 Manager crée projet
  async create(dto: CreateProjectDto, manager: UserEntity) {
    if (!manager.company) {
      throw new ForbiddenException('Manager has no company assigned');
    }

    const project = this.projectRepo.create({
      ...dto,
      manager,
      company: manager.company,
    });

    return this.projectRepo.save(project);
  }

  // 🔹 Manager affecte un Project Manager
  async assignProjectManager(
    projectId: number,
    pmId: number,
    manager: UserEntity,
  ) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['company', 'manager'],
    });

    if (!project) throw new NotFoundException('Project not found');

    if (project.company.id !== manager.company?.id) {
      throw new ForbiddenException('You cannot assign PM to a project from another company');
    }

    const pm = await this.userRepo.findOne({
      where: { id: pmId, role: UserRole.PROJECT_MANAGER },
      relations: ['company'],
    });

    if (!pm) throw new NotFoundException('Project Manager not found');

    if (pm.company?.id !== manager.company?.id) {
      throw new ForbiddenException('PM belongs to a different company');
    }

    project.manager = pm;
    return this.projectRepo.save(project);
  }

  // 🔹 Project Manager ajoute des membres
  async addMembers(
    projectId: number,
    memberIds: number[],
    projectManager: UserEntity,
  ) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['manager', 'assignedTo', 'company'],
    });

    if (!project) throw new NotFoundException('Project not found');

    if (project.manager?.id !== projectManager.id) {
      throw new ForbiddenException('You are not the Project Manager of this project');
    }

    const members = await this.userRepo.find({
      where: {
        id: In(memberIds),
        company: { id: project.company.id },
      },
    });

    project.assignedTo = [...(project.assignedTo || []), ...members];

    return this.projectRepo.save(project);
  }


  // 🔹 Voir tous les projets
  async findAll() {
    return this.projectRepo.find({ relations: ['manager', 'assignedTo', 'company'] });
  }

  // 🔹 Voir un projet
  async findOne(id: number) {
    const project = await this.projectRepo.findOne({
      where: { id },
      relations: ['manager', 'assignedTo', 'company'],
    });

    if (!project) throw new NotFoundException('Project not found');

    return project;
  }

  // 🔹 Mettre à jour projet
  async update(id: number, dto: UpdateProjectDto) {
    const project = await this.projectRepo.findOne({ where: { id } });

    if (!project) throw new NotFoundException('Project not found');

    Object.assign(project, dto);
    return this.projectRepo.save(project);
  }

  // 🔹 Supprimer projet
  async remove(id: number) {
    const project = await this.projectRepo.findOne({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');

    await this.projectRepo.remove(project);
    return { message: 'Project removed successfully' };
  }

  async addITDetails(project: ProjectEntity, dto: ProjectITDto) {
    const itDetails = this.projectITRepo.create({ ...dto, project });
    return this.projectITRepo.save(itDetails);
  }

  // 🔹 Créer les détails Marketing
  async addMarketingDetails(project: ProjectEntity, dto: CreateProjectMarketingDto) {
    const marketingDetails = this.projectMarketingRepo.create({ ...dto, project });
    return this.projectMarketingRepo.save(marketingDetails);
  }

  // 🔹 Créer les détails CallCenter
  async addCallCenterDetails(project: ProjectEntity, dto: CreateProjectCallCenterDto) {
    const callCenterDetails = this.projectCallCenterRepo.create({ ...dto, project });
    return this.projectCallCenterRepo.save(callCenterDetails);
  }

  // 🔹 Initialiser automatiquement selon le domaine
  async initializeDomainDetails(project: ProjectEntity, dto: any) {
    switch (project.domain) {
      case 'IT':
        return this.addITDetails(project, dto as ProjectITDto);
      case 'Marketing':
        return this.addMarketingDetails(project, dto as CreateProjectMarketingDto);
      case 'CallCenter':
        return this.addCallCenterDetails(project, dto as CreateProjectCallCenterDto);
      default:
        return null; // pour "Other", pas de détails spécifiques
    }
  }

async createSprintsWithTasks(
    projectId: number,
    sprintsDto: CreateSprintITDto[],
    projectITRepo?: Repository<ProjectITEntity>,
  ): Promise<SprintITEntity[]> {
    // Récupérer le projet IT
    const projectIT = await this.projectITRepo.findOne({ where: { id: projectId } });
    if (!projectIT) throw new NotFoundException('Project IT not found');

    const createdSprints: SprintITEntity[] = [];

    for (const sprintDto of sprintsDto) {
      // Créer le sprint
      const sprint = this.sprintITRepo.create({
        name: sprintDto.name,
        startDate: new Date(sprintDto.startDate),
        endDate: new Date(sprintDto.endDate),
        status: sprintDto.status || 'planned',
        totalStoryPoints: sprintDto.totalStoryPoints,
        priority: sprintDto.priority,
        risks: sprintDto.risks,
        dependencies: sprintDto.dependencies,
        teamSize: sprintDto.teamSize,
        complexity: sprintDto.complexity,
        additionalNotes: sprintDto.additionalNotes,
        projectIT: projectIT,
      });

      const savedSprint = await this.sprintITRepo.save(sprint);

      // Créer les tâches pour ce sprint
      if (sprintDto.tasks && sprintDto.tasks.length > 0) {
        for (const taskDto of sprintDto.tasks) {
          const task = this.taskITRepo.create({
            title: taskDto.title,
            description: taskDto.description,
            type: taskDto.type,
            status: taskDto.status,
            priority: taskDto.priority,
            storyPoints: taskDto.storyPoints,
            estimatedHours: taskDto.estimatedHours,
            dependencies: taskDto.dependencies,
            risks: taskDto.risks,
            complexity: taskDto.complexity,
            additionalNotes: taskDto.additionalNotes,
            sprint: savedSprint,
          });

          // Optionnel : assigner un utilisateur si assignedToId est fourni
          if (taskDto.assignedToId) {
            task.assignedTo = { id: taskDto.assignedToId } as UserEntity;
          }

          await this.taskITRepo.save(task);
        }
      }

      createdSprints.push(savedSprint);
    }

    return createdSprints;
  }
  async addTaskToSprint(
  sprintId: number,
  taskDto: CreateTaskITDto,
): Promise<TaskITEntity> {
  // 1️⃣ Récupérer le sprint
  const sprint = await this.sprintITRepo.findOne({
    where: { id: sprintId },
    relations: ['tasks'],
  });
  if (!sprint) throw new NotFoundException('Sprint IT not found');

  // 2️⃣ Créer la tâche et l'associer au sprint
  const task = this.taskITRepo.create({
    title: taskDto.title,
    description: taskDto.description,
    type: taskDto.type,
    status: taskDto.status,
    priority: taskDto.priority,
    storyPoints: taskDto.storyPoints,
    estimatedHours: taskDto.estimatedHours,
    dependencies: taskDto.dependencies,
    risks: taskDto.risks,
    complexity: taskDto.complexity,
    additionalNotes: taskDto.additionalNotes,
    sprint: sprint,
  });

  // 3️⃣ Optionnel : assigner un utilisateur si provided
  if (taskDto.assignedToId) {
    task.assignedTo = { id: taskDto.assignedToId } as UserEntity;
  }

  // 4️⃣ Sauvegarder la tâche
  const savedTask = await this.taskITRepo.save(task);

  return savedTask;
}


}
