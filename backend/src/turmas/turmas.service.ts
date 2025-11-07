import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Turma } from './entities/turma.entity';
import { CreateTurmaDto } from './dto/create-turma.dto';
import { UpdateTurmaDto } from './dto/update-turma.dto';
import { QueryTurmaDto } from './dto/query-turma.dto';
import { ProfessoresService } from '../professores/professores.service';

@Injectable()
export class TurmasService {
  constructor(
    @InjectRepository(Turma)
    private turmaRepository: Repository<Turma>,
    private professoresService: ProfessoresService,
  ) {}

  async create(createTurmaDto: CreateTurmaDto): Promise<Turma> {
    // Regra de negócio 1: Não permitir código duplicado
    const existingByCodigo = await this.turmaRepository.findOne({
      where: { codigo: createTurmaDto.codigo },
    });
    if (existingByCodigo) {
      throw new ConflictException(
        `Já existe uma turma com o código ${createTurmaDto.codigo}`,
      );
    }

    // Regra de negócio 2: Verificar se o professor existe
    if (createTurmaDto.professor) {
      try {
        await this.professoresService.findOne(createTurmaDto.professor);
      } catch (error) {
        throw new BadRequestException(
          `Professor com ID ${createTurmaDto.professor} não encontrado`,
        );
      }
    }

    // Regra de negócio 3: Não permitir turma com mesmo código e período
    const existingByCodigoPeriodo = await this.turmaRepository.findOne({
      where: {
        codigo: createTurmaDto.codigo,
        periodo: createTurmaDto.periodo,
      },
    });
    if (existingByCodigoPeriodo) {
      throw new ConflictException(
        `Já existe uma turma com o código ${createTurmaDto.codigo} no período ${createTurmaDto.periodo}`,
      );
    }

    const { professor, ...turmaData } = createTurmaDto;
    const turma = this.turmaRepository.create({
      ...turmaData,
      professorId: professor,
    });
    return await this.turmaRepository.save(turma);
  }

  async findAll(query: QueryTurmaDto) {
    const { search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.nome = Like(`%${search}%`);
    }

    const [data, total] = await this.turmaRepository.findAndCount({
      where,
      skip,
      take: limit,
      relations: ['professor'],
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

  async findOne(id: string): Promise<Turma> {
    const turma = await this.turmaRepository.findOne({
      where: { id },
      relations: ['professor', 'alunos'],
    });

    if (!turma) {
      throw new NotFoundException(`Turma com ID ${id} não encontrada`);
    }

    return turma;
  }

  async update(id: string, updateTurmaDto: UpdateTurmaDto): Promise<Turma> {
    const turma = await this.findOne(id);

    // Regra de negócio 1: Verificar código duplicado ao atualizar
    if (updateTurmaDto.codigo && updateTurmaDto.codigo !== turma.codigo) {
      const existingByCodigo = await this.turmaRepository.findOne({
        where: { codigo: updateTurmaDto.codigo },
      });
      if (existingByCodigo) {
        throw new ConflictException(
          `Já existe outra turma com o código ${updateTurmaDto.codigo}`,
        );
      }
    }

    // Regra de negócio 2: Verificar se o professor existe ao atualizar
    if (updateTurmaDto.professor) {
      try {
        await this.professoresService.findOne(updateTurmaDto.professor);
      } catch (error) {
        throw new BadRequestException(
          `Professor com ID ${updateTurmaDto.professor} não encontrado`,
        );
      }
    }

    // Regra de negócio 3: Verificar capacidade vs alunos existentes
    if (updateTurmaDto.capacidade !== undefined) {
      const alunosCount = turma.alunos ? turma.alunos.length : 0;
      if (updateTurmaDto.capacidade < alunosCount) {
        throw new BadRequestException(
          `Não é possível reduzir a capacidade para ${updateTurmaDto.capacidade} pois a turma já possui ${alunosCount} aluno(s)`,
        );
      }
    }

    const { professor, ...turmaData } = updateTurmaDto;
    Object.assign(turma, {
      ...turmaData,
      professorId: professor || turma.professorId,
    });
    return await this.turmaRepository.save(turma);
  }

  async remove(id: string): Promise<void> {
    const turma = await this.findOne(id);

    // Verificar se tem alunos associados
    if (turma.alunos && turma.alunos.length > 0) {
      throw new BadRequestException(
        `Não é possível excluir a turma pois ela possui ${turma.alunos.length} aluno(s) associado(s)`,
      );
    }

    await this.turmaRepository.remove(turma);
  }
}

