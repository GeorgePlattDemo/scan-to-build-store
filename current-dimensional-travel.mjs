import { evaluateDimensionalTravel } from './dimensional-travel.mjs';
import { D001_STAGE2_ENVELOPE } from './d001-stage2-envelope.mjs';
/** Current declarations only. Null fields are missing Store/machine authority, not zero. */
export const CURRENT_DIMENSIONAL_MODEL = Object.freeze({
  id:'D001-TRAVEL-MODEL',version:'0.1',basis:'DECLARED_FIXTURE',
  source:'D001-STAGE2-ENVELOPE-0.4',
  datums:{A:{declared:true,axis:'Y',value:0},B:{declared:true,axis:'Z',value:0}},
  index:{velocityInPerSec:D001_STAGE2_ENVELOPE.motion.FEED_X_MAX_LOADED_IN_PER_MIN/60,accelerationInPerSec2:null},
  referenceMethods:{},tools:{},measured:false,commissioned:false
});
export const CURRENT_MACHINE_SERVICE_RATE = Object.freeze({
  id:'STORE-ZERO-MACHINE-SELL-RATE',version:'0.1',basis:'DECLARED_FIXTURE',units:'USD/hour',value:null,
  status:'UNRESOLVED',reason:'No adopted machine-service selling rate is supplied by this candidate.'
});
export function currentDimensionalTravel({definition,storeRevision,estimate,capability,plan}){
  const materials=(estimate?.material_lines||[]).map(line=>({storeSku:line.storeSku,quantity:line.qty,sellingPrice:line.selling_price,priceSource:line.observationId||line.listReferenceBasis||null,availability:'UNRESOLVED'}));
  if(estimate?.hardware_line) materials.push({storeSku:estimate.hardware_line.storeSku,quantity:estimate.hardware_line.qty,sellingPrice:estimate.hardware_line.selling_price,priceSource:estimate.hardware_line.listReferenceBasis||null,availability:'UNRESOLVED'});
  const rawOps=plan?.parents?.flatMap((parent,p)=>parent.operations.map((op,i)=>({...op,id:'parent-'+p+'-op-'+i})))||[];
  // Existing stock sequence is not yet a kinematic plan. Do not relabel it as one.
  const record=evaluateDimensionalTravel({definition:{projectId:definition?.projectId,version:definition?.definitionVersionId,complete:!!definition?.definitionVersionId,
    features:definition?.features,requiredOperationIds:rawOps.map(op=>op.id),sourcedItemsComplete:definition?.sourcedItemsComplete===true,
    unresolved:plan?.machinePlan?[]:['KINEMATIC_PLAN_TRANSLATION_REQUIRED']},storeRevision,materials,
    capability:{id:D001_STAGE2_ENVELOPE.id,version:'0.4',status:capability?.status||'UNRESOLVED',unresolved:capability?.unresolved||[]},
    model:CURRENT_DIMENSIONAL_MODEL,rate:CURRENT_MACHINE_SERVICE_RATE,plan:plan?.machinePlan??null});
  return record;
}
