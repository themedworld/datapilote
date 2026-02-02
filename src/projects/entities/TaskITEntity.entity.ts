import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne 
} from 'typeorm';
import { SprintITEntity } from './SprintITEntity.entity';
import { UserEntity } from 'src/user/entities/user.entity';

export enum TaskType {
  FEATURE = 'Feature',
  BUG = 'Bug',
  IMPROVEMENT = 'Improvement',
  TECHNICAL_DEBT = 'Technical Debt',
}

export enum TaskStatus {
  TO_DO = 'To Do',
  IN_PROGRESS = 'In Progress',
  REVIEW = 'In Review',
  DONE = 'Done',
  BLOCKED = 'Blocked',
}

export enum TaskPriority {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
}

@Entity('tasks_it')
export class TaskITEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // Nom de la tâche
  @Column()
  title: string;

  // Description détaillée
  @Column({ nullable: true, type: 'text' })
  description: string;

  // Type de tâche (Feature, Bug, Improvement, Technical Debt)
  @Column({ type: 'enum', enum: TaskType, default: TaskType.FEATURE })
  type: TaskType;

  // Statut de la tâche
  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.TO_DO })
  status: TaskStatus;

  // Priorité
  @Column({ type: 'enum', enum: TaskPriority, nullable: true })
  priority: TaskPriority;

  // Story points ou complexité relative
  @Column({ type: 'int', nullable: true })
  storyPoints: number;

  // Estimation du temps en heures
  @Column({ type: 'decimal', nullable: true, precision: 5, scale: 2 })
  estimatedHours: number;

  // Dépendances avec d’autres tâches
  @Column({ nullable: true })
  dependencies: string; // ex: "Task #12, Task #15"

  // Risques ou problèmes connus
  @Column({ nullable: true })
  risks: string;

  // Complexité (Low, Medium, High)
  @Column({ nullable: true })
  complexity: string;

  // Utilisateur assigné à la tâche
  @ManyToOne(() => UserEntity, { nullable: true })
  assignedTo: UserEntity;

  // Sprint auquel la tâche appartient
  @ManyToOne(() => SprintITEntity, sprint => sprint.tasks, { onDelete: 'CASCADE' })
  sprint: SprintITEntity;

  // Notes supplémentaires
  @Column({ nullable: true })
  additionalNotes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
