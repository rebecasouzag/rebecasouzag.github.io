# rebecasouzag.github.io: portfólio em narrativa por rolagem

## Propósito

Um site pessoal que conta a história da dona do perfil (origem, IFPI, Ciência da Computação na UFCG, projetos, o que busca) em
capítulos que se revelam conforme a rolagem. Só em português. Publicado em `https://rebecasouzag.github.io`.

## Como trabalhar neste projeto

- **Quem desenvolve está aprendendo com o que constrói.** Explique cada decisão e o conceito envolvido (geração estática, ilhas,
  scroll-driven animations, CI/CD...) antes ou junto da mudança: o que foi decidido, por quê e como será medido.
- **Nada é inventado.** Todo fato do site vem das entrevistas (`roteiro/respostas/`) ou de fonte verificável (repositórios, documentos).
  O que faltar fica como `TODO` no texto, nunca preenchido por suposição.
- **Privacidade:** antes de citar projetos de terceiros ou de organizações, nomes de outras pessoas ou um
  contato (e-mail, telefone, LinkedIn), confirmar com a dona e registrar em `roteiro/decisoes.md`.
- **Commits:** permitidos neste repositório, pequenos e descritivos (`tipo: descrição` em português), com o usuário git configurado.
  **Sem `Co-Authored-By` ou qualquer outra linha de atribuição ao Claude.** Estrutura e comportamento não mudam no mesmo commit.
  Pushes para `main` são permitidos; operações destrutivas (force push, reescrever histórico) precisam de confirmação.

## Fases

1. **Roteiro** (atual): entrevistas em `roteiro/`. Cada sessão vira `roteiro/respostas/NN-AAAA-MM-DD.md`; os capítulos são consolidados
   em `roteiro/capitulos.md`.
2. **Esqueleto:** Astro com content collections (um `.md` por capítulo e por projeto, frontmatter validado), sem animação.
3. **Narrativa por rolagem:** CSS scroll-driven animations (`animation-timeline: view()` / `scroll()`) dentro de `@supports`; sem
   suporte, o conteúdo aparece normalmente; `prefers-reduced-motion` desliga o movimento. JS só se uma medição justificar.
4. **Acabamento:** SEO, Open Graph, sitemap, 404, favicon.
5. **Publicação:** GitHub Actions (`withastro/action` + `actions/deploy-pages`); link no README do perfil (`rebecasouzag/rebecasouzag`).

## Stack e orçamento

- Astro (versão atual conferida na instalação), CSS puro com variáveis, tema claro/escuro por `prefers-color-scheme`,
  no máximo 2 famílias de fonte. Sem Tailwind nem biblioteca de componentes.
- Orçamento: JS inicial ≈ 0 (teto 50 KB gzip), CSS ≤ 30 KB gzip, LCP ≤ 2,5 s, CLS ≤ 0,1, Lighthouse mobile ≥ 90.
- Acessibilidade: HTML semântico, contraste AA, navegação por teclado, sem rolagem horizontal em 360 px.
- Cada etapa termina com `npm run build` limpo e as medições comparadas com o orçamento.
