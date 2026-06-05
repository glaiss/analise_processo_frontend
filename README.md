# Análise de Processos - Frontend

Este é o frontend da aplicação de Análise de Processos, desenvolvido em **Angular 21** com foco em alta performance e experiência do usuário (UX).

## 🚀 Tecnologias Utilizadas

- **Angular 21**: Framework principal.
- **Angular Material & CDK**: Componentes de UI e acessibilidade.
- **Sass (SCSS)**: Pré-processador CSS para estilos modernos e modulares.
- **Vitest**: Framework de testes unitários ultrarrápido.
- **Prettier**: Formatação de código padronizada.
- **Vercel**: Hospedagem e infraestrutura de deploy.

## 🛠️ Desenvolvimento Local

### Pré-requisitos
- Node.js 20+
- npm (gerenciador de pacotes)

### Comandos Principais
```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (com proxy para o backend)
npm start

# Executar testes unitários
npm test

# Gerar build de produção
npm run build
```

---

## 🏗️ CI/CD (GitHub Actions)

O projeto possui um workflow automatizado que gerencia o ciclo de vida da aplicação.

### Fluxo do Workflow:
1. **Validação**: Roda em todos os Pull Requests para a `main`. Executa build e testes.
2. **Versionamento**: Após o merge na `main`, o sistema incrementa automaticamente a versão (patch) no `package.json`.
3. **Deploy**: O deploy é realizado automaticamente para a **Vercel** após o incremento de versão.

### 🔑 Variáveis Necessárias (GitHub Secrets)

Para que o deploy automático funcione, você deve configurar os seguintes **Secrets** no seu repositório GitHub em `Settings > Secrets and variables > Actions`:

| Secret | Descrição | Onde encontrar |
| :--- | :--- | :--- |
| `VERCEL_TOKEN` | Token de autenticação da API | Vercel Dashboard > Account Settings > Tokens |
| `VERCEL_ORG_ID` | ID da organização/usuário | No arquivo `.vercel/project.json` (após rodar `vercel link` localmente) ou nas configurações do time na Vercel. |
| `VERCEL_PROJECT_ID` | ID do projeto na Vercel | No arquivo `.vercel/project.json`. |

> **Nota**: O `GITHUB_TOKEN` padrão do repositório também é utilizado, mas ele já é fornecido automaticamente pelo GitHub Actions para o incremento de versão.

---

## 📁 Estrutura do Projeto

- `src/app/core`: Singleton services, interceptors, e modelos globais.
- `src/app/features`: Módulos de funcionalidades específicas da aplicação.
- `src/app/shared`: Componentes, diretivas e pipes reutilizáveis.
- `src/assets`: Arquivos estáticos (imagens, fontes).
- `public`: Arquivos públicos (favicon, etc).
