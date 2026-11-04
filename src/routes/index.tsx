import { Suspense, useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { TaskItem } from "@/components/tasks/TaskItem";
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

function IndexContent() {
  const { data: tarefas } = useTarefas();
  const { add, toggle, update, remove } = useTarefaMutations();
  const [editing, setEditing] = useState<Tarefa | null>(null);

  const pendentes = tarefas.filter((t) => t.status === "Pendente").length;
  const concluidas = tarefas.length - pendentes;

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
          <TaskList
            tarefas={tarefas}
            onToggle={(tarefa, status: TaskStatus) =>
              toggle.mutateAsync({ id: tarefa.id, status })
            }
            onEdit={(tarefa) => setEditing(tarefa)}
            onDelete={(tarefa) => remove.mutateAsync(tarefa.id)}
          />
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
