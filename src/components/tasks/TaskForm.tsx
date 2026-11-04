import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  TAREFA_DESCRICAO_MAX,
  TAREFA_TITULO_MAX,
  validateTask,
  type FieldErrors,
} from "@/lib/tasks";

export type TaskFormValues = { titulo: string; descricao: string };

type TaskFormProps = {
  idPrefix: string;
  submitLabel: string;
  submitIcon?: ReactNode;
  pending?: boolean;
  initialValues?: TaskFormValues;
  onSubmit: (values: TaskFormValues) => Promise<unknown> | void;
  onCancel?: () => void;
};

/** Shared task form with required-field and length validation. */
export function TaskForm({
  idPrefix,
  submitLabel,
  submitIcon,
  pending = false,
  initialValues = { titulo: "", descricao: "" },
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const [values, setValues] = useState<TaskFormValues>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const setField = (field: keyof TaskFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const found = validateTask(values);
    if (found.titulo || found.descricao) {
      setErrors(found);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ titulo: values.titulo.trim(), descricao: values.descricao.trim() });
      setValues({ titulo: "", descricao: "" });
      setErrors({});
    } finally {
      setSubmitting(false);
    }
  }

  const tituloId = `${idPrefix}-titulo`;
  const descricaoId = `${idPrefix}-descricao`;
  const busy = pending || submitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor={tituloId}>Título</Label>
        <Input
          id={tituloId}
          value={values.titulo}
          onChange={(e) => setField("titulo", e.target.value)}
          placeholder="Ex.: Estudar para a prova de matemática"
          aria-invalid={Boolean(errors.titulo)}
          aria-describedby={errors.titulo ? `${tituloId}-erro` : undefined}
          maxLength={TAREFA_TITULO_MAX + 50}
          disabled={busy}
        />
        {errors.titulo ? (
          <p id={`${tituloId}-erro`} role="alert" className="text-sm text-destructive">
            {errors.titulo}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            {values.titulo.length}/{TAREFA_TITULO_MAX} caracteres
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={descricaoId}>Descrição</Label>
        <Textarea
          id={descricaoId}
          value={values.descricao}
          onChange={(e) => setField("descricao", e.target.value)}
          placeholder="Descreva o que precisa ser feito"
          rows={4}
          aria-invalid={Boolean(errors.descricao)}
          aria-describedby={errors.descricao ? `${descricaoId}-erro` : undefined}
          maxLength={TAREFA_DESCRICAO_MAX + 50}
          disabled={busy}
        />
        {errors.descricao ? (
          <p id={`${descricaoId}-erro`} role="alert" className="text-sm text-destructive">
            {errors.descricao}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            {values.descricao.length}/{TAREFA_DESCRICAO_MAX} caracteres
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={busy}>
          {submitIcon}
          {busy ? "Salvando..." : submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
            Cancelar
          </Button>
        ) : null}
      </div>
    </form>
  );
}
