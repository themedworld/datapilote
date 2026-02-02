import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn, 
  ManyToOne, 
  OneToMany 
} from 'typeorm';
import { ProjectEntity } from 'src/projects/entities/project.entity';
import { CompanyEntity } from 'src/companies/entities/company.entity';

export enum UserRole {
  MANAGER = 'manager',
  PROJECT_MANAGER = 'project_manager',
  MEMBER = 'member',
  ADMIN_COMPANY = 'admin_company',
  SUPER_ADMIN = 'super_admin',
}

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  numtel: string;

  @Column({ nullable: false })
  fullname: string;

  @Column({ select: false })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.MEMBER,
  })
  role: UserRole;

  // 🔑 Multi-société
  @ManyToOne(() => CompanyEntity, company => company.users, {
    nullable: true, // SUPER_ADMIN n’a pas de société
    onDelete: 'SET NULL',
  })
  company?: CompanyEntity | null;

  // 🔹 Relations projets
  @OneToMany(() => ProjectEntity, project => project.manager)
  managedProjects: ProjectEntity[];

  @OneToMany(() => ProjectEntity, project => project.assignedTo)
  assignedProjects: ProjectEntity[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}