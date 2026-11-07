import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

/**
 * Single point of access to the "tarefas" table in Supabase.
 * All reads and writes for the app go through this module.
 */

export const STATUS_PENDENTE = "Pendente";
export const STATUS_CONCLUIDA = "Concluída";
export type TaskStatus = typeof STATUS_PENDENTE | typeof STATUS_CONCLUIDA;

export type Tarefa = Tables<"tarefas">;
export type TaskInput = { titulo: string; descricao: string };
export type FieldErrors = { titulo?: string; descricao?: string };

const TAREFA_COLUMNS = "id, titulo, descricao, status, created_at, updated_at";

export const TAREFA_TITULO_MAX = 100;
export const TAREFA_DESCRICAO_MAX = 500;

/** Validates title and description; returns one message per invalid field. */
export function validateTask(values: TaskInput): FieldErrors {
  const errors: FieldErrors = {};
  const titulo = values.titulo.trim();
  const descricao = values.descricao.trim();

  if (!titulo) {
    errors.titulo = "O título é obrigatório";
  } else if (titulo.length > TAREFA_TITULO_MAX) {
    errors.titulo = `O título deve ter no máximo ${TAREFA_TITULO_MAX} caracteres`;
  }

  if (!descricao) {
    errors.descricao = "A descrição é obrigatória";
  } else if (descricao.length > TAREFA_DESCRICAO_MAX) {
    errors.descricao = `A descrição deve ter no máximo ${TAREFA_DESCRICAO_MAX} caracteres`;
  }

  return errors;
}

export async function fetchTarefas(): Promise<Tarefa[]> {
  const { data, error } = await supabase
    .from("tarefas")
    .select(TAREFA_COLUMNS)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (error) {
    throw new Error("Não foi possível carregar as tarefas. Tente novamente.");
  }
  return data ?? [];
}

export async function createTarefa(input: TaskInput): Promise<Tarefa> {
  const { data, error } = await supabase
    .from("tarefas")
    .insert({
      titulo: input.titulo.trim(),
      descricao: input.descricao.trim(),
      status: STATUS_PENDENTE,
    })
    .select(TAREFA_COLUMNS)
    .single();

  if (error || !data) {
    throw new Error("Não foi possível adicionar a tarefa. Tente novamente.");
  }
  return data;
}

export async function updateTarefa(
  id: number,
  patch: Partial<TaskInput & { status: TaskStatus }>,
): Promise<Tarefa> {
  const { data, error } = await supabase
    .from("tarefas")
    .update(patch)
    .eq("id", id)
    .select(TAREFA_COLUMNS)
    .single();

  if (error || !data) {
    throw new Error("Não foi possível salvar as alterações. Tente novamente.");
  }
  return data;
}

export async function deleteTarefa(id: number): Promise<void> {
  const { error } = await supabase.from("tarefas").delete().eq("id", id);
  if (error) {
    throw new Error("Não foi possível excluir a tarefa. Tente novamente.");
  }
}

export async function deleteTarefasConcluidas(): Promise<void> {
  const { error } = await supabase
    .from("tarefas")
    .delete()
    .eq("status", STATUS_CONCLUIDA);
  if (error) {
    throw new Error("Não foi possível limpar as tarefas concluídas. Tente novamente.");
  }
}
