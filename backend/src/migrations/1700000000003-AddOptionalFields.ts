import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddOptionalFields1700000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adicionar campo telefone em professores
    await queryRunner.addColumn(
      'professores',
      new TableColumn({
        name: 'telefone',
        type: 'varchar',
        length: '20',
        isNullable: true,
      }),
    );

    // Adicionar campo ementa em disciplinas
    await queryRunner.addColumn(
      'disciplinas',
      new TableColumn({
        name: 'ementa',
        type: 'text',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('disciplinas', 'ementa');
    await queryRunner.dropColumn('professores', 'telefone');
  }
}

