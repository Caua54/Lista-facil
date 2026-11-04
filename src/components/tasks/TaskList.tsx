import { ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TaskItem } from "@/components/tasks/TaskItem";
import { STATUS_PENDENTE, type TaskStatus, type Tarefa } from "@/lib/tasks";

type TaskListProps = {
  tarefas: Tarefa[];
  onToggle: (tarefa: Tarefa, status: TaskStatus) => Promise<unknown> | void;
  onEdit: (tarefa: Tarefa) => void;
  onDelete: (tarefa: Tarefa) => Promise<unknown> | void;
};

export function TaskList({ tarefas, onToggle, onEdit, onDelete }: TaskListProps) {
  if (tarefas.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-secondary">
            <ClipboardList className="size-6 text-primary" />
          </div>
          <p className="text-lg font-semibold">Você ainda não tem tarefas.</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Que tal adicionar a primeira? Use o formulário acima para começar.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ul className="space-y-4" aria-label="Lista de tarefas">
      {tarefas.map((tarefa) => (
        <li key={tarefa.id}>
          <TaskItem
            tarefa={tarefa}
            onToggle={(t) =>
              onToggle(t, t.status === STATUS_PENDENTE ? "Concluída" : STATUS_PENDENTE)
            }
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </li>
      ))}
    </ul>
  );
}
