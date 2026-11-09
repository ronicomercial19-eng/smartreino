import { describe, it, expect } from "vitest";
import { normalizeNivel } from "./DensificacaoSelector";
describe("normalizeNivel", () => {
  it("normaliza acentos e maiúsculas", () => {
    expect(normalizeNivel("Intermediário")).toBe("intermediario");
    expect(normalizeNivel("AVANÇADO")).toBe("avancado");
  });
  it("rejeita níveis fora da lista", () => {
    expect(normalizeNivel("elite")).toBeNull();
    expect(normalizeNivel(null)).toBeNull();
  });
});
