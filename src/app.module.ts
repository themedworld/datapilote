import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from 'db/data-source';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TerrainModule } from './terrain/terrain.module';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from 'dotenv';
@Module({
  imports: [

    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot(dataSourceOptions),

MongooseModule.forRoot(process.env.MONGO_URI!, {
  dbName: process.env.MONGO_DBNAME,
}),


    // --- Modules métiers ---
    UserModule,
    AuthModule,
    TerrainModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
