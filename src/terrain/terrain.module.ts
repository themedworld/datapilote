import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { TerrainService } from './terrain.service';
import { TerrainController } from './terrain.controller';
import { TerrainEntity } from './entities/terrain.entity';
import { UserModule } from '../user/user.module';
import { UserEntity } from 'src/user/entities/user.entity';
import { TerrainMongoService } from 'src/mongo/terrain-mongo.service';
import { TerrainMongo, TerrainMongoSchema } from 'src/mongo/terrain.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([TerrainEntity, UserEntity]),
    MongooseModule.forFeature([{ name: TerrainMongo.name, schema: TerrainMongoSchema }]),
    forwardRef(() => UserModule),
  ],
  controllers: [TerrainController],
  providers: [TerrainService, TerrainMongoService],
  exports: [TerrainService],
})
export class TerrainModule {}
