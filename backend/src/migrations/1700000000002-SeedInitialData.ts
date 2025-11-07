import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedInitialData1700000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Inserir Professores
    const professores = await queryRunner.query(`
      INSERT INTO professores (id, nome, codigo, titulacao, email, "createdAt", "updatedAt")
      VALUES
        (uuid_generate_v4(), 'Dr. João Pereira', 'P001', 'Doutor', 'joao@universidade.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (uuid_generate_v4(), 'Ms. Maria Souza', 'P002', 'Mestre', 'maria@universidade.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (uuid_generate_v4(), 'Esp. Fernanda Lima', 'P003', 'Especialista', 'fernanda@universidade.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id, codigo;
    `);

    const professorMap = {};
    professores.forEach((p) => {
      professorMap[p.codigo] = p.id;
    });

    // Inserir Disciplinas
    const disciplinas = await queryRunner.query(`
      INSERT INTO disciplinas (id, nome, codigo, carga_horaria, departamento, "createdAt", "updatedAt")
      VALUES
        (uuid_generate_v4(), 'Lógica de Programação', 'LP101', 60, 'Ciências da Computação', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (uuid_generate_v4(), 'Engenharia de Software', 'ES203', 80, 'Engenharia', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (uuid_generate_v4(), 'Redes de Computadores', 'RC301', 60, 'Tecnologia', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id, codigo;
    `);

    const disciplinaMap = {};
    disciplinas.forEach((d) => {
      disciplinaMap[d.codigo] = d.id;
    });

    // Inserir Turmas
    const turmas = await queryRunner.query(`
      INSERT INTO turmas (id, nome, codigo, periodo, capacidade, professor_id, "createdAt", "updatedAt")
      VALUES
        (uuid_generate_v4(), 'Desenvolvimento Web Avançado', 'WEB401', '2025/1', 22, $1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (uuid_generate_v4(), 'Banco de Dados NoSQL', 'BDD305', '2025/2', 18, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id;
    `, [professorMap['P001'], professorMap['P002']]);

    const turmaIds = turmas.map((t) => t.id);

    // Inserir Alunos
    const alunos = await queryRunner.query(`
      INSERT INTO alunos (id, nome, matricula, email, telefone, turma_id, "createdAt", "updatedAt")
      VALUES
        (uuid_generate_v4(), 'Ana Clara', 'A001', 'ana@email.com', '11999991111', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (uuid_generate_v4(), 'Bruno Silva', 'A002', 'bruno@email.com', '11999992222', $1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (uuid_generate_v4(), 'Carlos Oliveira', 'A003', 'carlos@email.com', '11999993333', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id;
    `, [turmaIds[0]]);

    const alunoIds = alunos.map((a) => a.id);

    // Inserir Notas
    await queryRunner.query(`
      INSERT INTO notas (id, nota, data, observacoes, aluno_id, disciplina_id, "createdAt", "updatedAt")
      VALUES
        (uuid_generate_v4(), 9.5, '2025-06-10', 'Excelente desempenho na prova final.', $1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (uuid_generate_v4(), 7.0, '2025-06-15', 'Aprovado com ressalvas no projeto.', $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (uuid_generate_v4(), 8.0, '2025-06-12', 'Bom trabalho nos exercícios práticos.', $5, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [
      alunoIds[0],
      disciplinaMap['LP101'],
      alunoIds[1],
      disciplinaMap['ES203'],
      alunoIds[2],
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM notas`);
    await queryRunner.query(`DELETE FROM alunos`);
    await queryRunner.query(`DELETE FROM turmas`);
    await queryRunner.query(`DELETE FROM disciplinas`);
    await queryRunner.query(`DELETE FROM professores`);
  }
}

