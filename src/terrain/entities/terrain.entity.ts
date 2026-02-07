import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserEntity } from 'src/user/entities/user.entity';

export enum CultureType {
  BLE_DUR = 'Blé dur',
  BLE_TENDRE = 'Blé tendre',
}

@Entity('terrains')
export class TerrainEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('float')
  latitude: number;

  @Column('float')
  longitude: number;

  @Column('float')
  surface: number;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: CultureType,
    default: CultureType.BLE_DUR,
  })
  culture: CultureType;

  @ManyToOne(() => UserEntity, user => user.terrains, { eager: true })
  client: UserEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
