import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateInitialTables1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Habilitar extensão UUID
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Tabela de Professores
    await queryRunner.createTable(
      new Table({
        name: 'professores',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'nome',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'codigo',
            type: 'varchar',
            length: '50',
            isUnique: true,
          },
          {
            name: 'titulacao',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Tabela de Disciplinas
    await queryRunner.createTable(
      new Table({
        name: 'disciplinas',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'nome',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'codigo',
            type: 'varchar',
            length: '50',
            isUnique: true,
          },
          {
            name: 'carga_horaria',
            type: 'int',
          },
          {
            name: 'departamento',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Tabela de Turmas
    await queryRunner.createTable(
      new Table({
        name: 'turmas',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'nome',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'codigo',
            type: 'varchar',
            length: '50',
            isUnique: true,
          },
          {
            name: 'periodo',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'capacidade',
            type: 'int',
          },
          {
            name: 'professor_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Foreign Key: Turmas -> Professores
    await queryRunner.createForeignKey(
      'turmas',
      new TableForeignKey({
        columnNames: ['professor_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'professores',
        onDelete: 'SET NULL',
      }),
    );

    // Tabela de Alunos
    await queryRunner.createTable(
      new Table({
        name: 'alunos',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'nome',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'matricula',
            type: 'varchar',
            length: '50',
            isUnique: true,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'telefone',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'turma_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Foreign Key: Alunos -> Turmas
    await queryRunner.createForeignKey(
      'alunos',
      new TableForeignKey({
        columnNames: ['turma_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'turmas',
        onDelete: 'SET NULL',
      }),
    );

    // Tabela de Notas
    await queryRunner.createTable(
      new Table({
        name: 'notas',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'nota',
            type: 'decimal',
            precision: 4,
            scale: 2,
          },
          {
            name: 'data',
            type: 'date',
          },
          {
            name: 'observacoes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'aluno_id',
            type: 'uuid',
          },
          {
            name: 'disciplina_id',
            type: 'uuid',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Foreign Keys: Notas -> Alunos e Disciplinas
    await queryRunner.createForeignKey(
      'notas',
      new TableForeignKey({
        columnNames: ['aluno_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'alunos',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'notas',
      new TableForeignKey({
        columnNames: ['disciplina_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'disciplinas',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('notas', true);
    await queryRunner.dropTable('alunos', true);
    await queryRunner.dropTable('turmas', true);
    await queryRunner.dropTable('disciplinas', true);
    await queryRunner.dropTable('professores', true);
  }
}

