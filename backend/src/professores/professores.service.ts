import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Professor } from './entities/professor.entity';
import { CreateProfessorDto } from './dto/create-professor.dto';
import { UpdateProfessorDto } from './dto/update-professor.dto';
import { QueryProfessorDto } from './dto/query-professor.dto';

@Injectable()
export class ProfessoresService {
  constructor(
    @InjectRepository(Professor)
    private professorRepository: Repository<Professor>,
  ) {}

  async create(createProfessorDto: CreateProfessorDto): Promise<Professor> {
    // Regra de negócio 1: Não permitir código duplicado
    const existingByCodigo = await this.professorRepository.findOne({
      where: { codigo: createProfessorDto.codigo },
    });
    if (existingByCodigo) {
      throw new ConflictException(
        `Já existe um professor com o código ${createProfessorDto.codigo}`,
      );
    }

    // Regra de negócio 2: Não permitir email duplicado
    const existingByEmail = await this.professorRepository.findOne({
      where: { email: createProfessorDto.email },
    });
    if (existingByEmail) {
      throw new ConflictException(
        `Já existe um professor com o email ${createProfessorDto.email}`,
      );
    }

    // Regra de negócio 3: Validar formato de email institucional
    if (!createProfessorDto.email.includes('@') || !createProfessorDto.email.endsWith('.com')) {
      throw new BadRequestException(
        'Email deve ser um endereço institucional válido (ex: nome@universidade.com)',
      );
    }

    const professor = this.professorRepository.create(createProfessorDto);
    return await this.professorRepository.save(professor);
  }

  async findAll(query: QueryProfessorDto) {
    const { search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.nome = Like(`%${search}%`);
    }

    const [data, total] = await this.professorRepository.findAndCount({
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

  async findOne(id: string): Promise<Professor> {
    const professor = await this.professorRepository.findOne({
      where: { id },
      relations: ['turmas'],
    });

    if (!professor) {
      throw new NotFoundException(`Professor com ID ${id} não encontrado`);
    }

    return professor;
  }

  async update(
    id: string,
    updateProfessorDto: UpdateProfessorDto,
  ): Promise<Professor> {
    const professor = await this.findOne(id);

    // Regra de negócio 1: Verificar código duplicado ao atualizar
    if (updateProfessorDto.codigo && updateProfessorDto.codigo !== professor.codigo) {
      const existingByCodigo = await this.professorRepository.findOne({
        where: { codigo: updateProfessorDto.codigo },
      });
      if (existingByCodigo) {
        throw new ConflictException(
          `Já existe outro professor com o código ${updateProfessorDto.codigo}`,
        );
      }
    }

    // Regra de negócio 2: Verificar email duplicado ao atualizar
    if (updateProfessorDto.email && updateProfessorDto.email !== professor.email) {
      const existingByEmail = await this.professorRepository.findOne({
        where: { email: updateProfessorDto.email },
      });
      if (existingByEmail) {
        throw new ConflictException(
          `Já existe outro professor com o email ${updateProfessorDto.email}`,
        );
      }
    }

    // Regra de negócio 3: Validar email institucional ao atualizar
    if (updateProfessorDto.email) {
      if (!updateProfessorDto.email.includes('@') || !updateProfessorDto.email.endsWith('.com')) {
        throw new BadRequestException(
          'Email deve ser um endereço institucional válido (ex: nome@universidade.com)',
        );
      }
    }

    Object.assign(professor, updateProfessorDto);
    return await this.professorRepository.save(professor);
  }

  async remove(id: string): Promise<void> {
    const professor = await this.findOne(id);

    // Verificar se tem turmas associadas
    if (professor.turmas && professor.turmas.length > 0) {
      throw new BadRequestException(
        `Não é possível excluir o professor pois ele possui ${professor.turmas.length} turma(s) associada(s)`,
      );
    }

    await this.professorRepository.remove(professor);
  }
}

