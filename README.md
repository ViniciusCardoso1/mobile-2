# Sistema de Gerenciamento de Turmas

Um aplicativo React Native desenvolvido com Expo para gerenciamento acadêmico de turmas, alunos, professores, disciplinas e notas.

## 🚀 Características

- **5 CRUDs Completos**: Turmas, Alunos, Professores, Disciplinas e Notas
- **Dashboard Interativo**: Estatísticas e gráficos em tempo real
- **Interface Moderna**: Design minimalista e acadêmico
- **Responsivo**: Funciona perfeitamente em web e mobile
- **Navegação Intuitiva**: Tab navigation com ícones
- **Validação de Formulários**: Usando react-hook-form e Yup
- **Armazenamento Local**: AsyncStorage para persistência de dados
- **Animações Suaves**: Feedback visual e micro-interações

## 📱 Tecnologias Utilizadas

- **React Native** com Expo
- **React Navigation** (Bottom Tabs)
- **React Native Paper** (UI Components)
- **React Hook Form** + **Yup** (Validação)
- **React Native Chart Kit** (Gráficos)
- **AsyncStorage** (Armazenamento)
- **Expo Vector Icons** (Ícones)
- **React Native Mask Text** (Máscaras de input)

## 🛠️ Instalação e Execução

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn
- Expo CLI

### Passos para executar

1. **Clone o repositório**
   ```bash
   git clone [<url-do-repositorio>](https://github.com/ViniciusCardoso1/mobile-2)
   cd mobile-2
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Execute o projeto**
   
   **Para Web:**
   ```bash
   npm run web
   ```
   
   **Para Android:**
   ```bash
   npm run android
   ```
   
   **Para iOS:**
   ```bash
   npm run ios
   ```

4. **Acesse a aplicação**
   - Web: http://localhost:8081
   - Mobile: Escaneie o QR code com o app Expo Go

## 📊 Funcionalidades

### Dashboard
- Estatísticas gerais do sistema
- Gráficos de desempenho por disciplina
- Evolução das médias ao longo do tempo
- Distribuição de notas
- Taxa de aprovação/reprovação

### Gestão de Turmas
- Criar, editar e excluir turmas
- Campos: Nome, Código, Período, Professor, Capacidade
- Busca e filtros

### Gestão de Alunos
- Cadastro completo de alunos
- Campos: Nome, Matrícula, Email, Telefone, Data de Nascimento
- Máscaras para telefone e data
- Validação de email

### Gestão de Professores
- Cadastro de professores
- Campos: Nome, Email, Telefone, Especialidade, Departamento
- Busca por especialidade

### Gestão de Disciplinas
- Cadastro de disciplinas
- Campos: Nome, Código, Carga Horária, Ementa, Pré-requisitos
- Visualização detalhada da ementa

### Gestão de Notas
- Lançamento de notas
- Relacionamento com alunos e disciplinas
- Campos: Aluno, Disciplina, Nota (0-10), Data, Observações
- Validação de notas

## 🎨 Design

O aplicativo segue um design minimalista e acadêmico com:
- Paleta de cores suaves (tons pastéis)
- Tipografia limpa e legível
- Cards com elevação sutil
- Animações suaves
- Interface responsiva
- Feedback visual para ações do usuário

## 📱 Responsividade

- **Mobile**: Layout otimizado para telas pequenas
- **Tablet**: Aproveitamento do espaço extra
- **Web**: Interface desktop completa
- **Rolagem vertical**: Como em aplicativos móveis

## 🔧 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
├── screens/            # Telas da aplicação
├── services/           # Serviços (AsyncStorage)
├── hooks/              # Hooks customizados
├── styles/             # Estilos globais
└── utils/              # Utilitários
```

## 📝 Dados de Exemplo

O aplicativo inicializa com dados de exemplo para demonstração:
- Professores de exemplo
- Disciplinas básicas
- Estrutura para turmas, alunos e notas

## 🚀 Deploy

O projeto está configurado para funcionar no Expo Web e pode ser facilmente deployado em:
- Vercel
- Netlify
- GitHub Pages
- Expo Web Hosting

## 👥 Contribuição

Este projeto foi desenvolvido como trabalho acadêmico seguindo as especificações:
- Interface moderna e minimalista
- 5 CRUDs completos
- Tela especial com dashboard
- Navegação clara
- Responsividade total
- Código organizado e comentado

## 📄 Licença

Este projeto é para fins acadêmicos e educacionais.

---

**Desenvolvido com ❤️ para gerenciamento acadêmico eficiente**

