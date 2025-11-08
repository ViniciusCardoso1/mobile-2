import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Disciplina } from './entities/disciplina.entity';
import { CreateDisciplinaDto } from './dto/create-disciplina.dto';
import { UpdateDisciplinaDto } from './dto/update-disciplina.dto';
import { QueryDisciplinaDto } from './dto/query-disciplina.dto';

@Injectable()
export class DisciplinasService {
  constructor(
    @InjectRepository(Disciplina)
    private disciplinaRepository: Repository<Disciplina>,
  ) {}

  async create(createDisciplinaDto: CreateDisciplinaDto): Promise<Disciplina> {
    // Regra de negócio 1: Não permitir código duplicado
    const existingByCodigo = await this.disciplinaRepository.findOne({
      where: { codigo: createDisciplinaDto.codigo },
    });
    if (existingByCodigo) {
      throw new ConflictException(
        `Já existe uma disciplina com o código ${createDisciplinaDto.codigo}`,
      );
    }


    // Regra de negócio 3: Não permitir nome duplicado
    const existingByNome = await this.disciplinaRepository.findOne({
      where: { nome: createDisciplinaDto.nome },
    });
    if (existingByNome) {
      throw new ConflictException(
        `Já existe uma disciplina com o nome ${createDisciplinaDto.nome}`,
      );
    }

    const disciplina = this.disciplinaRepository.create(createDisciplinaDto);
    return await this.disciplinaRepository.save(disciplina);
  }

  async findAll(query: QueryDisciplinaDto) {
    const { search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.nome = Like(`%${search}%`);
    }

    const [data, total] = await this.disciplinaRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { nome: 'ASC' },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Disciplina> {
    const disciplina = await this.disciplinaRepository.findOne({
      where: { id },
      relations: ['notas'],
    });

    if (!disciplina) {
      throw new NotFoundException(`Disciplina com ID ${id} não encontrada`);
    }

    return disciplina;
  }

  async update(
    id: string,
    updateDisciplinaDto: UpdateDisciplinaDto,
  ): Promise<Disciplina> {
    const disciplina = await this.findOne(id);

    // Regra de negócio 1: Verificar código duplicado ao atualizar
    if (updateDisciplinaDto.codigo && updateDisciplinaDto.codigo !== disciplina.codigo) {
      const existingByCodigo = await this.disciplinaRepository.findOne({
        where: { codigo: updateDisciplinaDto.codigo },
      });
      if (existingByCodigo) {
        throw new ConflictException(
          `Já existe outra disciplina com o código ${updateDisciplinaDto.codigo}`,
        );
      }
    }


    // Regra de negócio 3: Verificar nome duplicado ao atualizar
    if (updateDisciplinaDto.nome && updateDisciplinaDto.nome !== disciplina.nome) {
      const existingByNome = await this.disciplinaRepository.findOne({
        where: { nome: updateDisciplinaDto.nome },
      });
      if (existingByNome) {
        throw new ConflictException(
          `Já existe outra disciplina com o nome ${updateDisciplinaDto.nome}`,
        );
      }
    }

    Object.assign(disciplina, updateDisciplinaDto);
    return await this.disciplinaRepository.save(disciplina);
  }

  async remove(id: string): Promise<void> {
    const disciplina = await this.findOne(id);

    // Verificar se tem notas associadas
    if (disciplina.notas && disciplina.notas.length > 0) {
      throw new BadRequestException(
        `Não é possível excluir a disciplina pois ela possui ${disciplina.notas.length} nota(s) associada(s)`,
      );
    }

    await this.disciplinaRepository.remove(disciplina);
  }
}

