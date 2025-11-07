import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Aluno } from '../../alunos/entities/aluno.entity';
import { Disciplina } from '../../disciplinas/entities/disciplina.entity';

@Entity('notas')
export class Nota {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 4, scale: 2 })
  nota: number;

  @Column({ type: 'date' })
  data: Date;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @Column({ name: 'aluno_id' })
  alunoId: string;

  @ManyToOne(() => Aluno, (aluno) => aluno.notas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'aluno_id' })
  aluno: Aluno;

  @Column({ name: 'disciplina_id' })
  disciplinaId: string;

  @ManyToOne(() => Disciplina, (disciplina) => disciplina.notas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'disciplina_id' })
  disciplina: Disciplina;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

