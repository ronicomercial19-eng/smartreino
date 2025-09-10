import { supabaseUntyped } from "@/integrations/supabase/untypedClient";

export type UploadPeriodizacao = {
  id: string;
  estudante_id: string;
  arquivo_url: string;
  nome_arquivo: string | null;
  criado_em: string;
  meta: object | null;
};

export const uploadsService = {
  async create(upload: Omit<UploadPeriodizacao, 'id' | 'criado_em'>): Promise<UploadPeriodizacao> {
    console.log("📤 Criando upload de periodização:", upload);
    const { data, error } = await supabaseUntyped
      .from("uploads_periodizacao")
      .insert([upload])
      .select()
      .single();

    if (error) {
      console.error("❌ Erro ao criar upload:", error);
      throw error;
    }

    console.log("✅ Upload criado:", data);
    return data as UploadPeriodizacao;
  },

  async getByStudent(estudanteId: string): Promise<UploadPeriodizacao[]> {
    console.log("📥 Buscando uploads para estudante:", estudanteId);
    const { data, error } = await supabaseUntyped
      .from("uploads_periodizacao")
      .select("*")
      .eq("estudante_id", estudanteId)
      .order("criado_em", { ascending: false });

    if (error) {
      console.error("❌ Erro ao buscar uploads:", error);
      throw error;
    }

    console.log(`✅ ${data?.length || 0} upload(s) encontrado(s)`);
    return (data || []) as UploadPeriodizacao[];
  },

  async delete(uploadId: string): Promise<void> {
    console.log("🗑️ Deletando upload:", uploadId);
    const { error } = await supabaseUntyped
      .from("uploads_periodizacao")
      .delete()
      .eq("id", uploadId);

    if (error) {
      console.error("❌ Erro ao deletar upload:", error);
      throw error;
    }

    console.log("✅ Upload deletado");
  },
};