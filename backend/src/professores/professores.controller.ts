import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProfessoresService } from './professores.service';
import { CreateProfessorDto } from './dto/create-professor.dto';
import { UpdateProfessorDto } from './dto/update-professor.dto';
import { QueryProfessorDto } from './dto/query-professor.dto';

@Controller('professores')
export class ProfessoresController {
  constructor(private readonly professoresService: ProfessoresService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProfessorDto: CreateProfessorDto) {
    return this.professoresService.create(createProfessorDto);
  }

  @Get()
  findAll(@Query() query: QueryProfessorDto) {
    return this.professoresService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.professoresService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProfessorDto: UpdateProfessorDto,
  ) {
    return this.professoresService.update(id, updateProfessorDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.professoresService.remove(id);
  }
}

