<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- The app is public (no login): "tarefas" data goes through the browser Supabase client with anon RLS policies; never add auth or server functions for it unless asked.
- All reads/writes to "tarefas" go through `src/lib/tasks.ts`; components use `src/hooks/use-tarefas.ts`. No localStorage or local-only state as a data substitute.
- UI is entirely pt-BR; validation limits (título 100, descrição 500) live in `src/lib/tasks.ts` and are covered by `src/test/task-validation.test.ts.`
