import { Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaskForm } from "@/components/tasks/TaskForm";
import { useTarefaMutations, type Tarefa } from "@/hooks/use-tarefas";

type EditTaskModalProps = {
  tarefa: Tarefa | null;
  onClose: () => void;
};

export function EditTaskModal({ tarefa, onClose }: EditTaskModalProps) {
  const { update } = useTarefaMutations();
  const open = tarefa !== null;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar tarefa</DialogTitle>
          <DialogDescription>
            Atualize o título e a descrição da tarefa #{tarefa?.id}.
          </DialogDescription>
        </DialogHeader>
        {tarefa ? (
          <TaskForm
            idPrefix="editar"
            submitLabel="Salvar"
            submitIcon={<Check className="size-4" />}
            pending={update.isPending}
            initialValues={{ titulo: tarefa.titulo, descricao: tarefa.descricao }}
            onCancel={onClose}
            onSubmit={async (values) => {
              await update.mutateAsync({ id: tarefa.id, patch: values });
              onClose();
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
