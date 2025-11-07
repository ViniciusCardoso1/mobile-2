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
import { Turma } from '../../turmas/entities/turma.entity';
import { Nota } from '../../notas/entities/nota.entity';

@Entity('alunos')
export class Aluno {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  nome: string;

  @Column({ length: 50, unique: true })
  matricula: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 20 })
  telefone: string;

  @Column({ name: 'turma_id', nullable: true })
  turmaId: string;

  @ManyToOne(() => Turma, (turma) => turma.alunos, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'turma_id' })
  turma: Turma;

  @OneToMany(() => Nota, (nota) => nota.aluno)
  notas: Nota[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

