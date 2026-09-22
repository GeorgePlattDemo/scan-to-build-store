/** Store-owned implementation of STB DIMENSIONAL STORE TRAVEL STANDARD 0.1.
 * Inputs named model/rate/plan are Store-owned declarations, never UI overrides.
 * This module does not emit controller instructions or assert physical POSITION_VALID.
 */
export const TRAVEL_STANDARD = 'STB-DIMENSIONAL-STORE-TRAVEL-0.1';
export const TRAVEL_EVALUATOR = 'STB-DIMENSIONAL-TRAVEL-EVALUATOR/0.1';
const MODEL_BASES = ['MODELED','DECLARED_FIXTURE','DECLARED_STAGE2_CAPABILITY'];
export function travelIdentity(value) {
  if(Array.isArray(value)) return '['+value.map(travelIdentity).join(',')+']';
  if(value && typeof value==='object') return '{'+Object.keys(value).filter(k=>value[k]!==undefined).sort().map(k=>JSON.stringify(k)+':'+travelIdentity(value[k])).join(',')+'}';
  return JSON.stringify(value);
}
function failure(code){const error=new Error(code);error.code=code;throw error;}
function positive(n){return typeof n==='number'&&Number.isFinite(n)&&n>0;}
function nonnegative(n){return typeof n==='number'&&Number.isFinite(n)&&n>=0;}
function declaration(value){return value&&typeof value.id==='string'&&value.id&&typeof value.version==='string'&&value.version&&MODEL_BASES.includes(value.basis);}
export function indexSeconds(distanceIn,velocityInPerSec,accelerationInPerSec2){
  if(!nonnegative(distanceIn)||!positive(velocityInPerSec)||!positive(accelerationInPerSec2)) failure('INDEX_PARAMETERS_REQUIRED');
  const D=distanceIn,V=velocityInPerSec,A=accelerationInPerSec2;
  return D>=V*V/A ? 2*V/A+(D-V*V/A)/V : 2*Math.sqrt(D/A);
}
export function toolSeconds(op,tool){
  if(!tool || !nonnegative(tool.approachSec)||!nonnegative(tool.retractSec)) failure('TOOL_APPROACH_RETRACT_REQUIRED');
  let cutting;
  if(op.kind==='DRILL'||op.kind==='SPOT'){
    if(!positive(tool.rpm)||!positive(tool.feedInPerRev)||!positive(op.plungeIn)) failure('DRILL_DEPTH_FEED_REQUIRED');
    cutting=60*op.plungeIn/(tool.rpm*tool.feedInPerRev);
  }else{
    if(!positive(tool.cuttingFeedInPerMin)||!positive(op.pathIn)||!Number.isInteger(op.passes)||op.passes<1) failure('TOOL_PATH_FEED_PASSES_REQUIRED');
    cutting=60*op.pathIn*op.passes/tool.cuttingFeedInPerMin;
  }
  return tool.approachSec+cutting+tool.retractSec;
}
export function evaluateDimensionalTravel({definition,storeRevision,materials,capability,model,rate,plan}){
  const unresolved=[];
  const need=(ok,code)=>{if(!ok)unresolved.push(code);};
  need(definition&&typeof definition.projectId==='string'&&definition.projectId&&definition.version&&definition.complete===true,'CONFIGURATION_IDENTITY_OR_COMPLETENESS_REQUIRED');
  need(typeof storeRevision==='string'&&/^[a-f0-9]{40}$/.test(storeRevision),'STORE_REVISION_REQUIRED');
  need(Array.isArray(definition?.features)&&definition.features.every(f=>f.id&&f.partId&&f.units==='in'&&Array.isArray(f.position)&&f.position.length>0&&f.position.every(Number.isFinite)),'PART_RELATIVE_FEATURES_REQUIRED');
  need(Array.isArray(materials)&&materials.length>0&&materials.every(m=>m.storeSku&&Number.isInteger(m.quantity)&&m.quantity>0&&nonnegative(m.sellingPrice)&&m.priceSource&&m.availability==='AVAILABLE'),'MATERIAL_PRICE_QUANTITY_OR_AVAILABILITY_REQUIRED');
  need(definition?.sourcedItemsComplete===true,'SOURCED_HARDWARE_COVERAGE_REQUIRED');
  need(capability?.status==='SUPPORTABLE'&&capability.id&&capability.version,'CAPABILITY_NOT_SUPPORTABLE');
  need(declaration(model),'IDENTIFIED_MACHINE_CYCLE_MODEL_REQUIRED');
  need(declaration(rate)&&rate.units==='USD/hour'&&positive(rate.value),'STORE_MACHINE_SELL_RATE_REQUIRED');
  need(model?.datums?.A?.declared===true&&model?.datums?.B?.declared===true,'MACHINE_AB_REFERENCE_REQUIRED');
  need(Array.isArray(plan?.operations)&&plan.operations.length>0,'ORDERED_MACHINE_PLAN_REQUIRED');
  const required=definition?.requiredOperationIds;
  const covered=plan?.operations?.flatMap(op=>op.requiredOperationIds||[])||[];
  need(Array.isArray(required)&&required.length>0&&required.every(id=>covered.includes(id))&&covered.every(id=>required.includes(id)),'REQUIRED_OPERATION_COVERAGE_REQUIRED');
  need(!(plan?.preparation||[]).some(p=>!p.reason||!p.source),'PREPARATION_REASON_REQUIRED');
  let valid=false,referenceMethod=null;
  const time={reference:0,index:0,saw:0,drillSpot:0,mill:0,other:0};
  const sequence=[];
  for(const op of plan?.operations||[]){
    let seconds=null;
    try{
      if(!op.id) failure('OPERATION_ID_REQUIRED');
      if(op.kind==='REFERENCE'){
        const ref=model?.referenceMethods?.[op.method];
        if(!ref||!declaration(ref)||!nonnegative(ref.seconds)) failure('DATUM_C_METHOD_REQUIRED');
        seconds=ref.seconds;valid=true;referenceMethod=op.method;time.reference+=seconds;
      }else if(op.kind==='RELEASE'){
        valid=false;seconds=0;
      }else{
        if(!valid)failure('POSITION_INVALID');
        if(op.kind==='INDEX'){
          if(op.toolEngaged!==false)failure('INDEX_WITH_TOOL_ENGAGED');
          seconds=indexSeconds(op.distanceIn,model?.index?.velocityInPerSec,model?.index?.accelerationInPerSec2);time.index+=seconds;
        }else if(['SAW','DRILL','SPOT','MILL'].includes(op.kind)){
          if(op.stopped!==true||op.holdConfirmed!==true||op.retractedAfter!==true)failure('STATIONARY_OPERATION_STATE_REQUIRED');
          if(!model?.tools?.[op.toolId]?.stationId)failure('ADMITTED_TOOL_STATION_REQUIRED');
          seconds=toolSeconds(op,model.tools[op.toolId]);time[op.kind==='SAW'?'saw':op.kind==='MILL'?'mill':'drillSpot']+=seconds;
        }else failure('UNDECLARED_MACHINE_OPERATION');
      }
    }catch(error){unresolved.push(error.message);}
    sequence.push({...op,modeledSeconds:seconds,modeledPositionValidAfter:valid});
  }
  need(referenceMethod!==null,'DATUM_C_METHOD_REQUIRED');
  if(Array.isArray(capability?.unresolved))unresolved.push(...capability.unresolved);
  if(Array.isArray(definition?.unresolved))unresolved.push(...definition.unresolved);
  const reasons=[...new Set(unresolved)];
  const complete=reasons.length===0;
  const materialSubtotal=Array.isArray(materials)&&materials.every(m=>positive(m.quantity)&&nonnegative(m.sellingPrice))
    ? Math.round(materials.reduce((s,m)=>s+m.quantity*m.sellingPrice,0)*100)/100:null;
  const seconds=complete?Object.values(time).reduce((a,b)=>a+b,0):null;
  const machineServicePrice=complete?Math.round(seconds/3600*rate.value*100)/100:null;
  const Q=complete?Math.round((materialSubtotal+machineServicePrice)*100)/100:null;
  const inputs={definition,storeRevision,materials,capability,model,rate,plan};
  const record={standard:TRAVEL_STANDARD,evaluator:TRAVEL_EVALUATOR,
    projectId:definition?.projectId??null,configurationVersion:definition?.version??null,storeRevision,
    inputIdentity:travelIdentity(inputs),status:complete?'COMPLETE':capability?.status==='REFUSED'?'REFUSED':capability?.status==='UNAVAILABLE'?'UNAVAILABLE':'UNRESOLVED',
    materials:materials??[],capability:capability??null,features:definition?.features??[],requiredOperationIds:required??[],
    machineModel:model?{id:model.id,version:model.version,basis:model.basis}:null,rate:rate??null,
    datumCMethod:referenceMethod,orderedSequence:sequence,timeSeconds:complete?time:null,
    T_MACHINE_seconds:seconds,machineServicePrice,materialSubtotal,Q,unresolved:reasons,
    modelStatus:'MODELED',physicalExecutionAuthorized:false};
  return {...record,resultIdentity:travelIdentity(record)};
}
export function reconcileDimensionalTravel(passA,inputs){
  const passB=evaluateDimensionalTravel(inputs);
  if(passA?.inputIdentity!==passB.inputIdentity)failure('STORE_INPUT_CHANGED_NEW_VERSION_REQUIRED');
  if(passA?.resultIdentity!==passB.resultIdentity)failure('STORE_CALCULATION_DIVERGENCE');
  return {standard:TRAVEL_STANDARD,passA,passB,matched:true,complete:passB.status==='COMPLETE',physicalExecutionAuthorized:false};
}
export function requireCompleteDimensionalQ(record){
  if(record?.standard!==TRAVEL_STANDARD||record?.evaluator!==TRAVEL_EVALUATOR||record?.status!=='COMPLETE'||!Number.isFinite(record?.Q)||!Number.isFinite(record?.machineServicePrice)||!Number.isFinite(record?.T_MACHINE_seconds)||record?.unresolved?.length) failure('NO_COMPLETE_Q');
  const {resultIdentity,...body}=record;
  if(travelIdentity(body)!==resultIdentity)failure('STORE_RESULT_CHANGED');
  return record.Q;
}
