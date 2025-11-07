import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfessoresService } from './professores.service';
import { ProfessoresController } from './professores.controller';
import { Professor } from './entities/professor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Professor])],
  controllers: [ProfessoresController],
  providers: [ProfessoresService],
  exports: [ProfessoresService],
})
export class ProfessoresModule {}

