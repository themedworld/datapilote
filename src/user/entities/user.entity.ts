import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import {TerrainEntity} from 'src/terrain/entities/terrain.entity';

export enum UserRole {
  MEMBER = 'client',
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

  @Column()
  fullname: string;

  @Column({ select: false })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.MEMBER,
  })
  role: UserRole;
  @OneToMany(() => TerrainEntity, terrain => terrain.client)
  terrains: TerrainEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
