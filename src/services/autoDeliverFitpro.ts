import {supabase} from '@/integrations/supabase/client';
export interface AutoDeliverParams {athleteId:string;planoId?:string|null;workoutDate?:string;treino?:unknown;contexto?:unknown}
/** The shared database is the delivery channel; raw plan JSON is not an executable session. */
export async function autoDeliverToFitpro(params:AutoDeliverParams):Promise<{success:boolean;message:string}>{
 if(params.planoId){
   const link=await (supabase as any).from('athlete_periodizations').select('id').eq('athlete_id',params.athleteId).eq('annual_plan_id',params.planoId).in('status',['active','in_progress']).maybeSingle();
   if(link.error)throw link.error;
   if(!link.data)throw new Error('O plano gerado foi salvo como rascunho legado. Publique suas sessões revisadas no painel do professor; ele não substituiu a periodização ativa do FitPro.');
 }
 const day=params.workoutDate || new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Sao_Paulo'}).format(new Date());
 const monday=new Date(day+'T12:00:00Z');monday.setUTCDate(monday.getUTCDate()-((monday.getUTCDay()+6)%7));
 const {data,error}=await (supabase as any).rpc('fn_generate_periodized_week',{p_athlete_id:params.athleteId,p_week_start:monday.toISOString().slice(0,10),p_days_week:null});
 if(error)throw error;
 if(!data?.success&&!data?.partial)throw new Error(data?.error==='no_active_periodization'?'O plano foi salvo, mas falta uma periodização ativa para preparar as sessões no FitPro.':'O plano foi salvo, mas as sessões não foram confirmadas no FitPro.');
 return {success:data.success===true,message:`${data.generated || 0} sessões preparadas, ${data.preserved || 0} preservadas${data.failed ? `, ${data.failed} precisam de revisão` : ''}.`};
}
