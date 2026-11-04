import { describe, expect, it } from "vitest";
import {
  TAREFA_DESCRICAO_MAX,
  TAREFA_TITULO_MAX,
  validateTask,
} from "@/lib/tasks";

describe("validateTask", () => {
  it("exige título", () => {
    expect(validateTask({ titulo: "   ", descricao: "descrição" })).toEqual({
      titulo: "O título é obrigatório",
    });
  });

  it("exige descrição", () => {
    expect(validateTask({ titulo: "Título", descricao: "  " })).toEqual({
      descricao: "A descrição é obrigatória",
    });
  });

  it("limita o título a 100 caracteres", () => {
    const titulo = "a".repeat(TAREFA_TITULO_MAX + 1);
    expect(validateTask({ titulo, descricao: "descrição" })).toEqual({
      titulo: "O título deve ter no máximo 100 caracteres",
    });
  });

  it("limita a descrição a 500 caracteres", () => {
    const descricao = "a".repeat(TAREFA_DESCRICAO_MAX + 1);
    expect(validateTask({ titulo: "Título", descricao })).toEqual({
      descricao: "A descrição deve ter no máximo 500 caracteres",
    });
  });

  it("aceita valores válidos sem erros", () => {
    expect(
      validateTask({ titulo: "Estudar", descricao: "Capítulo 5 do livro" }),
    ).toEqual({});
  });
});
