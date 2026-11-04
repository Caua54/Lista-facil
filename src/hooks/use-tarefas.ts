import {
  queryOptions,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  STATUS_CONCLUIDA,
  STATUS_PENDENTE,
  createTarefa,
  deleteTarefa,
  fetchTarefas,
  updateTarefa,
  type TaskInput,
  type TaskStatus,
  type Tarefa,
} from "@/lib/tasks";

const TAREFAS_KEY = ["tarefas"] as const;

export const tarefasQueryOptions = queryOptions({
  queryKey: TAREFAS_KEY,
  queryFn: fetchTarefas,
});

export function useTarefas() {
  return useSuspenseQuery(tarefasQueryOptions);
}

function toMessage(error: unknown) {
  return error instanceof Error ? error.message : "Algo deu errado. Tente novamente.";
}

/** All task mutations with success/error feedback handled in one place. */
export function useTarefaMutations() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: TAREFAS_KEY });

  const add = useMutation({
    mutationFn: (input: TaskInput) => createTarefa(input),
    onSuccess: () => {
      toast.success("Tarefa adicionada com sucesso!");
      return invalidate();
    },
    onError: (error) => toast.error(toMessage(error)),
  });

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: Partial<TaskInput> }) =>
      updateTarefa(id, patch),
    onSuccess: () => {
      toast.success("Alterações salvas com sucesso!");
      return invalidate();
    },
    onError: (error) => toast.error(toMessage(error)),
  });

  const toggle = useMutation({
    mutationFn: ({ id, status }: { id: number; status: TaskStatus }) =>
      updateTarefa(id, { status }),
    onSuccess: (_tarefa, { status }) => {
      toast.success(
        status === STATUS_CONCLUIDA
          ? "Tarefa concluída!"
          : "Tarefa reaberta como pendente.",
      );
      return invalidate();
    },
    onError: (error) => toast.error(toMessage(error)),
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteTarefa(id),
    onSuccess: () => {
      toast.success("Tarefa excluída com sucesso!");
      return invalidate();
    },
    onError: (error) => toast.error(toMessage(error)),
  });

  return { add, update, toggle, remove };
}

export { STATUS_CONCLUIDA, STATUS_PENDENTE };
export type { Tarefa };
