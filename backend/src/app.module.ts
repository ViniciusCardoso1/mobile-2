import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TurmasModule } from './turmas/turmas.module';
import { AlunosModule } from './alunos/alunos.module';
import { ProfessoresModule } from './professores/professores.module';
import { DisciplinasModule } from './disciplinas/disciplinas.module';
import { NotasModule } from './notas/notas.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { TypeOrmConfigService } from './config/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    TurmasModule,
    AlunosModule,
    ProfessoresModule,
    DisciplinasModule,
    NotasModule,
    AuthModule,
    DashboardModule,
  ],
})
export class AppModule {}

