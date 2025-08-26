
import { supabaseUntyped } from "@/integrations/supabase/untypedClient";

export type PeriodizacaoSemanal = {
  semana: number;
  carga_prevista: number | null;
  carga_real: number | null;
  diferenca: number | null;
};

export const periodizationNewService = {
  async getByStudent(estudanteId: string): Promise<PeriodizacaoSemanal[]> {
    console.log("🧮 Buscando periodização semanal (RPC) para estudante:", estudanteId);
    const { data, error } = await supabaseUntyped.rpc(
      "calcular_periodizacao_correspondencia",
      { estudante: estudanteId }
    );

    if (error) {
      console.error("❌ Erro no RPC calcular_periodizacao_correspondencia:", error);
      throw error;
    }

    console.log("✅ Periodização retornada:", data);
    return (data || []) as PeriodizacaoSemanal[];
  },
};
