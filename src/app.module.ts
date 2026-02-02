import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import{TypeOrmModule} from '@nestjs/typeorm';
import { dataSourceOptions } from 'db/data-source';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { CompaniesModule } from './companies/companies.module';
@Module({
  imports: [TypeOrmModule.forRoot(dataSourceOptions),
     ConfigModule.forRoot({
      isGlobal: true, // permet d'utiliser process.env partout
    }),
    UserModule,
    AuthModule,
    ProjectsModule,
    CompaniesModule,
 ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
