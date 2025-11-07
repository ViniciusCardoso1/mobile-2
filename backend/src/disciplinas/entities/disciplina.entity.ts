import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Nota } from '../../notas/entities/nota.entity';

@Entity('disciplinas')
export class Disciplina {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  nome: string;

  @Column({ length: 50, unique: true })
  codigo: string;

  @Column({ type: 'int' })
  carga_horaria: number;

  @Column({ length: 255 })
  departamento: string;

  @OneToMany(() => Nota, (nota) => nota.disciplina)
  notas: Nota[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

