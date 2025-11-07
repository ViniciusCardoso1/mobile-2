# Backend - Sistema de Gerenciamento Acadêmico

Backend desenvolvido com NestJS, TypeORM e PostgreSQL para o aplicativo mobile de gerenciamento acadêmico.

## 🚀 Tecnologias

- **NestJS** - Framework Node.js
- **TypeORM** - ORM para TypeScript
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação
- **Class Validator** - Validação de dados

## 📋 Pré-requisitos

- Node.js (v18 ou superior)
- PostgreSQL (v12 ou superior)
- npm ou yarn

## 🛠️ Instalação

1. **Clone o repositório e entre na pasta do backend:**
   ```bash
   cd backend
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   
   Crie um arquivo `.env` na raiz da pasta `backend` com o seguinte conteúdo:
   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_NAME=mobile_db

   # JWT
   JWT_SECRET=your-secret-key-change-in-production
   JWT_EXPIRES_IN=7d

   # Server
   PORT=3000
   ```

4. **Crie o banco de dados PostgreSQL:**
   ```sql
   CREATE DATABASE mobile_db;
   ```

5. **Execute as migrations:**
   ```bash
   npm run migration:run
   ```
   
   As migrations irão:
   - Criar todas as tabelas (professores, disciplinas, turmas, alunos, notas)
   - Inserir dados iniciais para testes

## 🏃 Executando o Projeto

### Modo Desenvolvimento
```bash
npm run start:dev
```

O servidor estará rodando em `http://localhost:3000`

### Modo Produção
```bash
npm run build
npm run start:prod
```

## 📚 Estrutura do Projeto

```
backend/
├── src/
│   ├── alunos/          # Módulo de Alunos
│   ├── disciplinas/     # Módulo de Disciplinas
│   ├── professores/     # Módulo de Professores
│   ├── turmas/          # Módulo de Turmas
│   ├── notas/           # Módulo de Notas
│   ├── auth/            # Módulo de Autenticação
│   ├── dashboard/       # Módulo de Dashboard
│   ├── config/           # Configurações
│   └── migrations/         # Migrations do TypeORM
├── postman_collection.json  # Collection do Postman
└── README.md
```

## 🔌 Endpoints da API

### Autenticação
- `POST /auth/login` - Login (usuário: admin, senha: admin123)

### Professores
- `GET /professores` - Listar professores (com paginação e busca)
- `GET /professores/:id` - Buscar professor por ID
- `POST /professores` - Criar professor
- `PATCH /professores/:id` - Atualizar professor
- `DELETE /professores/:id` - Deletar professor

### Disciplinas
- `GET /disciplinas` - Listar disciplinas (com paginação e busca)
- `GET /disciplinas/:id` - Buscar disciplina por ID
- `POST /disciplinas` - Criar disciplina
- `PATCH /disciplinas/:id` - Atualizar disciplina
- `DELETE /disciplinas/:id` - Deletar disciplina

### Turmas
- `GET /turmas` - Listar turmas (com paginação e busca)
- `GET /turmas/:id` - Buscar turma por ID
- `POST /turmas` - Criar turma
- `PATCH /turmas/:id` - Atualizar turma
- `DELETE /turmas/:id` - Deletar turma

### Alunos
- `GET /alunos` - Listar alunos (com paginação e busca)
- `GET /alunos/:id` - Buscar aluno por ID
- `POST /alunos` - Criar aluno
- `PATCH /alunos/:id` - Atualizar aluno
- `DELETE /alunos/:id` - Deletar aluno

### Notas
- `GET /notas` - Listar notas (com paginação, busca e filtros)
- `GET /notas/:id` - Buscar nota por ID
- `POST /notas` - Criar nota
- `PATCH /notas/:id` - Atualizar nota
- `DELETE /notas/:id` - Deletar nota

### Dashboard
- `GET /dashboard/stats` - Estatísticas do dashboard

## 📋 Regras de Negócio

### Professores (3 regras)
1. **Código duplicado**: Não permite criar professor com código já existente
2. **Email duplicado**: Não permite criar professor com email já existente
3. **Email institucional**: Valida formato de email institucional (deve terminar com .com)

### Disciplinas (3 regras)
1. **Código duplicado**: Não permite criar disciplina com código já existente
2. **Carga horária múltiplo de 10**: Carga horária deve ser múltiplo de 10 horas
3. **Nome duplicado**: Não permite criar disciplina com nome já existente

### Turmas (3 regras)
1. **Código duplicado**: Não permite criar turma com código já existente
2. **Professor válido**: Verifica se o professor existe antes de associar
3. **Código e período únicos**: Não permite mesma combinação de código e período

### Alunos (3 regras)
1. **Matrícula duplicada**: Não permite criar aluno com matrícula já existente
2. **Email duplicado**: Não permite criar aluno com email já existente
3. **Capacidade da turma**: Verifica se a turma não excedeu sua capacidade ao adicionar aluno

### Notas (3 regras)
1. **Aluno válido**: Verifica se o aluno existe antes de criar nota
2. **Disciplina válida**: Verifica se a disciplina existe antes de criar nota
3. **Nota duplicada**: Não permite criar nota duplicada (mesmo aluno, mesma disciplina, mesma data)

## 🧪 Testando com Postman

1. Importe a collection `postman_collection.json` no Postman
2. Configure a variável `base_url` como `http://localhost:3000`
3. Execute as requisições para testar os endpoints e regras de negócio

## 🔧 Migrations

### Criar nova migration
```bash
npm run migration:generate -- -n NomeDaMigration
```

### Executar migrations
```bash
npm run migration:run
```

### Reverter última migration
```bash
npm run migration:revert
```

## 📊 Recursos Diferenciais

- ✅ **Autenticação JWT**: Sistema de autenticação com tokens
- ✅ **Paginação**: Todos os endpoints de listagem suportam paginação
- ✅ **Busca avançada**: Filtros e busca por texto nos endpoints
- ✅ **Dashboard**: Endpoint dedicado para estatísticas do sistema
- ✅ **Validação robusta**: Validação de dados com class-validator
- ✅ **Tratamento de erros**: Mensagens de erro específicas para cada regra de negócio

## 🐛 Solução de Problemas

### Erro de conexão com banco de dados
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no arquivo `.env`
- Verifique se o banco de dados `mobile_db` foi criado

### Erro ao executar migrations
- Certifique-se de que o banco de dados existe
- Verifique as permissões do usuário do PostgreSQL
- Execute `npm run migration:revert` e depois `npm run migration:run` novamente

## 📝 Notas

- As migrations são executadas automaticamente ao iniciar o servidor
- Os dados iniciais são inseridos pela migration de seed
- O sistema usa UUIDs como identificadores primários
- CORS está habilitado para permitir requisições do frontend

## 👤 Autor

Desenvolvido para o trabalho de Mobile 2

