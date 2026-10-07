import { parseModelTemplate } from '../supabase/functions/_shared/protocol-template.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseProtocolDose, isStrengthDose } from '../supabase/functions/_shared/protocol-dose.ts';
test('incident 8x400m keeps metres and never becomes 400 repetitions',()=>{
 const dose=parseProtocolDose('8x400m @ 110% pace',1,'400');
 assert.equal(dose.dose_type,'distance'); assert.equal(dose.dose_unit,'m');assert.equal(dose.dose_value,'400');assert.equal(dose.repetition_target,null);assert.equal(isStrengthDose(dose),false);
});
test('strength 3x12 and a rep range remain supported',()=>{
 for(const value of ['3x12 RPE 6','4x8-12 descanso 60s']) assert.equal(isStrengthDose(parseProtocolDose(value,4)),true);
});
test('timed work never becomes repetition count',()=>{
 for(const value of ['4x30s com 60s rec','3x2min']) {const d=parseProtocolDose(value,1);assert.equal(d.dose_type,'duration');assert.equal(d.repetition_target,null);assert.equal(isStrengthDose(d),false);}
});
test('nested intervals are preserved as complex prescription',()=>{const d=parseProtocolDose('3x(4x400m) em blocos',1);assert.equal(d.dose_type,'mixed');assert.equal(d.source_description,'3x(4x400m) em blocos');assert.equal(isStrengthDose(d),false);});
test('cardio without explicit unit cannot fall back to invented strength reps',()=>{assert.equal(isStrengthDose(parseProtocolDose('Tempo contínuo 20min',2,'10')),false);assert.equal(parseProtocolDose('Tempo contínuo 20min',2,'10').repetition_target,null);});
test('kilometres and timed resistance also retain their units',()=>{assert.equal(parseProtocolDose('4x1.5km',3).dose_unit,'km');assert.equal(isStrengthDose(parseProtocolDose('3x30s isometria',7)),false);});
test('actual seed parser retains 8x400m and does not synthesize cardio repetitions',()=>{const d=parseModelTemplate({sets:'3-6',reps:'variável',cadence:'explosivo',rest:90},'8x400m @ 110% pace',5,2,'performance',1);assert.equal(d.sets,'8');assert.equal(d.reps,'400m');assert.equal(d.repetition_target,null);assert.equal(d.dose_unit,'m');const u=parseModelTemplate({sets:'3-6',reps:'variável',cadence:'explosivo',rest:90},'Tempo contínuo 20min',1,2,'performance',2);assert.equal(u.reps,'variável');assert.equal(u.repetition_target,null);});
