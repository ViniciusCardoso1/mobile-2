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
import { TurmasService } from './turmas.service';
import { CreateTurmaDto } from './dto/create-turma.dto';
import { UpdateTurmaDto } from './dto/update-turma.dto';
import { QueryTurmaDto } from './dto/query-turma.dto';

@Controller('turmas')
export class TurmasController {
  constructor(private readonly turmasService: TurmasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTurmaDto: CreateTurmaDto) {
    return this.turmasService.create(createTurmaDto);
  }

  @Get()
  findAll(@Query() query: QueryTurmaDto) {
    return this.turmasService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.turmasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTurmaDto: UpdateTurmaDto) {
    return this.turmasService.update(id, updateTurmaDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.turmasService.remove(id);
  }
}

