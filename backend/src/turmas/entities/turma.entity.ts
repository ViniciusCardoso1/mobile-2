import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Professor } from '../../professores/entities/professor.entity';
import { Aluno } from '../../alunos/entities/aluno.entity';

@Entity('turmas')
export class Turma {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  nome: string;

  @Column({ length: 50, unique: true })
  codigo: string;

  @Column({ length: 50 })
  periodo: string;

  @Column({ type: 'int' })
  capacidade: number;

  @Column({ name: 'professor_id', nullable: true })
  professorId: string;

  @ManyToOne(() => Professor, (professor) => professor.turmas, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'professor_id' })
  professor: Professor;

  @OneToMany(() => Aluno, (aluno) => aluno.turma)
  alunos: Aluno[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

