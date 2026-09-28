/**
 * REFERENCE stencil-tab planning policy for S-001 Mode-2 arched apertures.
 *
 * This is geometry/planning logic, not a physical holding-force model and not a
 * safety factor. Commercial CAM practice commonly exposes tab count/distance,
 * width/height, and manual/automatic placement. This V0 keeps those concerns
 * separate and does not invent unmeasured plywood retention constants.
 */
export const STENCIL_TAB_POLICY_V0 = Object.freeze({
  id: "S001-STENCIL-TAB-POLICY-V0",
  evidenceClass: "REFERENCE",
  physicalRetentionStatus: "NOT_MEASURED",
  placementMethod: "DISTRIBUTED_ARCLENGTH_TRANSITION_AVOIDANCE",
  referenceBaseCount: 4,
  planningReserveTabs: 1,
  maxAllowedGap_in: null,
  minBridgeWidth_in: null,
  minRemainingThickness_in: null,
  cornerKeepout_in: null,
  transitionKeepout_in: null,
  userVeto: "PLANNED_RE-SOLVE",
  // A routed piece that is split in two keeps at least this many tabs on each piece.
  minTabsPerRetainedPiece: 2,
  splitCenterKeepoutIn: 0.5,
  note:
    "The extra tab is a conservative planning reserve only. It is not a validated safety factor or proof of workholding sufficiency."
});

function finitePositive(value) {
  return Number.isFinite(value) && value > 0;
}

function round6(value) {
  return Number(value.toFixed(6));
}

export function archedAperturePerimeter({
  chord_in,
  rise_in,
  radius_in,
  straightHeight_in
} = {}) {
  if (![chord_in, rise_in, radius_in, straightHeight_in].every(finitePositive)) {
    return null;
  }
  const ratio = chord_in / (2 * radius_in);
  if (!(ratio > 0 && ratio <= 1)) return null;
  const arcAngle_rad = 2 * Math.asin(ratio);
  const arcLength_in = radius_in * arcAngle_rad;
  return {
    perimeter_in: chord_in + 2 * straightHeight_in + arcLength_in,
    arcAngle_rad,
    arcLength_in
  };
}

function transitionAvoidingPhase(perimeter, count, transitions) {
  const spacing = perimeter / count;
  const residues = transitions
    .map((value) => ((value % spacing) + spacing) % spacing)
    .sort((a, b) => a - b)
    .filter((value, index, list) => index === 0 || Math.abs(value - list[index - 1]) > 1e-9);
  if (residues.length === 0) return spacing / 2;

  let bestStart = residues[0];
  let bestGap = -1;
  for (let index = 0; index < residues.length; index += 1) {
    const start = residues[index];
    const end = index + 1 < residues.length ? residues[index + 1] : residues[0] + spacing;
    const gap = end - start;
    if (gap > bestGap) {
      bestGap = gap;
      bestStart = start;
    }
  }
  return (bestStart + bestGap / 2) % spacing;
}

function cyclicDistance(a, b, perimeter) {
  const raw = Math.abs(a - b) % perimeter;
  return Math.min(raw, perimeter - raw);
}

function pointAtArclength({ chord_in, rise_in, radius_in, straightHeight_in }, arclength_in) {
  const half = chord_in / 2;
  const base = chord_in;
  const rightTop = base + straightHeight_in;
  const geometry = archedAperturePerimeter({ chord_in, rise_in, radius_in, straightHeight_in });
  if (!geometry) return null;
  const arcEnd = rightTop + geometry.arcLength_in;
  const perimeter = geometry.perimeter_in;
  const s = ((arclength_in % perimeter) + perimeter) % perimeter;

  if (s < base) {
    return { segment: "BOTTOM", x_in: -half + s, y_in: 0, curved: false };
  }
  if (s < rightTop) {
    return { segment: "RIGHT_SIDE", x_in: half, y_in: s - base, curved: false };
  }
  if (s < arcEnd) {
    const centerY = straightHeight_in + rise_in - radius_in;
    const endpointOffsetY = radius_in - rise_in;
    const startAngle = Math.atan2(endpointOffsetY, half);
    const angle = startAngle + (s - rightTop) / radius_in;
    return {
      segment: "ARCH",
      x_in: radius_in * Math.cos(angle),
      y_in: centerY + radius_in * Math.sin(angle),
      curved: true
    };
  }
  return {
    segment: "LEFT_SIDE",
    x_in: -half,
    y_in: straightHeight_in - (s - arcEnd),
    curved: false
  };
}

