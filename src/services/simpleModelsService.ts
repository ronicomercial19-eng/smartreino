
import { supabaseUntyped } from "@/integrations/supabase/untypedClient";

export type SimpleModel = {
  id: string;
  nome: string;
  descricao: string | null;
  duracao_em_semanas: number | null;
  criado_em: string | null;
};

export const simpleModelsService = {
  async getById(modelId: string): Promise<SimpleModel | null> {
    console.log("📘 Buscando modelo simples por ID:", modelId);
    const { data, error } = await supabaseUntyped
      .from("modelos_de_treino")
      .select("*")
      .eq("id", modelId)
      .single();

    if (error) {
      console.error("❌ Erro ao buscar modelo simples:", error);
      throw error;
    }
    return data as SimpleModel;
  },
};
