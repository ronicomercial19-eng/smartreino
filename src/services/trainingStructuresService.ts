
import { supabaseUntyped } from "@/integrations/supabase/untypedClient";

export const trainingStructuresService = {
  async getWeeklySetsTotalByModel(modelId: string): Promise<number> {
    console.log("📦 Somando séries da estrutura para o modelo:", modelId);
    const { data, error } = await supabaseUntyped
      .from("estruturas_de_treinamento")
      .select("series")
      .eq("modelo_id", modelId);

    if (error) {
      console.error("❌ Erro ao buscar estruturas_de_treinamento:", error);
      throw error;
    }

    const totalSeries = (data || [])
      .map((r: { series: number | null }) => r.series || 0)
      .reduce((acc: number, cur: number) => acc + cur, 0);

    console.log("✅ Total de séries por semana (constante por modelo):", totalSeries);
    return totalSeries;
  },
};