export function planArchedStencilTabs({
  chord_in,
  rise_in,
  radius_in,
  straightHeight_in,
  requestedTabCount
} = {}) {
  const geometry = archedAperturePerimeter({ chord_in, rise_in, radius_in, straightHeight_in });
  if (!geometry) {
    return { ok: false, status: "UNRESOLVED", reason: "TAB_PLAN_GEOMETRY_UNRESOLVED" };
  }
  if (requestedTabCount != null && (!Number.isInteger(requestedTabCount) || requestedTabCount < 1)) {
    return { ok: false, status: "REFUSED", reason: "TAB_PLAN_COUNT_INVALID" };
  }

  const spacingRequired = STENCIL_TAB_POLICY_V0.maxAllowedGap_in == null
    ? 0
    : Math.ceil(geometry.perimeter_in / STENCIL_TAB_POLICY_V0.maxAllowedGap_in);
  const policyMinimum = Math.max(STENCIL_TAB_POLICY_V0.referenceBaseCount, spacingRequired);
  const policyTarget = policyMinimum + STENCIL_TAB_POLICY_V0.planningReserveTabs;
  const plannedTabCount = Math.max(requestedTabCount ?? 0, policyTarget);
  const nominalSpacing = geometry.perimeter_in / plannedTabCount;

  const transitionArclengths = [
    0,
    chord_in,
    chord_in + straightHeight_in,
    chord_in + straightHeight_in + geometry.arcLength_in
  ];
  const phase = transitionAvoidingPhase(
    geometry.perimeter_in,
    plannedTabCount,
    transitionArclengths
  );

  const candidates = [];
  for (let index = 0; index < plannedTabCount; index += 1) {
    const arclength = (phase + index * nominalSpacing) % geometry.perimeter_in;
    const point = pointAtArclength(
      { chord_in, rise_in, radius_in, straightHeight_in },
      arclength
    );
    const transitionDistance = Math.min(
      ...transitionArclengths.map((value) => cyclicDistance(arclength, value, geometry.perimeter_in))
    );
    candidates.push({
      index: index + 1,
      arclength_in: round6(arclength),
      normalizedArclength: round6(arclength / geometry.perimeter_in),
      segment: point.segment,
      curved: point.curved,
      x_in: round6(point.x_in),
      y_in: round6(point.y_in),
      distanceToNearestTransition_in: round6(transitionDistance)
    });
  }

  return {
    ok: true,
    status: "REFERENCE_PLAN_READY",
    policyId: STENCIL_TAB_POLICY_V0.id,
    evidenceClass: STENCIL_TAB_POLICY_V0.evidenceClass,
    physicalRetentionStatus: STENCIL_TAB_POLICY_V0.physicalRetentionStatus,
    placementMethod: STENCIL_TAB_POLICY_V0.placementMethod,
    requestedTabCount: requestedTabCount ?? null,
    referenceBaseCount: STENCIL_TAB_POLICY_V0.referenceBaseCount,
    spacingRequiredCount: spacingRequired || null,
    planningReserveTabs: STENCIL_TAB_POLICY_V0.planningReserveTabs,
    plannedTabCount,
    perimeter_in: round6(geometry.perimeter_in),
    arcLength_in: round6(geometry.arcLength_in),
    nominalSpacing_in: round6(nominalSpacing),
    maxAllowedGap_in: STENCIL_TAB_POLICY_V0.maxAllowedGap_in,
    minBridgeWidth_in: STENCIL_TAB_POLICY_V0.minBridgeWidth_in,
    minRemainingThickness_in: STENCIL_TAB_POLICY_V0.minRemainingThickness_in,
    cornerKeepout_in: STENCIL_TAB_POLICY_V0.cornerKeepout_in,
    transitionKeepout_in: STENCIL_TAB_POLICY_V0.transitionKeepout_in,
    userVeto: STENCIL_TAB_POLICY_V0.userVeto,
    candidates,
    physicalNote:
      "Reference tab-plan geometry is complete. Bridge width, retained thickness, maximum proven gap, and physical holding performance remain unmeasured."
  };
}

