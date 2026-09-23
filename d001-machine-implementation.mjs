/** Store-owned station identity and implementation evidence. No physical authority. */
const freeze = (value) => {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

export const D001_MACHINE_IMPLEMENTATION = freeze({
  id: 'D001-MACHINE-IMPLEMENTATION-0.1',
  evidenceClass: 'DECLARED_STAGE2_MODEL',
  measured: false,
  commissioned: false,
  physicalExecutionAuthorized: false,
  source: {
    fiveToolCommit: '3e1f9f2c18668de86d92c6ccae7e79d3cadd35a1',
    fiveToolFile: 'D-001-FIVE-TOOL-REFERENCE-0.1.md',
    fixedDepthCommit: '7303793620d0ceda509810a661d11e6c31c7d59f'
  },
  manipulatingRollers: ['R1', 'R2'],
  sawStations: ['SAW-L', 'SAW-R'],
  tools: {
    T1: { role: 'CENTER_HORIZONTAL_ROUTER', motion: ['VERTICAL_POSITION', 'IN_OUT_PLUNGE'],
      featureFamilies: ['EDGE_NOTCH'], status: 'ENVELOPE_INCOMPLETE',
      missing: ['travel', 'depth', 'cutter', 'occupied-cell timing'] },
    T2: { role: 'CENTER_TRANSVERSE_ROUTER_FROM_BELOW', motion: ['ACROSS_STOCK', 'CONTROLLED_DEPTH'],
      featureFamilies: ['DADO', 'TRANSVERSE_GROOVE'], status: 'REFERENCE_GEOMETRY_ONLY',
      candidateLimits: { maxWidthIn: 1, maxDepthIn: 0.375, extent: 'FULL_WIDTH', admittedForCompleteQ: false },
      missing: ['adopted station position', 'cutter', 'occupied-cell timing'] },
    T3: { role: 'END_ROUTER', featureFamilies: ['ROUTED_END'], status: 'ENVELOPE_INCOMPLETE',
      missing: ['explicit mapping to MILL_END', 'cutter', 'occupied-cell timing'] },
    T4: { role: 'VERTICAL_FACE_SPOT', featureFamilies: ['SPOT_ON_LOCATION'],
      existingModelStation: 'SPOT-FACE-REF', status: 'LEGACY_CENTERED_SPOT_MODEL',
      missing: ['selected tool point geometry for depth-defined spotting'] },
    T5: { role: 'HORIZONTAL_EDGE_SPOT', motion: ['HEIGHT_POSITION', 'IN_OUT_PLUNGE'],
      featureFamilies: ['SPOT_ON_LOCATION'], status: 'ENVELOPE_INCOMPLETE',
      missing: ['height range', 'station position', 'plunge/clearance limits', 'selected tool point geometry', 'occupied-cell timing'] }
  },
  // Existing functions remain intact. Matching a name is not evidence of physical equivalence.
  functionBindings: {
    MILL_LONG: { toolSlot: null, status: 'FUNCTION_PRESERVED_PHYSICAL_MAPPING_REQUIRED' },
    MILL_END: { toolSlot: null, status: 'FUNCTION_PRESERVED_PHYSICAL_MAPPING_REQUIRED' },
    'SPOT-FACE-REF': { toolSlot: 'T4', status: 'MODELED_FACE_SPOT_ONLY' }
  },
  depthDefinedSpot: {
    contract: 'SPOT_ON_LOCATION/0.2', toolDiameterIn: 0.1875,
    fullDiameterPenetrationIn: 0.1875,
    depthReference: 'ENTRY_SURFACE_ALONG_DRILL_AXIS',
    pointAxialLengthIn: null, totalTipPenetrationIn: null,
    customerDepthProgrammingRequired: false,
    status: 'SELECTED_TOOL_POINT_GEOMETRY_REQUIRED',
    timingRule: 'TOTAL_TIP_TRAVEL_FROM_SELECTED_TOOL_GEOMETRY_NO_LEGACY_PLUNGE_SUBSTITUTION'
  },
  positionCoordination: {
    status: 'PROPOSED_NOT_COMMISSIONED',
    commandedMotorPositionProvesStockPosition: false,
    observations: {
      independentStockTravel: { candidates: ['MEASURING_WHEEL_ENCODER', 'NONCONTACT_SURFACE_MOTION'], selected: null },
      datumC: { candidates: ['SENSED_FACE', 'MECHANICAL_REFERENCE', 'REFERENCE_CUT'], selectedSensor: null },
      seatingAndRestraint: { candidates: ['POSITION_CONTACT_WITH_ACTUATOR_STATE'], pressureAloneProvesSeating: false }
    },
    acceptableErrorIn: null, calibrationProcedure: null,
    disagreementRule: 'INVALIDATE_POSITION_REQUIRE_REFERENCE_REESTABLISHMENT',
    correctionDuringCutAuthorized: false,
    safetyFunctionClaimed: false
  },
  controlStack: {
    status: 'CANDIDATE_NOT_INSTALLED',
    application: 'PART_RELATIVE_DEFINITION_ONLY',
    store: 'CAPABILITY_MODELED_TRAVEL_AND_ECONOMICS',
    machineSite: 'REGISTERED_POSTPROCESSOR_LOCAL_COORDINATES_AND_CONFIGURATION',
    controllerCandidate: 'LinuxCNC / RS274-NGC / HAL',
    motionInterfaceCandidate: 'Mesa; axis and I/O inventory required before model selection',
    drives: 'Servo selection and sizing unresolved',
    startAuthority: 'LOCAL_OPERATOR_AND_VALIDATED_MACHINE_SAFETY',
    safetyIndependentOfApplication: true
  }
});

/** Reject unimplemented qualifiers instead of pricing a different, simpler spot. */
export function checkSpotImplementation(spot = {}) {
  const reasons = [];
  const unresolved = [];
  if (spot.orientation != null && !['FACE', 'EDGE'].includes(spot.orientation)) {
    reasons.push('SPOT_ORIENTATION_NOT_DECLARED');
  }
  if (spot.orientation === 'EDGE') unresolved.push('T5_EDGE_SPOT_ENVELOPE_REQUIRED');
  if (spot.toolDiameterIn != null && spot.toolDiameterIn !== 0.1875) reasons.push('SPOT_DIAMETER_FIXED_3_16');
  if (spot.diameterIn != null && spot.diameterIn !== 0.1875) reasons.push('SPOT_DIAMETER_FIXED_3_16');
  if (spot.fullDiameterPenetrationIn != null && spot.fullDiameterPenetrationIn !== 0.1875) {
    reasons.push('SPOT_FULL_DIAMETER_DEPTH_FIXED_3_16');
  }
  if (spot.operationContract != null && !['SPOT_ON_LOCATION/0.1', 'SPOT_ON_LOCATION/0.2'].includes(spot.operationContract)) {
    reasons.push('SPOT_OPERATION_CONTRACT_NOT_DECLARED');
  }
  if (spot.operationContract === 'SPOT_ON_LOCATION/0.2' || spot.fullDiameterPenetrationIn != null) {
    unresolved.push('SPOT_TOOL_POINT_GEOMETRY_REQUIRED');
  }
  if (spot.depthIn != null || spot.totalTipPenetrationIn != null || spot.pointAngleDeg != null || spot.pointAxialLengthIn != null) {
    unresolved.push('SPOT_DEPTH_REQUIRES_STORE_TOOL_CONFIGURATION');
  }
  if (spot.yFromFenceIn != null || spot.zFromTableIn != null) {
    unresolved.push('SPOT_EXPLICIT_TRANSVERSE_LOCATION_MODEL_REQUIRED');
  }
  return { reasons, unresolved };
}
