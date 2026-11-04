import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, Pencil, RotateCcw, Trash2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  STATUS_CONCLUIDA,
  STATUS_PENDENTE,
  type Tarefa,
} from "@/lib/tasks";

type TaskItemProps = {
  tarefa: Tarefa;
  onToggle: (tarefa: Tarefa) => Promise<unknown> | void;
  onEdit: (tarefa: Tarefa) => void;
  onDelete: (tarefa: Tarefa) => Promise<unknown> | void;
};

export function TaskItem({ tarefa, onToggle, onEdit, onDelete }: TaskItemProps) {
  const [pendingAction, setPendingAction] = useState<"toggle" | "delete" | null>(
    null,
  );
  const concluida = tarefa.status === STATUS_CONCLUIDA;
  const busy = pendingAction !== null;

  async function handleToggle() {
    setPendingAction("toggle");
    try {
      await onToggle(tarefa);
    } finally {
      setPendingAction(null);
    }
  }

  async function handleDelete() {
    setPendingAction("delete");
    try {
      await onDelete(tarefa);
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <Card
      className={
        concluida
          ? "border-status-done/40 bg-status-done/5 transition-colors"
          : "transition-colors"
      }
    >
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Tarefa #{tarefa.id}
          </span>
          <Badge
            className={
              concluida
                ? "bg-status-done text-status-done-foreground"
                : "bg-status-pending text-status-pending-foreground"
            }
          >
            {tarefa.status}
          </Badge>
        </div>

        <div>
          <h3
            className={
              concluida
                ? "text-lg font-semibold text-muted-foreground line-through"
                : "text-lg font-semibold"
            }
          >
            {tarefa.titulo}
          </h3>
          <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
            {tarefa.descricao}
          </p>
          <p className="mt-2 text-xs text-muted-foreground/80">
            Criada em{" "}
            {format(new Date(tarefa.created_at), "dd/MM/yyyy 'às' HH:mm", {
              locale: ptBR,
            })}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {concluida ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleToggle}
              disabled={busy}
              aria-label={`Reabrir a tarefa ${tarefa.titulo}`}
            >
              <RotateCcw className="size-4" />
              Reabrir
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={handleToggle}
              disabled={busy}
              aria-label={`Concluir a tarefa ${tarefa.titulo}`}
            >
              <Check className="size-4" />
              Concluir
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onEdit(tarefa)}
            disabled={busy}
            aria-label={`Editar a tarefa ${tarefa.titulo}`}
          >
            <Pencil className="size-4" />
            Editar
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={busy}
                aria-label={`Excluir a tarefa ${tarefa.titulo}`}
              >
                <Trash2 className="size-4" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza que deseja excluir esta tarefa?</AlertDialogTitle>
                <AlertDialogDescription>
                  Essa ação não pode ser desfeita. A tarefa{" "}
                  <strong>{tarefa.titulo}</strong> será removida permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={pendingAction === "delete"}>
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={pendingAction === "delete"}
                  onClick={(event) => {
                    event.preventDefault();
                    void handleDelete();
                  }}
                >
                  {pendingAction === "delete" ? "Excluindo..." : "Excluir"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
