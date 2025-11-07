import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DisciplinasService } from './disciplinas.service';
import { DisciplinasController } from './disciplinas.controller';
import { Disciplina } from './entities/disciplina.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Disciplina])],
  controllers: [DisciplinasController],
  providers: [DisciplinasService],
  exports: [DisciplinasService],
})
export class DisciplinasModule {}

