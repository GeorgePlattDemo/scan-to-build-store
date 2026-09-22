/** Shared runtime boundary. This checks consistency, not cryptographic provenance or physical authority. */
export const STORE_INTERACTION_VERSION = 'stb.store-interaction/1';
export const PROJECT_STORE_POLICIES = Object.freeze({
  'start-own': Object.freeze({pricingPolicy:'DIMENSIONAL-TRAVEL-PRICING/1', capabilityModel:'D001-STAGE2-ENVELOPE-0.4', sourcePin:null}),
  'board-reference': Object.freeze({pricingPolicy:'DIMENSIONAL-TRAVEL-PRICING/1', capabilityModel:'D001-STAGE2-ENVELOPE-0.4', sourcePin:null}),
  'sheet-s001': Object.freeze({pricingPolicy:'S001-MATERIAL-ONLY/1', capabilityModel:'S001-MODE2-ARCHED-APERTURE-V0', sourcePin:'4402abeb6b0299a5b6db2eec85ed04c3b0236bcc'}),
  'window-seat': Object.freeze({pricingPolicy:'STB-STORE-ZERO-WINDOW-SEAT-RECOVERY-0.1', capabilityModel:'D001-BOARD-EDGE-MILL-REF-0.3', sourcePin:'f88ec61c42446755d00259f88e7fd09f2702fd92'}),
  'alcove': Object.freeze({pricingPolicy:'ALCOVE-NATIVE-REFERENCE/1', capabilityModel:'D001-BOARD-EDGE-MILL-REF-0.3', sourcePin:'f88ec61c42446755d00259f88e7fd09f2702fd92'}),
  'outdoor-build': Object.freeze({pricingPolicy:'OUTDOOR-PROCESSING-UNRESOLVED/1', capabilityModel:'CURRENT_CANONICAL_STORE_ZERO', sourcePin:'f88ec61c42446755d00259f88e7fd09f2702fd92'})
});
export function canonicalStoreValue(value) {
  if (Array.isArray(value)) return '['+value.map(canonicalStoreValue).join(',')+']';
  if (value && typeof value === 'object') return '{'+Object.keys(value).filter(k=>value[k]!==undefined).sort().map(k=>JSON.stringify(k)+':'+canonicalStoreValue(value[k])).join(',')+'}';
  return JSON.stringify(value);
}
function contractFailure(code) { const e=new Error(code); e.code=code; throw e; }
export function beginStoreInteraction({projectKey,projectId,revision,definition,storePin}) {
  const policy=PROJECT_STORE_POLICIES[projectKey];
  if (!policy || !Object.hasOwn(PROJECT_STORE_POLICIES,projectKey)) contractFailure('STORE_PROJECT_POLICY_REQUIRED');
  if (typeof projectId!=='string'||!projectId||revision==null||String(revision)===''||!definition||typeof definition!=='object') contractFailure('STORE_REQUEST_IDENTITY_REQUIRED');
  if (typeof storePin!=='string'||!(/^[a-f0-9]{40}$/).test(storePin)) contractFailure('STORE_SOURCE_PIN_REQUIRED');
  if (policy.sourcePin && policy.sourcePin!==storePin) contractFailure('STORE_SOURCE_PIN_MISMATCH');
  return Object.freeze({contractVersion:STORE_INTERACTION_VERSION,projectKey,projectId,revision:String(revision),
    definitionIdentity:canonicalStoreValue(definition),storePin,pricingPolicy:policy.pricingPolicy,capabilityModel:policy.capabilityModel});
}
function assertStoreResult(request,result) {
  if (!result || typeof result!=='object') contractFailure('STORE_RESULT_REQUIRED');
  if (result.physicalExecutionAuthorized===true || result.allocationClaimed===true) contractFailure('STORE_PHYSICAL_AUTHORITY_FORBIDDEN');
  if (result.storePin && result.storePin!==request.storePin) contractFailure('STORE_SOURCE_PIN_MISMATCH');
  if (result.definitionVersionId && String(result.definitionVersionId)!==request.revision) contractFailure('STORE_REVISION_MISMATCH');
  const estimate=result.rawEstimate;
  if (estimate?.totals && ['material','hardware'].some(k=>!Number.isFinite(estimate.totals[k]))) contractFailure('STORE_PRICE_NUMBER_INVALID');
  if (result.materialResolution?.allocationClaimed===true) contractFailure('STORE_PHYSICAL_AUTHORITY_FORBIDDEN');
  if (estimate?.totals) {
    if (estimate.totals.Q!==null && (!result.travelRecord || result.travelRecord.status!=='COMPLETE' || result.travelRecord.Q!==estimate.totals.Q)) contractFailure('NO_COMPLETE_Q');
    if (estimate.totals.Q===null && result.priceCompleteness?.status==='COMPLETE_FOR_ENCODED_DEMAND') contractFailure('STORE_INCOMPLETE_PRICE_MISLABELED');
    if (estimate.totals.cell_recovery!==null && !result.travelRecord) contractFailure('STORE_UNAUTHORIZED_PROCESSING_CHARGE');
  }
  if (request.projectKey==='outdoor-build' && (estimate!=null || result.q!=null || result.storeReference?.estimate!=null)) contractFailure('STORE_UNAUTHORIZED_PROCESSING_CHARGE');
  if (request.projectKey==='sheet-s001' && estimate && estimate.processQ_status!=='UNRESOLVED') contractFailure('STORE_INCOMPLETE_PRICE_MISLABELED');
  if (request.projectKey==='window-seat') {
    if (result.pin?.commit!==request.storePin || result.pin?.recovery!==request.pricingPolicy) contractFailure('STORE_PRICING_POLICY_MISMATCH');
    if (Math.abs(result.q-(result.material+result.recovery+result.hardware))>0.005) contractFailure('STORE_SUBTOTAL_MISMATCH');
  }
  if (request.projectKey==='alcove' && (!Number.isFinite(result.q)||Math.abs(result.q-(result.material+result.recovery+result.hardware))>0.005)) contractFailure('STORE_SUBTOTAL_MISMATCH');
  const plan=result.materialResolution?.plan;
  if (plan) {
    const definition=JSON.parse(request.definitionIdentity);
    const demand=definition.line || definition;
    if (demand.finishedPartLengthIn!=null && (plan.finishedPart?.lengthIn!==demand.finishedPartLengthIn || plan.finishedPart?.quantity!==demand.quantity)) contractFailure('STORE_PROJECT_FACTS_CHANGED');
    if (plan.intermediateBlank && (!plan.intermediateBlank.reason||!plan.intermediateBlank.source||demand.requestedFinishedBlankLengthIn!==plan.intermediateBlank.lengthIn)) contractFailure('STORE_UNJUSTIFIED_PREPARATION');
    if (plan.preparation?.some(op=>!op.reason||!op.source)) contractFailure('STORE_UNJUSTIFIED_PREPARATION');
    if (estimate?.operationAccounting && estimate.operationAccounting.totalModeledSawCuts!==plan.accounting?.totalModeledSawCuts) contractFailure('STORE_OPERATION_ACCOUNTING_MISMATCH');
    if (result.materialResolution.allocationClaimed===true) contractFailure('STORE_PHYSICAL_AUTHORITY_FORBIDDEN');
  }
}
export function completeStoreInteraction(request,result) {
  assertStoreResult(request,result);
  const copy=JSON.parse(JSON.stringify(result));
  return {...copy,storeContract:{...request,resultIdentity:canonicalStoreValue(copy)}};
}
export function validateStoreInteraction(request,result) {
  const receipt=result?.storeContract;
  if (!receipt) contractFailure('STORE_CONTRACT_REQUIRED');
  for (const key of Object.keys(request)) if (receipt[key]!==request[key]) contractFailure('STORE_'+key.toUpperCase()+'_MISMATCH');
  if (receipt.contractVersion!==STORE_INTERACTION_VERSION) contractFailure('STORE_CONTRACT_VERSION_MISMATCH');
  const {storeContract,...payload}=result;
  if (canonicalStoreValue(payload)!==receipt.resultIdentity) contractFailure('STORE_RESULT_CHANGED');
  assertStoreResult(request,payload);
  return result;
}