// A straight split along the aperture's vertical centerline turns the retained center into two pieces.
// Each piece keeps at least minTabsPerRetainedPiece tabs. Tabs within the keepout of the split line
// count for neither piece. Missing tabs are added at the middle of that piece's largest open stretch.
export function planSplitStencilTabs(plan, geometry) {
  if (!plan || !plan.ok) return plan;
  const keepout = STENCIL_TAB_POLICY_V0.splitCenterKeepoutIn;
  const need = STENCIL_TAB_POLICY_V0.minTabsPerRetainedPiece;
  const perimeter = plan.perimeter_in;
  const candidates = plan.candidates.map((tab) => ({ ...tab, addedForSplit: false }));
  const sideOf = (tab) => (tab.x_in > keepout ? "RIGHT" : tab.x_in < -keepout ? "LEFT" : "ON_SPLIT");
  // The split line meets the perimeter at the bottom center and at the arch apex.
  const bottomCenter = geometry.chord_in / 2;
  const apex = geometry.chord_in + geometry.straightHeight_in + plan.arcLength_in / 2;
  const sides = {
    RIGHT: [bottomCenter, apex],
    LEFT: [apex, perimeter + bottomCenter]
  };
  const added = [];
  for (const side of ["RIGHT", "LEFT"]) {
    let count = candidates.filter((tab) => sideOf(tab) === side).length;
    while (count < need) {
      const [start, end] = sides[side];
      const marks = [start, end, ...candidates
        .map((tab) => tab.arclength_in)
        .map((s) => (s < start ? s + perimeter : s))
        .filter((s) => s > start && s < end)].sort((a, b) => a - b);
      let best = { gap: -1, at: null };
      for (let i = 0; i + 1 < marks.length; i += 1) {
        const gap = marks[i + 1] - marks[i];
        if (gap > best.gap) best = { gap, at: marks[i] + gap / 2 };
      }
      const s = best.at % perimeter;
      const point = pointAtArclength(geometry, s);
      const tab = {
        index: candidates.length + 1,
        arclength_in: round6(s),
        normalizedArclength: round6(s / perimeter),
        segment: point.segment,
        curved: point.curved,
        x_in: round6(point.x_in),
        y_in: round6(point.y_in),
        distanceToNearestTransition_in: null,
        addedForSplit: true
      };
      candidates.push(tab);
      added.push(tab.index);
      count += 1;
    }
  }
  const tabsOnSide = (side) => candidates.filter((tab) => sideOf(tab) === side).length;
  return {
    ...plan,
    status: "REFERENCE_PLAN_READY",
    plannedTabCount: candidates.length,
    candidates,
    split: {
      line: "VERTICAL_CENTERLINE",
      minTabsPerRetainedPiece: need,
      keepout_in: keepout,
      leftPieceTabs: tabsOnSide("LEFT"),
      rightPieceTabs: tabsOnSide("RIGHT"),
      tabsOnSplitLine: tabsOnSide("ON_SPLIT"),
      addedForSplit: added
    }
  };
}
