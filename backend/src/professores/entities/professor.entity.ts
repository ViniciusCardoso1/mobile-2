import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Turma } from '../../turmas/entities/turma.entity';

@Entity('professores')
export class Professor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  nome: string;

  @Column({ length: 50, unique: true })
  codigo: string;

  @Column({ length: 50 })
  titulacao: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 20, nullable: true })
  telefone: string;

  @OneToMany(() => Turma, (turma) => turma.professor)
  turmas: Turma[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

