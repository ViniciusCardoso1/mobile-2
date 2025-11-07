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
import { AlunosService } from './alunos.service';
import { CreateAlunoDto } from './dto/create-aluno.dto';
import { UpdateAlunoDto } from './dto/update-aluno.dto';
import { QueryAlunoDto } from './dto/query-aluno.dto';

@Controller('alunos')
export class AlunosController {
  constructor(private readonly alunosService: AlunosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createAlunoDto: CreateAlunoDto) {
    return this.alunosService.create(createAlunoDto);
  }

  @Get()
  findAll(@Query() query: QueryAlunoDto) {
    return this.alunosService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.alunosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAlunoDto: UpdateAlunoDto) {
    return this.alunosService.update(id, updateAlunoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.alunosService.remove(id);
  }
}

