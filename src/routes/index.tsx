import { Suspense, useState } from "react";
import { Eraser, Plus, Search } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EditTaskModal } from "@/components/tasks/EditTaskModal";
import { TaskForm } from "@/components/tasks/TaskForm";
import { TaskItem } from "@/components/tasks/TaskItem";
import { TaskList } from "@/components/tasks/TaskList";
import {
  tarefasQueryOptions,
  useTarefaMutations,
  useTarefas,
  type Tarefa,
} from "@/hooks/use-tarefas";
import type { TaskStatus } from "@/lib/tasks";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lista Fácil" },
      {
        name: "description",
        content:
          "Organize seus estudos e suas tarefas do dia a dia com o Lista Fácil.",
      },
      { property: "og:title", content: "Lista Fácil" },
      {
        property: "og:description",
        content: "Organize seus estudos e suas tarefas do dia a dia com o Lista Fácil.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(tarefasQueryOptions);
  },
  errorComponent: TaskErrorComponent,
  component: Index,
});

function TaskErrorComponent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-semibold">Não foi possível carregar as tarefas</h1>
      <p className="text-sm text-muted-foreground">
        Verifique sua conexão e tente novamente.
      </p>
      <a
        href="/"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Tentar novamente
      </a>
    </div>
  );
}

function TaskListSkeleton() {
  return (
    <div className="space-y-4" aria-label="Carregando tarefas">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="space-y-3 p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-9 w-40" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

type FiltroStatus = "todas" | "pendentes" | "concluidas";

const FILTROS: { valor: FiltroStatus; rotulo: string }[] = [
  { valor: "todas", rotulo: "Todas" },
  { valor: "pendentes", rotulo: "Pendentes" },
  { valor: "concluidas", rotulo: "Concluídas" },
];

function IndexContent() {
  const { data: tarefas } = useTarefas();
  const { add, toggle, update, remove, clearDone } = useTarefaMutations();
  const [editing, setEditing] = useState<Tarefa | null>(null);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<FiltroStatus>("todas");

  const pendentes = tarefas.filter((t) => t.status === "Pendente").length;
  const concluidas = tarefas.length - pendentes;

  const termo = busca.trim().toLowerCase();
  const tarefasFiltradas = tarefas.filter((t) => {
    if (filtro === "pendentes" && t.status !== "Pendente") return false;
    if (filtro === "concluidas" && t.status !== "Concluída") return false;
    if (
      termo &&
      !t.titulo.toLowerCase().includes(termo) &&
      !t.descricao.toLowerCase().includes(termo)
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card">
        <div className="mx-auto w-full max-w-2xl px-4 py-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">
            Lista Fácil
          </h1>
          <p className="mt-2 text-muted-foreground">
            Organize seus estudos e suas tarefas do dia a dia
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 py-8">
        <section aria-label="Adicionar tarefa">
          <Card>
            <CardHeader>
              <CardTitle>Nova tarefa</CardTitle>
              <CardDescription>
                Preencha os campos abaixo para adicionar uma tarefa à sua lista.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TaskForm
                idPrefix="nova"
                submitLabel="Adicionar tarefa"
                submitIcon={<Plus className="size-4" />}
                pending={add.isPending}
                onSubmit={async (values) => {
                  await add.mutateAsync(values);
                }}
              />
            </CardContent>
          </Card>
        </section>

        <section aria-label="Suas tarefas" className="mt-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-semibold">Suas tarefas</h2>
            {tarefas.length > 0 ? (
              <p className="text-sm text-muted-foreground">
                {tarefas.length} {tarefas.length === 1 ? "tarefa" : "tarefas"} ·{" "}
                {pendentes} {pendentes === 1 ? "pendente" : "pendentes"} ·{" "}
                {concluidas} {concluidas === 1 ? "concluída" : "concluídas"}
              </p>
            ) : null}
          </div>

          {tarefas.length > 0 ? (
            <div className="mb-4 space-y-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por título ou descrição..."
                  aria-label="Buscar tarefas"
                  className="pl-9"
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-1 rounded-lg bg-secondary p-1" role="group" aria-label="Filtrar por status">
                  {FILTROS.map(({ valor, rotulo }) => (
                    <button
                      key={valor}
                      type="button"
                      onClick={() => setFiltro(valor)}
                      aria-pressed={filtro === valor}
                      className={
                        filtro === valor
                          ? "rounded-md bg-card px-3 py-1.5 text-sm font-medium shadow-sm"
                          : "rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                      }
                    >
                      {rotulo}
                    </button>
                  ))}
                </div>
                {concluidas > 0 ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button type="button" variant="outline" size="sm" disabled={clearDone.isPending}>
                        <Eraser className="size-4" />
                        Limpar concluídas
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Limpar tarefas concluídas?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Essa ação não pode ser desfeita. {concluidas}{" "}
                          {concluidas === 1 ? "tarefa concluída será removida" : "tarefas concluídas serão removidas"}{" "}
                          permanentemente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={clearDone.isPending}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={clearDone.isPending}
                          onClick={(event) => {
                            event.preventDefault();
                            void clearDone.mutateAsync();
                          }}
                        >
                          {clearDone.isPending ? "Limpando..." : "Limpar"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : null}
              </div>
            </div>
          ) : null}

          {tarefas.length > 0 && tarefasFiltradas.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center">
                <p className="font-medium">Nenhuma tarefa encontrada.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tente outro termo de busca ou filtro.
                </p>
              </CardContent>
            </Card>
          ) : (
            <TaskList
              tarefas={tarefasFiltradas}
              onToggle={(tarefa, status: TaskStatus) =>
                toggle.mutateAsync({ id: tarefa.id, status })
              }
              onEdit={(tarefa) => setEditing(tarefa)}
              onDelete={(tarefa) => remove.mutateAsync(tarefa.id)}
            />
          )}
        </section>
      </main>

      <EditTaskModal tarefa={editing} onClose={() => setEditing(null)} />
    </div>
  );
}

function Index() {
  return (
    <Suspense fallback={<TaskListSkeleton />}>
      <IndexContent />
    </Suspense>
  );
}
