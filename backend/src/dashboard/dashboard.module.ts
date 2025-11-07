import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Aluno } from '../alunos/entities/aluno.entity';
import { Turma } from '../turmas/entities/turma.entity';
import { Nota } from '../notas/entities/nota.entity';
import { Disciplina } from '../disciplinas/entities/disciplina.entity';
import { Professor } from '../professores/entities/professor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Aluno, Turma, Nota, Disciplina, Professor]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}

