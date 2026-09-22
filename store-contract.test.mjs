import {test} from 'node:test';
import assert from 'node:assert/strict';
import {loadCatalog,resolveBoardMaterial,estimateResolvedBoardPlan} from './store-zero-stage2-store.mjs';
import {estimateJob,pricingPolicyFor} from './store-zero-pricing-engine.mjs';
import {beginStoreInteraction,completeStoreInteraction,validateStoreInteraction} from './store-interaction-contract.mjs';
const pin='f'.repeat(40), catalog=loadCatalog();
const definition={finishedPartLengthIn:16,quantity:2,sawAngleDeg:30,species:'spf',nominalT:2,nominalW:4,cutPlane:'miter-face',endRelation:'parallel',endIdentity:'both',lengthDatum:'long-long-outer-edge'};
const request=beginStoreInteraction({projectKey:'start-own',projectId:'my-board',revision:'v1',definition,storePin:pin});
function result(){const materialResolution=resolveBoardMaterial(catalog,definition);return {storePin:pin,definitionVersionId:'v1',physicalExecutionAuthorized:false,materialResolution,rawEstimate:estimateResolvedBoardPlan(catalog,materialResolution,{classId:'app.user-defined-board.v1'})};}
test('actual application class alias has no legacy rate; unknown classes do not inherit any',()=>{
 for(const classId of ['app.user-defined-board.v1','user_defined_board','new-project','toString',undefined]){
  const r=estimateJob(catalog,{classId,pieces:[{storeSku:'STB-ZERO-SPF-2X4-72-001',qty:1,keptLengthIn:16,widthIn:3.5}]});
  assert.equal(r.totals.cell_recovery,null);assert.equal(r.status,'PARTIAL_BUDGETARY_ESTIMATE');assert.equal(r.totals.Q,r.totals.material);
 }
 assert.equal(pricingPolicyFor('app.board.square.v1').id,'LEGACY-REFERENCE-RECOVERY/1');
});
test('actual evaluated plan is bound to definition, revision, project and source',()=>{
 const answer=completeStoreInteraction(request,result());
 assert.deepEqual(validateStoreInteraction(request,answer),answer);
 for(const patch of [{projectId:'another-board'},{revision:'v2'},{storePin:'a'.repeat(40)}]) assert.throws(()=>validateStoreInteraction({...request,...patch},answer),/MISMATCH/);
 const changed=structuredClone(answer);changed.rawEstimate.totals.Q+=1;
 assert.throws(()=>validateStoreInteraction(request,changed),/STORE_RESULT_CHANGED/);
});
test('producer rejects injected placeholder economics and a phantom blank for named reasons',()=>{
 const rate=result();rate.rawEstimate.totals.cell_recovery=35;
 assert.throws(()=>completeStoreInteraction(request,rate),/STORE_UNAUTHORIZED_PROCESSING_CHARGE/);
 const blank=result();blank.materialResolution.plan.intermediateBlank={lengthIn:60,reason:'fixture',source:'fixture'};
 assert.throws(()=>completeStoreInteraction(request,blank),/STORE_UNJUSTIFIED_PREPARATION/);
 const geometry=result();geometry.materialResolution.plan.finishedPart.lengthIn=72;
 assert.throws(()=>completeStoreInteraction(request,geometry),/STORE_PROJECT_FACTS_CHANGED/);
 const auth=result();auth.physicalExecutionAuthorized=true;
 assert.throws(()=>completeStoreInteraction(request,auth),/STORE_PHYSICAL_AUTHORITY_FORBIDDEN/);
});
