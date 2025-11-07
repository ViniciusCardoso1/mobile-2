import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aluno } from '../alunos/entities/aluno.entity';
import { Turma } from '../turmas/entities/turma.entity';
import { Nota } from '../notas/entities/nota.entity';
import { Disciplina } from '../disciplinas/entities/disciplina.entity';
import { Professor } from '../professores/entities/professor.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Aluno)
    private alunoRepository: Repository<Aluno>,
    @InjectRepository(Turma)
    private turmaRepository: Repository<Turma>,
    @InjectRepository(Nota)
    private notaRepository: Repository<Nota>,
    @InjectRepository(Disciplina)
    private disciplinaRepository: Repository<Disciplina>,
    @InjectRepository(Professor)
    private professorRepository: Repository<Professor>,
  ) {}

  async getStats() {
    const [
      totalAlunos,
      totalTurmas,
      totalProfessores,
      totalDisciplinas,
      totalNotas,
    ] = await Promise.all([
      this.alunoRepository.count(),
      this.turmaRepository.count(),
      this.professorRepository.count(),
      this.disciplinaRepository.count(),
      this.notaRepository.count(),
    ]);

    // Média geral de notas
    const notas = await this.notaRepository.find();
    const mediaGeral =
      notas.length > 0
        ? notas.reduce((sum, nota) => sum + Number(nota.nota), 0) / notas.length
        : 0;

    // Distribuição de notas
    const distribuicaoNotas = {
      aprovados: notas.filter((n) => Number(n.nota) >= 7).length,
      recuperacao: notas.filter((n) => Number(n.nota) >= 5 && Number(n.nota) < 7).length,
      reprovados: notas.filter((n) => Number(n.nota) < 5).length,
    };

    // Notas por disciplina
    const notasComDisciplina = await this.notaRepository.find({
      relations: ['disciplina'],
    });
    const notasPorDisciplina = {};
    notasComDisciplina.forEach((nota) => {
      const disciplinaNome = nota.disciplina.nome;
      if (!notasPorDisciplina[disciplinaNome]) {
        notasPorDisciplina[disciplinaNome] = [];
      }
      notasPorDisciplina[disciplinaNome].push(Number(nota.nota));
    });

    const mediaPorDisciplina = Object.keys(notasPorDisciplina).map((nome) => {
      const notas = notasPorDisciplina[nome];
      return {
        disciplina: nome,
        media: notas.reduce((sum, n) => sum + n, 0) / notas.length,
        quantidade: notas.length,
      };
    });

    // Status dos alunos (com base na média)
    const alunosComNotas = await this.alunoRepository.find({
      relations: ['notas'],
    });

    const statusAlunos = {
      aprovados: 0,
      recuperacao: 0,
      reprovados: 0,
    };

    alunosComNotas.forEach((aluno) => {
      if (aluno.notas && aluno.notas.length > 0) {
        const media =
          aluno.notas.reduce((sum, nota) => sum + Number(nota.nota), 0) /
          aluno.notas.length;
        if (media >= 7) {
          statusAlunos.aprovados++;
        } else if (media >= 5) {
          statusAlunos.recuperacao++;
        } else {
          statusAlunos.reprovados++;
        }
      }
    });

    return {
      totais: {
        alunos: totalAlunos,
        turmas: totalTurmas,
        professores: totalProfessores,
        disciplinas: totalDisciplinas,
        notas: totalNotas,
      },
      mediaGeral: Number(mediaGeral.toFixed(2)),
      distribuicaoNotas,
      mediaPorDisciplina,
      statusAlunos,
    };
  }
}

