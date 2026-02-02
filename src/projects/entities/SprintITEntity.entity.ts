import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  OneToMany 
} from 'typeorm';
import { ProjectITEntity } from './projectIT.entity';
import { TaskITEntity } from './TaskITEntity.entity';

@Entity('sprints_it')
export class SprintITEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // Nom du sprint (ex: Sprint 1, Sprint Auth Module)
  @Column()
  name: string;

  // Relation avec le projet IT
  @ManyToOne(() => ProjectITEntity, projectIT => projectIT.sprints, { onDelete: 'CASCADE' })
  projectIT: ProjectITEntity;

  // Dates du sprint
  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  // Statut du sprint (planned, in_progress, completed, on_hold)
  @Column({ default: 'planned' })
  status: string;

  // Capacité totale du sprint (ex: en story points)
  @Column({ type: 'int', nullable: true })
  totalStoryPoints: number;

  // Priorité du sprint (High, Medium, Low)
  @Column({ nullable: true })
  priority: string;

  // Risques identifiés (retard, bug critique, dépendances bloquantes)
  @Column({ nullable: true })
  risks: string;

  // Dépendances avec d’autres modules ou projets
  @Column({ nullable: true })
  dependencies: string;

  // Team size affectée au sprint
  @Column({ type: 'int', nullable: true })
  teamSize: number;

  // Complexité du sprint (Low, Medium, High)
  @Column({ nullable: true })
  complexity: string;

  // Notes supplémentaires pour le sprint
  @Column({ nullable: true })
  additionalNotes: string;

  // Liste des tâches du sprint
  @OneToMany(() => TaskITEntity, task => task.sprint)
  tasks: TaskITEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
