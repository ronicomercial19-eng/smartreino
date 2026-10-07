export interface ProtocolDose {
  modality: 'cardio' | 'resistance';
  dose_type: 'repetitions' | 'distance' | 'duration' | 'mixed' | 'unresolved';
  dose_unit: string | null;
  dose_value: string | null;
  repetition_target: string | null;
  source_description: string;
}
export function parseProtocolDose(description: string, protocolId: number, legacyReps = ''): ProtocolDose {
  const match = description.match(/(\d+)\s*[x×]\s*(\d+(?:\.\d+)?(?:[-–]\d+)?)\s*(km|min|seg|sec|s|m)?(?:[^a-z]|$)/i);
  const modality = [1,2,3].includes(protocolId) ? 'cardio' : 'resistance';
  const unit = match?.[3]?.toLowerCase() || null;
  const kind = /[x×]\s*\(/.test(description) ? 'mixed'
    : unit === 'm' || unit === 'km' ? 'distance'
    : ['s','min','seg','sec'].includes(unit || '') ? 'duration'
    : modality === 'cardio' ? 'unresolved' : 'repetitions';
  const reps = kind === 'repetitions' ? (match?.[2] || legacyReps) : null;
  return { modality, dose_type: kind, dose_unit: kind === 'repetitions' ? 'reps' : unit,
    dose_value: kind === 'repetitions' ? reps : match?.[2] || null,
    repetition_target: reps, source_description: description };
}
export function isStrengthDose(dose: ProtocolDose) {
  return dose.modality === 'resistance' && dose.dose_type === 'repetitions' && dose.dose_unit === 'reps'
    && /^\d+(?:\.\d+)?(?:[-–]\d+)?$/.test(dose.repetition_target || '');
}

