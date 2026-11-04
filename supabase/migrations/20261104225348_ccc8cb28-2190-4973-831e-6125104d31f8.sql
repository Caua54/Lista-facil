CREATE TABLE public.tarefas (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  titulo text NOT NULL,
  descricao text NOT NULL,
  status text NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Concluída')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tarefas TO anon, authenticated;
GRANT ALL ON public.tarefas TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.tarefas_id_seq TO anon, authenticated;

ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer pessoa pode ver tarefas"
  ON public.tarefas FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Qualquer pessoa pode criar tarefas"
  ON public.tarefas FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Qualquer pessoa pode editar tarefas"
  ON public.tarefas FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Qualquer pessoa pode excluir tarefas"
  ON public.tarefas FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_tarefas_updated_at
  BEFORE UPDATE ON public.tarefas
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();