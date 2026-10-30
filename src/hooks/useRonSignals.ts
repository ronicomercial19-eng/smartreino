/**
 * useRonSignals — os três sinais reais que aparecem no card de Treino de Hoje:
 * Sync Score (calibração do próprio app do aluno no FitPro), PDI (perfil
 * dinâmico individual) e a semana/fase atual da periodização ativa.
 *
 * Mesmo banco compartilhado do FitPro (mfrydtrzjxscbkaiwfnw). PDI e
 * periodização ficam vazios pra boa parte dos alunos até o professor rodar o
 * wizard correspondente — por isso cada sinal carrega um estado "ready":
 * quando false, a tela mostra ação (calibrar/gerar) em vez de inventar
 * número ou travar o fluxo de prescrição.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type RonSignals = {
  sync: { ready: true; score: number; updatedAt: string | null } | { ready: false };
  pdi: { ready: true; fatigueLevel: "baixa" | "moderada" | "alta"; volumeTolerance: number } | { ready: false };
  cycle: { ready: true; weekLabel: string; phase: string | null } | { ready: false };
  loading: boolean;
};

function pdiFatigueFromParams(p: {
  recovery_rate?: string | null;
  stress_sensitivity?: number | null;
}): "baixa" | "moderada" | "alta" {
  const slowRecovery = ["lenta","slow"].includes(p.recovery_rate || "");
  const highStress = (p.stress_sensitivity ?? 0) >= 7;
  if (slowRecovery && highStress) return "alta";
  if (slowRecovery || highStress) return "moderada";
  return "baixa";
}

export function useRonSignals(athleteId: string | null | undefined) {
  const [signals, setSignals] = useState<RonSignals>({
    sync: { ready: false },
    pdi: { ready: false },
    cycle: { ready: false },
    loading: true,
  });

  const [revision,setRevision]=useState(0);
  useEffect(()=>{
    const refresh=()=>setRevision(n=>n+1);
    const timer=setInterval(()=>{if(!document.hidden)refresh();},60000);
    window.addEventListener('focus',refresh);window.addEventListener('9fit:sync_updated',refresh);window.addEventListener('9fit:workout-updated',refresh);
    return()=>{clearInterval(timer);window.removeEventListener('focus',refresh);window.removeEventListener('9fit:sync_updated',refresh);window.removeEventListener('9fit:workout-updated',refresh);};
  },[]);
  useEffect(()=>{
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),15000);let active=true;
    setSignals({sync:{ready:false},pdi:{ready:false},cycle:{ready:false},loading:!!athleteId});
    if(athleteId){
      (async()=>{
        try{
          const {data,error}=await (supabase as any).rpc('fn_smart_training_signals',{p_athlete_id:athleteId}).abortSignal(controller.signal);
          if(error)throw error;
          if(!active)return;
          const p=data.pdi;
          setSignals({sync:data.sync,cycle:data.cycle,pdi:p.ready&&p.recovery_rate!=null&&p.stress_sensitivity!=null&&p.volume_tolerance!=null?{ready:true,fatigueLevel:pdiFatigueFromParams(p),volumeTolerance:p.volume_tolerance}:{ready:false},loading:false});
        }catch{if(active)setSignals({sync:{ready:false},pdi:{ready:false},cycle:{ready:false},loading:false});}
        finally{clearTimeout(timer);}
      })();
    }else clearTimeout(timer);
    return()=>{active=false;clearTimeout(timer);controller.abort();};
  },[athleteId,revision]);
  return signals;
}
