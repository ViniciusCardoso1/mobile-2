import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlunosService } from './alunos.service';
import { AlunosController } from './alunos.controller';
import { Aluno } from './entities/aluno.entity';
import { TurmasModule } from '../turmas/turmas.module';

@Module({
  imports: [TypeOrmModule.forFeature([Aluno]), TurmasModule],
  controllers: [AlunosController],
  providers: [AlunosService],
  exports: [AlunosService],
})
export class AlunosModule {}

