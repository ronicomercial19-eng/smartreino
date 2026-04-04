import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Helper: parse model description into unique block_9_template ──
function parseModelTemplate(
  baseB9: { sets: string; reps: string; cadence: string; rest: number },
  modelDesc: string,
  variationIdx: number,
  modelIdx: number,
  pillar: string
): { sets: string; reps: string; cadence: string; rest: number; rpe: string } {
  // Try to extract sets×reps from description (e.g. "3x12 RPE 6")
  const setsRepsMatch = modelDesc.match(/(\d+)\s*x\s*(\d+[-–]?\d*)/i);
  // Try to extract RPE
  const rpeMatch = modelDesc.match(/RPE\s*(\d+(?:\.\d+)?)/i);
  // Try to extract cadence like 3:0:1:0
  const cadenceMatch = modelDesc.match(/(\d:\d:\d:\d)/);
  // Try to extract rest in seconds
  const restMatch = modelDesc.match(/(\d+)\s*(?:s|seg|sec)\s*(?:rec|descanso|rest)/i);

  // Progressive variation: each model gets slightly different params
  const restVariation = Math.round(baseB9.rest + (modelIdx - 5) * 5); // spread ±20s around base
  
  let sets = baseB9.sets;
  let reps = baseB9.reps;
  let cadence = baseB9.cadence;
  let rest = Math.max(30, Math.min(180, restVariation));

  if (setsRepsMatch) {
    sets = setsRepsMatch[1];
    reps = setsRepsMatch[2];
  } else {
    // Derive from position: early models = more reps/less sets, later = fewer reps/more sets
    const baseRepsNum = parseInt(baseB9.reps.split("-")[0]) || 10;
    const baseSetsNum = parseInt(baseB9.sets.split("-")[0]) || 3;
    const repsDelta = Math.round((modelIdx - 5) * -0.5);
    const setsDelta = modelIdx >= 7 ? 1 : 0;
    sets = String(Math.max(2, baseSetsNum + setsDelta));
    reps = String(Math.max(3, baseRepsNum + repsDelta));
  }

  if (cadenceMatch) cadence = cadenceMatch[1];
  if (restMatch) rest = parseInt(restMatch[1]);

  // RPE: derive from match or position
  let rpe = "6-7";
  if (rpeMatch) {
    rpe = rpeMatch[1];
  } else if (pillar === "longevidade") {
    rpe = String(Math.min(8, 4 + Math.round(variationIdx * 0.4 + modelIdx * 0.15)));
  } else {
    rpe = String(Math.min(10, 5 + Math.round(variationIdx * 0.3 + modelIdx * 0.2)));
  }

  return { sets, reps, cadence, rest, rpe };
}

// ── Goal tags mapping per protocol ──
function getGoalTags(protocolId: number): string[] {
  switch (protocolId) {
    case 1: return ["performance", "emagrecimento", "cardio"];
    case 2: return ["performance", "emagrecimento", "cardio"];
    case 3: return ["performance", "emagrecimento", "cardio"];
    case 4: return ["forca", "hipertrofia"];
    case 5: return ["hipertrofia", "emagrecimento"];
    case 6: return ["estetica", "reabilitacao"];
    case 7: return ["funcional", "longevidade", "reabilitacao"];
    case 8: return ["funcional", "longevidade", "reabilitacao"];
    case 9: return ["funcional", "longevidade", "reabilitacao"];
    default: return [];
  }
}

