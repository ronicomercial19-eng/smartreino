
import { supabaseUntyped } from "@/integrations/supabase/untypedClient";

export type GeneratedPlan = {
  id: string;
  estudante_id: string;
  modelo_id: string;
  criado_em: string;
};

export const generatedPlansService = {
  async getByStudent(estudanteId: string): Promise<GeneratedPlan[]> {
    console.log("🧩 Buscando planos gerados para estudante:", estudanteId);
    const { data, error } = await supabaseUntyped
      .from("planos_de_treino_gerados")
      .select("*")
      .eq("estudante_id", estudanteId);

    if (error) {
      console.error("❌ Erro ao buscar planos_de_treino_gerados:", error);
      throw error;
    }

    console.log(`✅ ${data?.length || 0} plano(s) encontrado(s)`);
    return (data || []) as GeneratedPlan[];
  },
};
