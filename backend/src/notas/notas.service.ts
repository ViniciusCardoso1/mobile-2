import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Nota } from './entities/nota.entity';
import { CreateNotaDto } from './dto/create-nota.dto';
import { UpdateNotaDto } from './dto/update-nota.dto';
import { QueryNotaDto } from './dto/query-nota.dto';
import { AlunosService } from '../alunos/alunos.service';
import { DisciplinasService } from '../disciplinas/disciplinas.service';

@Injectable()
export class NotasService {
  constructor(
    @InjectRepository(Nota)
    private notaRepository: Repository<Nota>,
    private alunosService: AlunosService,
    private disciplinasService: DisciplinasService,
  ) {}

  async create(createNotaDto: CreateNotaDto): Promise<Nota> {
    // Regra de negócio 1: Verificar se aluno existe
    try {
      await this.alunosService.findOne(createNotaDto.aluno);
    } catch (error) {
      throw new BadRequestException(
        `Aluno com ID ${createNotaDto.aluno} não encontrado`,
      );
    }

    // Regra de negócio 2: Verificar se disciplina existe
    try {
      await this.disciplinasService.findOne(createNotaDto.disciplina);
    } catch (error) {
      throw new BadRequestException(
        `Disciplina com ID ${createNotaDto.disciplina} não encontrada`,
      );
    }

    // Regra de negócio 3: Não permitir nota duplicada (mesmo aluno, mesma disciplina, mesma data)
    // Converter data string (YYYY-MM-DD) para Date sem conversão de timezone
    const [year, month, day] = createNotaDto.data.split('-').map(Number);
    const dataDate = new Date(year, month - 1, day); // month é 0-indexed
    
    const existingNota = await this.notaRepository.findOne({
      where: {
        alunoId: createNotaDto.aluno,
        disciplinaId: createNotaDto.disciplina,
        data: dataDate,
      },
    });
    if (existingNota) {
      throw new ConflictException(
        'Já existe uma nota para este aluno nesta disciplina nesta data',
      );
    }

    const { aluno, disciplina, ...notaData } = createNotaDto;
    // Reutilizar dataDate já criada acima
    
    const nota = this.notaRepository.create({
      ...notaData,
      alunoId: aluno,
      disciplinaId: disciplina,
      data: dataDate,
    });
    return await this.notaRepository.save(nota);
  }

  async findAll(query: QueryNotaDto) {
    const { search, aluno, disciplina, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (aluno) {
      where.alunoId = aluno;
    }
    if (disciplina) {
      where.disciplinaId = disciplina;
    }

    const [data, total] = await this.notaRepository.findAndCount({
      where,
      skip,
      take: limit,
      relations: ['aluno', 'disciplina'],
      order: { data: 'DESC' },
    });

    // Filtrar por busca se necessário
    let filteredData = data;
    if (search) {
      filteredData = data.filter(
        (nota) =>
          nota.aluno.nome.toLowerCase().includes(search.toLowerCase()) ||
          nota.disciplina.nome.toLowerCase().includes(search.toLowerCase()) ||
          nota.nota.toString().includes(search),
      );
    }

    return {
      data: filteredData,
      total: search ? filteredData.length : total,
      page,
      limit,
      totalPages: Math.ceil((search ? filteredData.length : total) / limit),
    };
  }

  async findOne(id: string): Promise<Nota> {
    const nota = await this.notaRepository.findOne({
      where: { id },
      relations: ['aluno', 'disciplina'],
    });

    if (!nota) {
      throw new NotFoundException(`Nota com ID ${id} não encontrada`);
    }

    return nota;
  }

  async update(id: string, updateNotaDto: UpdateNotaDto): Promise<Nota> {
    const nota = await this.findOne(id);

    // Regra de negócio 1: Verificar se aluno existe ao atualizar
    if (updateNotaDto.aluno) {
      try {
        await this.alunosService.findOne(updateNotaDto.aluno);
      } catch (error) {
        throw new BadRequestException(
          `Aluno com ID ${updateNotaDto.aluno} não encontrado`,
        );
      }
    }

    // Regra de negócio 2: Verificar se disciplina existe ao atualizar
    if (updateNotaDto.disciplina) {
      try {
        await this.disciplinasService.findOne(updateNotaDto.disciplina);
      } catch (error) {
        throw new BadRequestException(
          `Disciplina com ID ${updateNotaDto.disciplina} não encontrada`,
        );
      }
    }

    // Regra de negócio 3: Não permitir nota duplicada ao atualizar
    // Converter nota.data para Date se necessário (pode vir como string do banco)
    const notaDataDate = nota.data instanceof Date ? nota.data : new Date(nota.data);
    const notaDataString = notaDataDate.toISOString().split('T')[0];
    
    if (
      (updateNotaDto.aluno || updateNotaDto.disciplina || updateNotaDto.data) &&
      !(updateNotaDto.aluno === nota.alunoId &&
        updateNotaDto.disciplina === nota.disciplinaId &&
        (!updateNotaDto.data || updateNotaDto.data === notaDataString))
    ) {
      const alunoId = updateNotaDto.aluno || nota.alunoId;
      const disciplinaId = updateNotaDto.disciplina || nota.disciplinaId;
      // Se updateNotaDto.data fornecida, converter sem timezone
      let data = notaDataDate;
      if (updateNotaDto.data) {
        const [year, month, day] = updateNotaDto.data.split('-').map(Number);
        data = new Date(year, month - 1, day); // month é 0-indexed
      }

      const existingNota = await this.notaRepository.findOne({
        where: {
          alunoId,
          disciplinaId,
          data,
        },
      });
      if (existingNota && existingNota.id !== id) {
        throw new ConflictException(
          'Já existe outra nota para este aluno nesta disciplina nesta data',
        );
      }
    }

    const { aluno, disciplina, ...notaData } = updateNotaDto;
    // Se updateNotaDto.data fornecida, converter sem timezone
    let dataFinal = notaDataDate;
    if (updateNotaDto.data) {
      const [year, month, day] = updateNotaDto.data.split('-').map(Number);
      dataFinal = new Date(year, month - 1, day); // month é 0-indexed
    }
    
    Object.assign(nota, {
      ...notaData,
      alunoId: aluno || nota.alunoId,
      disciplinaId: disciplina || nota.disciplinaId,
      data: dataFinal,
    });
    return await this.notaRepository.save(nota);
  }

  async remove(id: string): Promise<void> {
    const nota = await this.findOne(id);
    await this.notaRepository.remove(nota);
  }
}

