import { IsString, IsOptional, IsEnum, IsInt, IsNumber } from 'class-validator';
import { TaskType, TaskStatus, TaskPriority } from '../entities/TaskITEntity.entity';

export class CreateTaskITDto {
  @IsString()
  title: string; // Nom de la tâche

  @IsString()
  @IsOptional()
  description?: string; // Description détaillée

  @IsEnum(TaskType)
  @IsOptional()
  type?: TaskType; // Type de tâche : Feature, Bug, etc.

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus; // Statut de la tâche

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority; // Priorité : High, Medium, Low

  @IsInt()
  @IsOptional()
  storyPoints?: number; // Story points ou complexité

  @IsNumber()
  @IsOptional()
  estimatedHours?: number; // Temps estimé en heures

  @IsString()
  @IsOptional()
  dependencies?: string; // Dépendances avec d'autres tâches

  @IsString()
  @IsOptional()
  risks?: string; // Risques connus

  @IsString()
  @IsOptional()
  complexity?: string; // Low, Medium, High

  @IsInt()
  @IsOptional()
  assignedToId?: number; // ID de l'utilisateur assigné

  @IsInt()
  @IsOptional()
  sprintId?: number; // ID du sprint auquel la tâche appartient

  @IsString()
  @IsOptional()
  additionalNotes?: string; // Notes supplémentaires
}
