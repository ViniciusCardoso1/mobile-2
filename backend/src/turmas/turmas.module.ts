import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TurmasService } from './turmas.service';
import { TurmasController } from './turmas.controller';
import { Turma } from './entities/turma.entity';
import { ProfessoresModule } from '../professores/professores.module';

@Module({
  imports: [TypeOrmModule.forFeature([Turma]), ProfessoresModule],
  controllers: [TurmasController],
  providers: [TurmasService],
  exports: [TurmasService],
})
export class TurmasModule {}