const PROTOCOLS = [
  { id: 1, pillar: "performance", pillar_label: "Performance Aeróbica", name: "VMAX", axis: "Velocidade pura e economia de movimento", neural: "Ativação de arco plantar (Short Foot) + Stiffness drills", integration: "Drills de corrida + Mobilidade de tornozelo", b9: { sets: "3-6", reps: "variável", cadence: "explosivo", rest: 90 }, reset: "Liberação miofascial plantar + Respiração 4-2-6", variations: [
    { name: "Adaptação", focus: "Técnica e Drills", models: ["Drills técnicos sem foco em tempo","Postura e balanço de braços","Cadência controlada com metrônomo","Educativo de skipping básico","Corrida em superfície macia","Mini-sprints com foco técnico","Drills combinados (A-B-C)","Técnica de partida e aceleração","Avaliação técnica de corrida"] },
    { name: "Alático", focus: "Sprints curtos <60m", models: ["3x30m com descanso total","5x40m com partida em pé","4x50m com aceleração progressiva","6x30m com saída variada","Sprints em rampa curta 20m","3x50m com cronometragem","Contraste: trote + sprint 30m","Sprint resistido 30m","Teste de velocidade 40m"] },
    { name: "Explosivo", focus: "Rampas e saltos", models: ["Saltos verticais + sprint curto","Subida forte 50m + trote volta","Pliometria + aceleração 30m","Hill sprints 6x30m","Saltos em degrau + sprint plano","Multisaltos horizontais + tiro","Skipping alto + sprint 40m","Saltos unipodais + aceleração","Circuito neural: salto-sprint-freio"] },
    { name: "Glicolítico", focus: "Tiros de 200m", models: ["6x200m @ 90% com 90s rec","8x200m @ 85% com 60s rec","Pirâmide 100-200-300-200-100","4x300m com 2min rec","10x200m com rec ativo","Escada 150-200-250-300m","6x200m com rec decrescente","Blocos 3x(3x200m)","Teste 2x400m forte"] },
    { name: "VO2 Máx", focus: "Intervalados 400-800m", models: ["10x200m @ 115% pace","8x400m @ 110% pace","6x600m @ pace alvo","Pirâmide 200-400-600-400-200","5x800m com 3min rec","4x1000m com rec ativo","Misto 400-800-400-800","3x(4x400m) em blocos","Simulado 3km forte"] },
    { name: "Densidade", focus: "Redução de intervalo", models: ["6x400m rec 3min→2min","8x300m rec decrescente","Tempo run 10min com pausas","Fartlek estruturado 20min","30/30 por 15min","5x(2min on/1min off)","Pirâmide invertida de descanso","Cruise intervals rec mínimo","Teste de densidade 20min"] },
    { name: "Específico", focus: "Ritmo de prova", models: ["3x2km @ pace de prova","Tempo run 20min @ pace","5x1km alternando pace","Progressivo 3km+2km forte","Simulado 5km completo","Blocos 1km micro-rec 30s","Negative split 4km","Race pace terreno variado","Teste final de pace"] },
    { name: "Polimento", focus: "Recuperação com brilho", models: ["Rodagem leve + 3 strides","4x200m ritmo de prova","Mobilidade + 2 tiros curtos","Trote 20min + drills","Ativação neural + 2x100m","Rodagem 15min Z1","Strides progressivos 5x100m","Shakeout run 10min","Descanso ativo + mobilidade"] },
    { name: "Teste", focus: "Validação de performance", models: ["Time trial 1km","Teste velocidade 200m","Simulado 3km cronometrado","Teste pace negativo 2km","Avaliação VO2 campo","Time trial 5km","Teste sprint repetido","Cooper 12min","Avaliação final temporada"] },
  ]},
  { id: 2, pillar: "performance", pillar_label: "Performance Aeróbica", name: "Threshold", axis: "Sustentação de alta intensidade", neural: "Ativação de arco plantar (Short Foot) + Stiffness drills", integration: "Drills de corrida + Mobilidade de tornozelo", b9: { sets: "3-6", reps: "variável", cadence: "explosivo", rest: 90 }, reset: "Liberação miofascial plantar + Respiração 4-2-6", variations: [
    { name: "Aeróbico Estrito", focus: "Z2 estável", models: ["30min Z2 contínuo","40min Z2 cadência","45min Z2 terreno","2x20min Z2 rec","50min Z2 progressivo","30min Z2+10min Z1","Z2 monitoramento FC","LSD 60min","Avaliação base aeróbica"] },
    { name: "Intervalado Longo", focus: "Blocos de 1km", models: ["4x1km limiar 2min rec","5x1km rec ativo","3x1.5km limiar","6x1km rec decrescente","Escada 800-1200m","4x1km alternando","2x(3x1km)","5x1km progressivo","Teste 3x1km cronometrado"] },
    { name: "Tempo Run I", focus: "Sustentação 15-20min", models: ["Tempo run 15min","Tempo 18min aquec longo","2x10min tempo 3min rec","Tempo run 20min","10min Z2+10min limiar","3x8min tempo 2min rec","Tempo 15min subida","Tempo negativo 20min","Avaliação tempo máx"] },
    { name: "Cruise", focus: "Intervalos rec mínima", models: ["4x8min limiar 1min rec","3x10min cruise 90s rec","5x6min 1min rec","Cruise contínuo 25min","2x12min 2min rec","6x5min 45s rec","3x(2x6min)","Cruise progressivo 30min","Teste cruise máximo"] },
    { name: "Tempo Run II", focus: "Sustentação 30-40min", models: ["Tempo run 30min","Tempo 35min hidratação","2x18min tempo 3min rec","Tempo run 40min","20min Z2+20min limiar","3x12min 2min rec","Tempo terreno variado 30min","Negative split 35min","Avaliação 40min sustentado"] },
    { name: "Progressivo", focus: "Aumento de ritmo", models: ["5km +0.3km/h por km","8km progressivo Z2→limiar","3km fácil+3km progressivo","Progressivo sensação 6km","10km últimos 3km fortes","Escada ritmo 5 níveis","Progressivo subida 4km","Long run progressivo 12km","Teste progressivo máx 5km"] },
    { name: "Misto", focus: "Limiar + tiros curtos", models: ["15min tempo+4x200m","Fartlek 2/2 x8","10min tempo+hill sprints","1km limiar+400m x3","20min tempo+strides","Intervalado misto 30min","Tempo+pliometria leve","Cruise+sprints finais","Avaliação misto intensidades"] },
    { name: "Estresse", focus: "Volume em limiar", models: ["3x3km limiar","Tempo run 45min","2x20min 3min rec","5x2km limiar","Long tempo 50min","4x(2x1.5km)","12km total limiar","Double threshold day","Teste volume máximo limiar"] },
    { name: "Performance", focus: "Simulados meia maratona", models: ["Simulado 10km","Progressivo 15km","Simulado 15km pace meia","Negative split 12km","Race simulation nutrição","Simulado 18km","Dress rehearsal completo","Simulado 20km","Corrida teste oficial"] },
  ]},
  { id: 3, pillar: "performance", pillar_label: "Performance Aeróbica", name: "Endurance", axis: "Resistência periférica", neural: "Ativação de arco plantar (Short Foot) + Stiffness drills", integration: "Drills de corrida + Mobilidade de tornozelo", b9: { sets: "3-6", reps: "variável", cadence: "explosivo", rest: 90 }, reset: "Liberação miofascial plantar + Respiração 4-2-6", variations: [
    { name: "Low Impact", focus: "Regenerativo", models: ["Caminhada 30min","Trote leve 20min Z1","Alternância caminhada/trote","Caminhada inclinada 25min","Trote regenerativo 25min","Caminhada bastões 30min","Trote aquático","Mobilidade+caminhada","Recuperação ativa livre"] },
    { name: "Base I", focus: "Rodagens 30-45min", models: ["Rodagem 30min Z2","Rodagem 35min respiração","Rodagem 40min plano","Rodagem 45min cadência","2x20min+3min caminhada","Rodagem 35min progressiva","Rodagem 40min+strides","Rodagem fácil 30min","Avaliação aeróbica 30min"] },
    { name: "Estrutural", focus: "Terrenos variados", models: ["Trilha leve 40min","Rodagem grama 30min","Cross-country 35min","Subidas controladas 30min","Terreno misto 40min","Areia firme 25min","Trilha técnica 45min","Rodagem terra 35min","Avaliação terreno variado"] },
    { name: "Longo I", focus: "Volume até 60min", models: ["Longo 45min Z2","Longo 50min hidratação","Longo 55min progressivo","Longo 60min estável","2x30min 5min rec","Longo 50min+strides","Longo 55min terreno variado","Longo 60min nutrição","Avaliação longo 60min"] },
    { name: "Longo II", focus: "Acima de 90min", models: ["Longo 75min Z2","Longo 80min variação","Longo 90min estável","Longo 100min pausas","Longo 90min progressivo","Longo 105min nutrição","Longo 90min trilha","Longo 110min estável","Longo 120min pico"] },
    { name: "Depleção", focus: "Baixa reserva", models: ["Jejum+rodagem 40min","Low carb+longo 60min","Double day manhã+tarde","Depleção parcial 50min","Longo matinal pré-café","Train-low 60min","Depleção controlada 55min","Fat-adaptation 70min","Avaliação metabólica"] },
    { name: "Cadência", focus: "RPM e economia", models: ["30min cadência 170spm","Drills cadência+rodagem","Progressão cadência 35min","Rodagem metrônomo 40min","Cadência alta 20min","Alternância cadência 30min","Cadência subida 25min","Economia movimento 40min","Teste cadência ótima"] },
    { name: "Recuperativo", focus: "Descarga e regeneração", models: ["Rodagem regenerativa 20min","Caminhada+mobilidade 30min","Trote muito leve 25min","Recuperação aquática","Yoga+trote 15min","Rodagem social 30min","Caminhada natureza","Recovery run 20min Z1","Reset alongamento+respiração"] },
    { name: "Ultra", focus: "Pico de volume", models: ["Longo pico 120min","Back-to-back 60+60min","Volume semanal máximo","Ultra simulado 150min","Longo elevação 120min","3 rodagens em 2 dias","Longo progressivo 130min","Longo simulação prova","Teste final resistência"] },
  ]},
  { id: 4, pillar: "estrutural", pillar_label: "Estrutural & Morfológico", name: "Tensão Mecânica", axis: "Recrutamento de fibras brancas", neural: "Isometria de ativação 6s + Bracing abdominal", integration: "Mobilidade articular específica + Aquecimento", b9: { sets: "3-4", reps: "8-12", cadence: "3:0:1:0", rest: 75 }, reset: "Alongamento estático do músculo alvo + L.M.", variations: [
    { name: "Padrão", focus: "Ajuste técnico", models: ["Execução perfeita sem carga","Padrão movimento com bastão","Técnica carga mínima 40%","Foco bracing e estabilização","Correção assimetrias básicas","Padrão+espelho feedback","Movimento segmentado parciais","Técnica sob fadiga leve","Avaliação competência motora"] },
    { name: "Carga", focus: "Hipertrofia 8-12 reps", models: ["3x12 RPE 6","3x10 RPE 7 cadência","4x10 RPE 7","3x8 RPE 7.5","4x8 pausa 2s final","3x10 excêntrica 3s","Rampa 12-10-8","4x10 tempo 3:0:1:0","Teste de 10RM"] },
    { name: "Força I", focus: "6-8 reps recrutamento", models: ["4x8 RPE 7.5","4x6 RPE 8","5x6 descanso 2min","3x8+1x6 onda","4x6 excêntrica 4s","Rampa 8-6-6-4","5x5 RPE 8","4x6 pausa iso 2s","Teste de 6RM"] },
    { name: "Neural", focus: "Cluster sets", models: ["5x(2+2+2) 15s intra","4x(3+3) 20s intra","6x(2+2) carga 5RM","Cluster piramidal 3+2+1","5x(1+1+1+1) 10s pausa","Wave loading 3-2-1 x3","4x(2+2+2) excêntrica","Heavy singles+back-off","Teste cluster máximo"] },
    { name: "Excêntrico", focus: "Fase negativa", models: ["3x8 excêntrica 4s","4x6 excêntrica 5s","3x5 exc 6s+pausa 2s","Negativas supramáx 3x3","Exc acentuada 2up/1down","3x6 tempo 5:0:1:0","Iso-excêntrica combinada","Excêntrica 3 paradas","Teste excêntrico controlado"] },
    { name: "Isométrico", focus: "Pausa ponto crítico", models: ["4x6 pausa 2s meio","3x5 pausa 3s ponto difícil","Iso-hold 10s+3 reps","3x(3 iso+3 dinâmicas)","Yielding iso 20-30s","Overcoming iso contra pino","Multi-angle iso 3 posições","Iso-excêntrica segurar+descer","Teste isometria máxima"] },
    { name: "Força II", focus: "3-5 reps RPE 8-9", models: ["5x5 RPE 8","4x4 RPE 8.5","5x3 RPE 9","3x5+2x3 onda desc","4x4 pausa 2s","Rampa 5-4-3-2-3-4","5x3 3min descanso","Singles pesados+back-off","Teste de 3RM"] },
    { name: "Potenciação PAP", focus: "Força + explosão", models: ["Agach pesado+salto vertical","Supino pesado+med ball throw","Terra pesado+sprint 20m","Leg press+box jump","Pull-up+med ball slam","PAP completo MMII","PAP completo MMSS","PAP triplo força+plyo+vel","Avaliação PAP individual"] },
    { name: "1RM", focus: "Teste carga máxima", models: ["Protocolo 1RM rampa","1RM tentativas recorde","Teste submáximo estimativa","1RM lifts principais","Reteste após ciclo","1RM com vídeo análise","Teste força relativa","Comparativo 1RM anterior","Avaliação final força máxima"] },
  ]},
  { id: 5, pillar: "estrutural", pillar_label: "Estrutural & Morfológico", name: "Estresse Metabólico", axis: "Inchaço celular e resposta hormonal", neural: "Isometria de ativação 6s + Bracing abdominal", integration: "Mobilidade articular específica + Aquecimento", b9: { sets: "3-4", reps: "12-20", cadence: "2:0:1:0", rest: 45 }, reset: "Alongamento estático + L.M. com rolo", variations: [
    { name: "Fluxo", focus: "15-20 reps pump", models: ["3x15 carga leve contração","3x20 cadência 2:0:1:0","4x15 descanso 45s","Circuito 4 exercícios x15","3x20 iso final 10s","Giant set leve 3 exercícios","Pump set 1x30 final","3x15 super-slow","Avaliação resistência muscular"] },
    { name: "Bi-Set", focus: "Agonista + antagonista", models: ["Supino+remada 3x10","Rosca+tríceps 3x12","Extensora+flexora 3x12","Press ombro+face pull 3x10","Agachamento+stiff 3x10","Bi-set braços 4 rounds","Bi-set peito/costas 4 rounds","Bi-set MMII ant/post","Bi-set full body"] },
    { name: "Drop-Set", focus: "Carga regressiva", models: ["Drop simples -20% x1","Drop duplo -20% -20%","Drop triplo mecânico pegada","Drop mudança exercício","Running the rack halteres","Drop em máquina seguro","Drop aumento reps","Drop invertido leve→pesado→leve","Protocolo drop máximo"] },
    { name: "Rest-Pause", focus: "Pausas 15s pós-falha", models: ["Rest-pause simples falha+15s","Rest-pause duplo","Myo-reps ativação+mini-sets","Rest-pause carga fixa","DC training style","Rest-pause cadência lenta","Cluster rest-pause 5+3+2","Rest-pause isolados","Protocolo intensidade máxima"] },
    { name: "Tri-Set", focus: "3 exercícios mesmo grupo", models: ["Tri-set peito incl+reto+cruci","Tri-set costas pux+rem+pull","Tri-set ombros desenv+lat+post","Tri-set quadríceps agach+press+ext","Tri-set glúteos thrust+búlg+abd","Tri-set posterior stiff+flex+bola","Tri-set bíceps barra+mart+conc","Tri-set tríceps merg+testa+corda","Tri-set core prancha+crunch+rot"] },
    { name: "Pico Contração", focus: "Squeeze 3s no topo", models: ["3x10 squeeze 3s pico","4x8 iso final 5s","3x12 contração parcial topo","Peak contraction isolados","Squeeze+excêntrica lenta","Peak contraction cabos","Pico+drop set","Contração estática 30s","Protocolo conexão mente-músculo"] },
    { name: "Oclusão BFR", focus: "Restrição de fluxo", models: ["BFR básico 4x30-15-15-15","BFR extensora/flexora","BFR braços","BFR caminhada reab","BFR 20% 1RM","BFR panturrilhas","BFR exercício livre","BFR protocolo avançado","Avaliação tolerância BFR"] },
    { name: "Série Gigante", focus: "4+ exercícios sem descanso", models: ["Giant set peito 4 ex","Giant set costas 4 ex","Giant set MMII 5 ex","Giant set ombros 4 ex","Giant set full body 6 ex","Giant set braços 4 ex","Giant set metabólico+cardio","Giant set pesos livres","Protocolo exaustão total"] },
    { name: "Exaustão", focus: "Falha absoluta", models: ["Falha em isolados","Falha+parciais","Falha+negativas assistidas","100 reps method","Falha mecânica 3 variações","Burnout final 1 set","Falha em máquinas","Failure+BFR","Protocolo overreach controlado"] },
  ]},
  { id: 6, pillar: "estrutural", pillar_label: "Estrutural & Morfológico", name: "Simetria & Fluxo", axis: "Correção de desvios e estética", neural: "Isometria de ativação 6s + Bracing abdominal", integration: "Mobilidade articular específica + Aquecimento", b9: { sets: "3-4", reps: "10-15", cadence: "3:0:2:0", rest: 60 }, reset: "Liberação miofascial pontos gatilho", variations: [
    { name: "Unilateral I", focus: "Estabilização", models: ["Búlgaro com BW","Remada unilateral leve","Press unilateral em pé","Step-up controlado","Single-leg deadlift apoio","Single-arm row banco","Lunge estático iso","Pallof press unilateral","Avaliação assimetria"] },
    { name: "Unilateral II", focus: "Dinâmico", models: ["Búlgaro carga moderada","Single-leg press","Pistol squat assistido","Single-arm press deitado","Step-up com carga","RDL unilateral haltere","Lunge reverso rotação","Single-arm cable row","Teste força unilateral"] },
    { name: "Conexão", focus: "Mente-músculo", models: ["Exercícios olhos fechados","Cadência 4:0:4:0","Touch-and-feel carga mín","Contração voluntária 3s","EMG mental músculo-alvo","Biofeedback tátil","Isolados iso pico","Respiração coordenada","Avaliação controle motor"] },
    { name: "Postural", focus: "Cadeia posterior", models: ["Face pull+retração escapular","YTWL banco inclinado","Band pull-apart séries altas","Prone cobra+ext torácica","Wall angel+retração","Serrátil push-up","Rotação externa elástico","Deadbug anti-extensão","Avaliação postural funcional"] },
    { name: "Pré-Exaustão", focus: "Isolado antes composto", models: ["Crucifixo→supino","Extensora→agachamento","Lateral→desenvolvimento","Pullover→puxada","Leg curl→stiff","Abdução→hip thrust","Concentrada→remada","Elevação frontal→press","Pré-exaustão full body"] },
    { name: "Pós-Exaustão", focus: "Composto antes isolado", models: ["Supino→crucifixo máquina","Agachamento→extensora","Puxada→pullover","Desenvolvimento→lateral","Stiff→leg curl","Hip thrust→abdução","Remada→bíceps","Press militar→elev frontal","Pós-exaustão full body"] },
    { name: "Ângulos", focus: "Variação pegadas", models: ["Supino plano+incl+decl","Rosca supinada+mart+pronada","Remada pronada+neutra+sup","Puxada aberta+fechada+neutra","Leg press pés alto+médio+baixo","Cable alto+médio+baixo","Press 15°+30°+45°","Extensão testa+pulley+overhead","Multi-ângulo completo"] },
    { name: "Sustentação", focus: "Isometria acabamento", models: ["Hold 30s cada exercício","Wall sit 3x45s","Prancha+sustentação pesos","Iso pico 20s x3","Dead hang 3x30s","Segurar posição difícil","Iso-hold 20-30-40s","L-sit hold progressivo","Protocolo resistência iso"] },
    { name: "Harmonia", focus: "Esculpimento final", models: ["Circuito isolados 3x15","Pose practice+contração","Superset acabamento bi/tri","Drop set final cada grupo","Pump set 1x30 por grupo","Cable crossover+fly final","Isolados+BFR leve","Série depletação final","Sessão avaliação estética"] },
  ]},
  { id: 7, pillar: "longevidade", pillar_label: "Funcional & Longevidade", name: "Reativo", axis: "Reação rápida e proteção articular", neural: "Ativação sensorial + Respiração diafragmática", integration: "Mobilidade global + Estabilização core", b9: { sets: "2-3", reps: "6-10", cadence: "explosivo", rest: 60 }, reset: "Relaxamento muscular + Respiração", variations: [
    { name: "Equilíbrio", focus: "Propriocepção", models: ["Apoio unipodal 3x30s","Bosu equilíbrio estático","Tandem stance olhos fechados","Apoio unipodal perturbação","Equilíbrio dinâmico linha","Propriocepção disco","Equilíbrio+movimentos braço","Apoio unipodal alcance","Avaliação equilíbrio"] },
    { name: "Reação", focus: "Estímulo visual", models: ["Reação comando voz","Reação estímulo cores","Agility ladder básica","Cone drills reação","Mirror drill parceiro","Tap drill rápido","Reação+deslocamento lateral","Estímulo luminoso+movimento","Teste tempo reação"] },
    { name: "Pliometria I", focus: "Saltos baixos", models: ["Pogo jumps no lugar","Skipping ênfase contato","Ankle hops 3x10","Box step-off aterrissagem","Saltos mini-hurdles","Saltos laterais baixos","Drop landing 20cm","Stiffness drills","Avaliação reatividade"] },
    { name: "Lateralidade", focus: "Deslocamentos multi", models: ["Shuffle lateral 3x10m","Carioca drill","Cross-over step","Deslocamento em T","Deslocamento em L","Lateral bound","Deslocamento diagonal","Pro agility 5-10-5","Teste agilidade lateral"] },
    { name: "Pliometria II", focus: "Saltos avançados", models: ["Depth jump 30cm","Drop jump reativo","Box jump progressivo","Depth jump+sprint","Salto vertical máximo","Broad jump repetido","Bounding multisaltos","Depth jump unilateral","Teste potência salto"] },
    { name: "Explosão", focus: "MedBall e potência", models: ["Med ball chest pass","Med ball overhead throw","Med ball rotational throw","Med ball slam","Med ball scoop toss","KB swing explosivo","Clean de potência","Push press explosivo","Avaliação potência global"] },
    { name: "Sprint Reativo", focus: "Aceleração decisão", models: ["Sprint 10m saída variada","Sprint reativo comando","Aceleração+frenagem","Sprint mudança direção","Sprint resistido+livre","Sprint dupla perseguição","Aceleração dif posições","Sprint+obstáculo","Teste aceleração 10-20m"] },
    { name: "Complexo", focus: "Força + reação", models: ["Agachamento+salto vertical","Lunge+salto explosivo","Remada+med ball throw","Press+push-up pliométrico","Deadlift+broad jump","Step-up+sprint","Pull-up+med ball slam","Hip thrust+sprint 20m","Circuito complexo completo"] },
    { name: "Agilidade", focus: "Circuito decisional", models: ["Illinois agility test","T-test","Hexagonal test","Circuito cones aleatórios","Agility decisão cognitiva","Circuito reativo parceiro","Obstacle course personalizado","Agility+sprint+salto","Avaliação final agilidade"] },
  ]},
  { id: 8, pillar: "longevidade", pillar_label: "Funcional & Longevidade", name: "Mobilidade Carregada", axis: "Força em grandes amplitudes", neural: "Ativação sensorial + Respiração diafragmática", integration: "Mobilidade global + Estabilização core", b9: { sets: "2-3", reps: "8-12", cadence: "2:0:2:0", rest: 60 }, reset: "Relaxamento muscular + Respiração", variations: [
    { name: "CARs", focus: "Rotações articulares", models: ["CARs ombro 10 cada","CARs quadril","CARs tornozelo","CARs punho e cotovelo","CARs coluna torácica","CARs cervical","Sequência completa CARs","CARs resistência leve","Avaliação mobilidade articular"] },
    { name: "Estabilidade", focus: "Suporte carga desafiador", models: ["Turkish get-up KB leve","Overhead carry 30m","Waiter walk","Bottom-up KB press","Farmer walk pausa","Single-arm OH carry","Rack walk KB","Suitcase carry unilateral","Avaliação estabilidade carga"] },
    { name: "Dinâmico", focus: "Alongamento em movimento", models: ["World greatest stretch","Inchworm+push-up","Leg swing frontal+lateral","Deep lunge+rotação","Cossack squat sem carga","Spiderman walk","Scorpion stretch","Walking knee hug","Flow dinâmico 10min"] },
    { name: "Elásticos", focus: "Distração articular", models: ["Band distraction ombro","Band distraction quadril","Band pull-apart+mobilidade","Ankle mobility banda","Thoracic rotation banda","Hip flexor stretch banda","Shoulder sleeper assistido","Pec stretch banda","Protocolo completo bandas"] },
    { name: "Overhead", focus: "Carga acima cabeça", models: ["OH squat com bastão","KB bottoms-up press","OH lunge walk","Snatch grip OH hold","Single-arm OH squat assist","OH carry pesado","Sotts press","Z-press com KB","Avaliação mobilidade OH"] },
    { name: "Flow", focus: "Movimentos animais", models: ["Bear crawl 3x10m","Crab walk","Macaco lateral","Scorpion+cobra flow","Animal flow besta-macaco","Locomotion drill 5min","Yoga warrior flow","Ground-to-standing","Flow livre 10min"] },
    { name: "Alcance", focus: "Exercícios em déficit", models: ["RDL em step déficit","Push-up paralelas amplitude","Agachamento profundo pausa","Elevação panturrilha step","Fly amplitude máxima","Bulgarian em déficit","Pull-up ROM completo","Flexão nórdica parcial","Avaliação força amplitude"] },
    { name: "PNF", focus: "Contração-relaxamento", models: ["PNF hamstring contrai+alonga","PNF quadríceps","PNF ombro rotação","PNF adutores","PNF hip flexors","PNF peitoral","PNF cervical cuidado","PNF cadeia posterior","Protocolo PNF full body"] },
    { name: "Mestre", focus: "Full range strength", models: ["ATG split squat","Full ROM pull-up+dip","Jefferson curl controlado","OH squat profundo carga","Full ROM bench pausa peito","Sissy squat controle","Pike push-up profundo","Windmill com KB","Avaliação força ROM completo"] },
  ]},
  { id: 9, pillar: "longevidade", pillar_label: "Funcional & Longevidade", name: "Resiliência", axis: "Redução de estresse e manutenção", neural: "Ativação sensorial + Respiração diafragmática", integration: "Mobilidade global + Estabilização core", b9: { sets: "2-3", reps: "8-12", cadence: "2:0:2:0", rest: 60 }, reset: "Relaxamento muscular progressivo + Respiração", variations: [
    { name: "Respiratório", focus: "Padrões de respiração", models: ["Respiração diafragmática 5min","Box breathing 4-4-4-4","Respiração 4-7-8 relaxamento","Respiração nasal exercício","Wim Hof adaptado 3 rounds","Respiração cadenciada movimento","Exhale emphasis parassimpático","Respiratory muscle training","Avaliação padrão respiratório"] },
    { name: "Core Profundo", focus: "Estabilização lombo-pélvica", models: ["Dead bug 3x8 cada lado","Bird-dog 3x8","Hollow body hold 3x20s","Pallof press 3x10","Anti-rotação com cabo","McGill big 3","Diaphragmatic brace+movimento","Core timing drill","Avaliação estabilidade core"] },
    { name: "Caminhada", focus: "Mecânica de passo", models: ["Caminhada consciente 20min","Caminhada foco arco plantar","Caminhada cadência controlada","Caminhada inclinada 15min","Caminhada rápida técnica","Caminhada nórdica adaptada","Caminhada carga rucking","Caminhada terreno variado","Avaliação de marcha"] },
    { name: "Mobilidade", focus: "Coluna e quadril", models: ["Cat-cow 3x10","90/90 hip stretch","Thread the needle torácica","Hip circles 4 apoios","Couch stretch flexores","Piriforme+glúteo stretch","Open book thoracic","Wall slides ombro","Protocolo mobilidade matinal"] },
    { name: "Força Diária", focus: "Independência funcional", models: ["Senta-levanta cadeira 3x10","Push-up adaptado parede","Puxar elástico 3x12","Subir degrau com apoio","Farmer walk leve","Agachamento na cadeira","Remada elástico sentado","Elevação lateral garrafas","Circuito funcional diário"] },
    { name: "Coordenação", focus: "Movimentos cruzados", models: ["Marcha cruzada no lugar","Mão-joelho contralateral","Coordenação mão-pé alternada","Lançamento recepção bola","Drum pattern mãos/pés","Escada agilidade lenta","Movimentos espelhados","Sequência 4 movimentos","Avaliação coordenação"] },
    { name: "Sensorial", focus: "Propriocepção fina", models: ["Texturas sob pés descalço","Manipulação objetos pequenos","Equilíbrio olhos fechados","Foot doming short foot 3x10","Marble pickup pés","Sensibilidade plantar bola","Equilíbrio superfície irregular","Toe yoga controle individual","Avaliação sensorial plantar"] },
    { name: "Circulatório", focus: "Baixo impacto circulação", models: ["Bicicleta ergométrica 15min","Elíptico suave 20min","Natação leve","Exercícios cadeira 15min","Elevação pernas deitado","Bombeamento panturrilha 3x20","Exercícios aquáticos","Arm bike pedalada","Circuito circulatório sentado"] },
    { name: "Reset Total", focus: "Meditação e relaxamento", models: ["Body scan meditation 10min","Progressive muscle relaxation","Yoga nidra adaptado 15min","Alongamento restaurativo 10min","Foam rolling suave full body","Savasana respiração 5min","Visualização guiada 10min","Diário gratidão+respiração","Protocolo reset completo"] },
  ]},
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Force re-seed with differentiated templates
    const rows: any[] = [];
    for (const p of PROTOCOLS) {
      const goalTags = getGoalTags(p.id);
      for (let vi = 0; vi < p.variations.length; vi++) {
        const v = p.variations[vi];
        const variationId = vi + 1;
        for (let mi = 0; mi < v.models.length; mi++) {
          const modelId = mi + 1;
          const code = `${p.id}.${variationId}.${modelId}`;
          
          // Generate unique block_9_template per model
          const b9Template = parseModelTemplate(p.b9, v.models[mi], variationId, modelId, p.pillar);

          let rpe = b9Template.rpe;

          rows.push({
            id: code,
            pillar: p.pillar,
            pillar_label: p.pillar_label,
            protocol_id: p.id,
            protocol_name: p.name,
            protocol_axis: p.axis,
            variation_id: variationId,
            variation_name: v.name,
            variation_focus: v.focus,
            model_id: modelId,
            model_description: v.models[mi],
            block_neural: p.neural,
            block_integration: p.integration,
            block_9_template: { sets: b9Template.sets, reps: b9Template.reps, cadence: b9Template.cadence, rest: b9Template.rest, rpe: b9Template.rpe },
            block_reset: p.reset,
            rpe_range: rpe,
            recommended_for: p.pillar === "longevidade" ? ["iniciante", "intermediario"] : ["iniciante", "intermediario", "avancado"],
            goal_tags: goalTags,
          });
        }
      }
    }

    // Delete existing and re-insert
    await supabase.from("smart_treino_protocols").delete().neq("id", "");

    // Insert in batches of 100
    for (let i = 0; i < rows.length; i += 100) {
      const batch = rows.slice(i, i + 100);
      const { error } = await supabase.from("smart_treino_protocols").upsert(batch, { onConflict: "id" });
      if (error) throw error;
    }

    return new Response(JSON.stringify({ success: true, count: rows.length, message: "Protocols seeded with differentiated templates and goal_tags" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("seed error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
