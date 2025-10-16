# Gerenciamento de Turmas - Mobile (API + Dashboard)

Este projeto é um aplicativo mobile desenvolvido em React Native (Expo) para o gerenciamento de turmas, alunos, professores, disciplinas e notas.

Recentemente, o projeto passou por uma atualização significativa para incluir uma camada de API simulada e um Dashboard completo com visualização de dados.

## 🚀 Características

- **5 CRUDs Completos**: Turmas, Alunos, Professores, Disciplinas e Notas
- **Dashboard Interativo**: Estatísticas e gráficos em tempo real
- **Interface Moderna**: Design minimalista e acadêmico
- **Responsivo**: Funciona perfeitamente em web e mobile
- **Navegação Intuitiva**: Tab navigation com ícones
- **Validação de Formulários**: Usando react-hook-form e Yup
- **Armazenamento Híbrido**: **API (JSON Server) como fonte primária com AsyncStorage como fallback/cache.**
- **Animações Suaves**: Feedback visual e micro-interações

## 📱 Tecnologias Utilizadas

- **React Native** com Expo
- **React Navigation** (Bottom Tabs)
- **React Native Paper** (UI Components)
- **React Hook Form** + **Yup** (Validação)
- **React Native Chart Kit** (Gráficos)
- **AsyncStorage** (Fallback/Cache)
- **JSON Server** (API Simulada)
- **Axios** (Requisições HTTP)
- **Expo Vector Icons** (Ícones)
- **React Native Mask Text** (Máscaras de input)

## 🛠️ Instalação e Execução

### Pré-requisitos

Certifique-se de ter o Node.js e o npm (ou yarn) instalados.

*   [Node.js](https://nodejs.org/en/) (versão LTS recomendada)
*   [Expo CLI](https://docs.expo.dev/get-started/installation/) (opcional, mas útil para desenvolvimento)

### Passos para executar

1.  **Instale as dependências:**
    ```bash
    npm install
    # ou
    # yarn install
    ```

2.  **Iniciar a API (JSON Server)**

    Abra um terminal na pasta raiz do projeto e execute o script:

    ```bash
    npm run json-server
    ```
    A API estará disponível em `http://localhost:3000`. **Este passo é obrigatório.**

3.  **Iniciar o Aplicativo Mobile (Expo)**

    Abra um **segundo terminal** na pasta raiz do projeto e execute:

    ```bash
    npm start
    # ou
    # expo start
    ```

    Isso iniciará o servidor de desenvolvimento do Expo. Você pode então:
    *   Escanear o QR Code com o aplicativo Expo Go no seu celular.
    *   Pressionar `a` para rodar no Android Emulator.
    *   Pressionar `i` para rodar no iOS Simulator.
    *   Pressionar `w` para rodar no navegador (Web).

## 📊 Funcionalidades (Atualizadas)

### Dashboard
- Estatísticas gerais do sistema
- Gráficos de desempenho por disciplina (Barra)
- Distribuição de notas (Chips)
- Status de aprovação/reprovação (Pizza)
- **Responsividade aprimorada** para telas mobile.

### CRUDs (Turmas, Alunos, Professores, Disciplinas, Notas)
- Todas as operações de CRUD agora utilizam a API do JSON Server como fonte primária.
- O AsyncStorage é mantido como uma camada de cache e fallback para operações offline ou em caso de falha da API.

## 🔧 Estrutura do Projeto (Atualizada)

```
src/
├── components/          # Componentes reutilizáveis
├── screens/            # Telas da aplicação (DashboardScreen.js atualizada)
├── services/           # Serviços (apiService.js, DataService.js, StorageService.js)
├── hooks/              # Hooks customizados (useAppData.js atualizado)
├── styles/             # Estilos globais
└── utils/              # Utilitários
```

---
*Desenvolvido por **Manus AI***

