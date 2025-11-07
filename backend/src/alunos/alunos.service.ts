import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Aluno } from './entities/aluno.entity';
import { CreateAlunoDto } from './dto/create-aluno.dto';
import { UpdateAlunoDto } from './dto/update-aluno.dto';
import { QueryAlunoDto } from './dto/query-aluno.dto';
import { TurmasService } from '../turmas/turmas.service';

@Injectable()
export class AlunosService {
  constructor(
    @InjectRepository(Aluno)
    private alunoRepository: Repository<Aluno>,
    private turmasService: TurmasService,
  ) {}

  async create(createAlunoDto: CreateAlunoDto): Promise<Aluno> {
    // Regra de negócio 1: Não permitir matrícula duplicada
    const existingByMatricula = await this.alunoRepository.findOne({
      where: { matricula: createAlunoDto.matricula },
    });
    if (existingByMatricula) {
      throw new ConflictException(
        `Já existe um aluno com a matrícula ${createAlunoDto.matricula}`,
      );
    }

    // Regra de negócio 2: Não permitir email duplicado
    const existingByEmail = await this.alunoRepository.findOne({
      where: { email: createAlunoDto.email },
    });
    if (existingByEmail) {
      throw new ConflictException(
        `Já existe um aluno com o email ${createAlunoDto.email}`,
      );
    }

    // Regra de negócio 3: Verificar capacidade da turma
    if (createAlunoDto.turma) {
      const turma = await this.turmasService.findOne(createAlunoDto.turma);
      const alunosNaTurma = await this.alunoRepository.count({
        where: { turmaId: createAlunoDto.turma },
      });
      if (alunosNaTurma >= turma.capacidade) {
        throw new BadRequestException(
          `A turma ${turma.nome} já atingiu sua capacidade máxima de ${turma.capacidade} alunos`,
        );
      }
    }

    const { turma, ...alunoData } = createAlunoDto;
    const aluno = this.alunoRepository.create({
      ...alunoData,
      turmaId: turma,
    });
    return await this.alunoRepository.save(aluno);
  }

  async findAll(query: QueryAlunoDto) {
    const { search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.nome = Like(`%${search}%`);
    }

    const [data, total] = await this.alunoRepository.findAndCount({
      where,
      skip,
      take: limit,
      relations: ['turma'],
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

  async findOne(id: string): Promise<Aluno> {
    const aluno = await this.alunoRepository.findOne({
      where: { id },
      relations: ['turma', 'notas'],
    });

    if (!aluno) {
      throw new NotFoundException(`Aluno com ID ${id} não encontrado`);
    }

    return aluno;
  }

  async update(id: string, updateAlunoDto: UpdateAlunoDto): Promise<Aluno> {
    const aluno = await this.findOne(id);

    // Regra de negócio 1: Verificar matrícula duplicada ao atualizar
    if (updateAlunoDto.matricula && updateAlunoDto.matricula !== aluno.matricula) {
      const existingByMatricula = await this.alunoRepository.findOne({
        where: { matricula: updateAlunoDto.matricula },
      });
      if (existingByMatricula) {
        throw new ConflictException(
          `Já existe outro aluno com a matrícula ${updateAlunoDto.matricula}`,
        );
      }
    }

    // Regra de negócio 2: Verificar email duplicado ao atualizar
    if (updateAlunoDto.email && updateAlunoDto.email !== aluno.email) {
      const existingByEmail = await this.alunoRepository.findOne({
        where: { email: updateAlunoDto.email },
      });
      if (existingByEmail) {
        throw new ConflictException(
          `Já existe outro aluno com o email ${updateAlunoDto.email}`,
        );
      }
    }

    // Regra de negócio 3: Verificar capacidade da turma ao atualizar
    if (updateAlunoDto.turma) {
      const turma = await this.turmasService.findOne(updateAlunoDto.turma);
      const alunosNaTurma = await this.alunoRepository.count({
        where: { turmaId: updateAlunoDto.turma },
      });
      // Se está mudando de turma, não contar o próprio aluno
      if (aluno.turmaId !== updateAlunoDto.turma && alunosNaTurma >= turma.capacidade) {
        throw new BadRequestException(
          `A turma ${turma.nome} já atingiu sua capacidade máxima de ${turma.capacidade} alunos`,
        );
      }
    }

    const { turma, ...alunoData } = updateAlunoDto;
    Object.assign(aluno, {
      ...alunoData,
      turmaId: turma || aluno.turmaId,
    });
    return await this.alunoRepository.save(aluno);
  }

  async remove(id: string): Promise<void> {
    const aluno = await this.findOne(id);

    // Verificar se tem notas associadas
    if (aluno.notas && aluno.notas.length > 0) {
      throw new BadRequestException(
        `Não é possível excluir o aluno pois ele possui ${aluno.notas.length} nota(s) associada(s)`,
      );
    }

    await this.alunoRepository.remove(aluno);
  }
}

