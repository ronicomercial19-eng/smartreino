import { parseProtocolDose } from './protocol-dose.ts';
export function parseModelTemplate(
  baseB9: { sets: string; reps: string; cadence: string; rest: number },
  modelDesc: string,
  variationIdx: number,
  modelIdx: number,
  pillar: string,
  protocolId: number
) {
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

  const dose = parseProtocolDose(modelDesc, protocolId, baseB9.reps);
  if (dose.dose_type !== "repetitions") {
    reps = dose.dose_value && dose.dose_unit ? dose.dose_value + dose.dose_unit : "variável";
    if (setsRepsMatch && dose.dose_type !== "mixed") sets = setsRepsMatch[1];
  } else if (setsRepsMatch) {
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

  return { sets, reps, cadence, rest, rpe, ...parseProtocolDose(modelDesc, protocolId, reps) };
}

