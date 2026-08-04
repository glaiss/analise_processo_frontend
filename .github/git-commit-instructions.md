# Instruções para mensagens de commit

## Idioma

- Escreva **todas** as mensagens de commit em **português (pt-BR)**.
- Use **imperativo, voz ativa**: "adiciona", "corrige", "remove", "atualiza", "implementa".
- Não use ponto final no título.

## Formato (Conventional Commits)

Use o padrão `tipo: descrição`:

| Tipo | Uso |
|------|-----|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `refactor` | Refatoração sem mudança de comportamento |
| `test` | Adição ou ajuste de testes |
| `docs` | Alterações de documentação |
| `perf` | Melhoria de performance |
| `build` | Alterações no build ou dependências |
| `ci` | Alterações em CI/CD e workflows |
| `style` | Formatação sem impacto em lógica |
| `chore` | Tarefas de manutenção (bump de versão, etc.) |
| `revert` | Reversão de um commit |
| `merge` | Commits de merge (manter o texto padrão do Git) |

### Regras

- Título com no máximo **50 caracteres** (até 72 no máximo).
- Corpo opcional, explicando **o que** e **por que**, separado do título por uma linha em branco.
- Linhas do corpo limitadas a **72 caracteres**.
- Use `-` para listar pontos no corpo.
- Referencie issues e PRs com `#numero`.
- Para bump de versão gerado por CI, mantenha o padrão do projeto: `chore: bump version to X.Y.Z [skip ci]`.
- Para merges, mantenha o formato do Git: `Merge remote-tracking branch 'origin/develop' into develop`.

## Exemplos

```
feat: adiciona regra de interesse para polo ativo sem advogado

- Considera partes ignoradas no polo passivo
- Retorna score de interesse quando o polo ativo não possui advogado
```

```
fix: corrige validação de transição de status na atribuição

Resolve NullPointerException quando o status anterior é nulo.
```

```
test: adiciona testes para AdvogadoVinculadoHipoteseService
```

```
chore: bump version to 1.28.0 [skip ci]
```
