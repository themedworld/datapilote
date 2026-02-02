import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn, 
  ManyToOne, 
  ManyToMany, 
  JoinTable,
  OneToOne 
} from 'typeorm';
import { UserEntity } from 'src/user/entities/user.entity';
import { CompanyEntity } from 'src/companies/entities/company.entity';
import { ProjectCallCenterEntity } from './projectCallCenter.entity';
import { ProjectMarketingEntity } from './projectMarketing.entity';
import { ProjectITEntity } from './projectIT.entity';
// Enum pour le statut du projet
export enum ProjectStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled',
}

// Enum pour le domaine du projet
export enum ProjectDomain {
  IT = 'IT',
  MARKETING = 'Marketing',
  CALLCENTER = 'CallCenter',

}

@Entity('projects')
export class ProjectEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.PLANNED,
  })
  status: ProjectStatus;

  @Column({
    type: 'enum',
    enum: ProjectDomain,
    nullable: false,
  })
  domain: ProjectDomain;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  // 🔹 Société à laquelle appartient le projet
  @ManyToOne(() => CompanyEntity, company => company.projects, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  company: CompanyEntity;

  // 🔹 Chef de projet (manager)
  @ManyToOne(() => UserEntity, user => user.managedProjects, {
    nullable: true, // Peut être supprimé sans supprimer le projet
    onDelete: 'SET NULL',
  })
  manager: UserEntity;

  // 🔹 Membres assignés au projet
  @ManyToMany(() => UserEntity)
  @JoinTable({
    name: 'project_members',
    joinColumn: { name: 'project_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  assignedTo: UserEntity[];

@OneToOne(() => ProjectCallCenterEntity, callCenter => callCenter.project, { cascade: true })
callCenterDetails: ProjectCallCenterEntity;
  @Column({ default: true })
  isActive: boolean;
@OneToOne(() => ProjectMarketingEntity, marketing => marketing.project, { cascade: true })
marketingDetails: ProjectMarketingEntity;
  @CreateDateColumn()
  createdAt: Date;
@OneToOne(() => ProjectITEntity, itDetails => itDetails.project, { cascade: true })
itDetails: ProjectITEntity;
  @UpdateDateColumn()
  updatedAt: Date;
}
