import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotasService } from './notas.service';
import { NotasController } from './notas.controller';
import { Nota } from './entities/nota.entity';
import { AlunosModule } from '../alunos/alunos.module';
import { DisciplinasModule } from '../disciplinas/disciplinas.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Nota]),
    AlunosModule,
    DisciplinasModule,
  ],
  controllers: [NotasController],
  providers: [NotasService],
  exports: [NotasService],
})
export class NotasModule {}

