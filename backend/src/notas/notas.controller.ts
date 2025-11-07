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
import { NotasService } from './notas.service';
import { CreateNotaDto } from './dto/create-nota.dto';
import { UpdateNotaDto } from './dto/update-nota.dto';
import { QueryNotaDto } from './dto/query-nota.dto';

@Controller('notas')
export class NotasController {
  constructor(private readonly notasService: NotasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createNotaDto: CreateNotaDto) {
    return this.notasService.create(createNotaDto);
  }

  @Get()
  findAll(@Query() query: QueryNotaDto) {
    return this.notasService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNotaDto: UpdateNotaDto) {
    return this.notasService.update(id, updateNotaDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.notasService.remove(id);
  }
}

