/**
 * S-001 Mode-2 arched-aperture family.
 * First published curvilinear Store Zero study envelope.
 * Does not replace SHEET_MODE2_STENCIL_V1.
 * Does not claim the entire Mode-2 disclosure.
 */
import { evaluateSheetMode2, S001_MODE2_ENVELOPE, sheetMode2NeutralOps } from "./s001-mode2-envelope.mjs";
import { evaluateCircularSegment, referenceArchedAperture } from "./circular-segment.mjs";
import { STENCIL_TAB_POLICY_V0, planArchedStencilTabs } from "./stencil-tab-policy.mjs";

export const S001_MODE2_ARCHED_ENVELOPE = {
  id: "S001-MODE2-ARCHED-APERTURE-V0",
  capabilityId: "SHEET_MODE2_ARCHED_APERTURE_V0",
  parentCapabilityId: "SHEET_MODE2_STENCIL_V1",
  basis: "DECLARED_STAGE2_CAPABILITY",
  evidenceClass: "REFERENCE",
  measured: false,
  commissioned: false,
  physicalStatus: "NOT_CLAIMED",
  geometryClass: "CURVILINEAR",
  processClass: "MODE2_STENCIL_ROUTE",
  apertureKind: "ARCHED_RECT",
  outerKind: "STRAIGHT_RECT",
  minMarginIn: 3,
  workField: Object.freeze({
    id: "S001-CENTER-WORK-FIELD-V0",
    placement: "CENTERED_ON_PARENT",
    horizontalAxis: "PARENT_LONG_AXIS",
    verticalAxis: "PARENT_SHORT_AXIS",
    horizontalSpan_in: 48,
    verticalSpan_in: 36,
    containment: "WHOLE_PROFILE",
    edgeWork: "REFUSED_OUTSIDE_FIELD"
  }),
  tabPolicyId: STENCIL_TAB_POLICY_V0.id,
  tabWidth_in: STENCIL_TAB_POLICY_V0.minBridgeWidth_in,
  tabPlacement: STENCIL_TAB_POLICY_V0.placementMethod,
  referenceArchitecture: "S-001-MODE2-REFERENCE-ARCHITECTURE-0.1",
  controlsReference: "S-001-MODE2-CONTROLS-REFERENCE-0.1",
  stock: S001_MODE2_ENVELOPE.stock,
  requiredOps: S001_MODE2_ENVELOPE.requiredOps,
  cellFamily: "S-001",
  relationship: S001_MODE2_ENVELOPE.relationship
};

export const REFERENCE_ARCHED_APERTURE = referenceArchedAperture();

function centeredWorkFieldResult(req, apertureW, openingH) {
  const field = S001_MODE2_ARCHED_ENVELOPE.workField;
  if (!(Number.isFinite(req.outerL_in) && Number.isFinite(req.outerW_in))) return null;
  const parentContainsField = req.outerL_in >= field.horizontalSpan_in && req.outerW_in >= field.verticalSpan_in;
  const profileInsideField = Number.isFinite(apertureW) && Number.isFinite(openingH)
    ? apertureW <= field.horizontalSpan_in && openingH <= field.verticalSpan_in
    : null;
  return {
    id: field.id,
    placement: field.placement,
    horizontalAxis: field.horizontalAxis,
    verticalAxis: field.verticalAxis,
    horizontalSpan_in: field.horizontalSpan_in,
    verticalSpan_in: field.verticalSpan_in,
    containment: field.containment,
    parentContainsField,
    profileInsideField,
    parentMargins_in: {
      left: (req.outerL_in - field.horizontalSpan_in) / 2,
      right: (req.outerL_in - field.horizontalSpan_in) / 2,
      bottom: (req.outerW_in - field.verticalSpan_in) / 2,
      top: (req.outerW_in - field.verticalSpan_in) / 2
    },
    profileMarginsWithinField_in: profileInsideField
      ? {
          left: (field.horizontalSpan_in - apertureW) / 2,
          right: (field.horizontalSpan_in - apertureW) / 2,
          bottom: (field.verticalSpan_in - openingH) / 2,
          top: (field.verticalSpan_in - openingH) / 2
        }
      : null
  };
}

export function evaluateSheetMode2Arched(item, req = {}) {
  const env = S001_MODE2_ARCHED_ENVELOPE;
  const base = evaluateSheetMode2(item, {
    profileKind: "CURVILINEAR_OUTLINE",
    blankL_in: req.outerL_in,
    blankW_in: req.outerW_in,
    tabCount: req.tabCount,
    routeDepthIn: req.routeDepthIn,
    spline: req.spline,
    toolpath: req.toolpath,
    gcode: req.gcode,
    controller: req.controller
  });

  const reasons = [...base.reasons];
  const unresolved = [...base.unresolved].filter(
    (code) => code !== "PROFILE_KIND_MISSING" && code !== "CURVILINEAR_GEOMETRY_REQUIRED"
  );

  if (req.exteriorRatingRequested === true && item && item.grade !== "exterior" && item.rating !== "exterior") {
    unresolved.push("EXTERIOR_RATING_NOT_ESTABLISHED_BY_SKU");
  }

  const curve = evaluateCircularSegment({
    chord_in: req.arcChord_in,
    rise_in: req.arcRise_in,
    radius_in: req.arcRadius_in
  });
  if (!curve.ok) {
    reasons.push(...curve.reasons);
    unresolved.push(...curve.unresolved);
  }

  const apertureW = req.apertureW_in ?? req.arcChord_in;
  const apertureStraightH = req.apertureStraightH_in;
  let openingH = null;
  if (apertureW == null || apertureStraightH == null) {
    unresolved.push("APERTURE_SIZE_MISSING");
  } else if (!(Number.isFinite(apertureW) && Number.isFinite(apertureStraightH))) {
    reasons.push("APERTURE_SIZE_NOT_NUMERIC");
  } else if (!(apertureW > 0 && apertureStraightH > 0)) {
    reasons.push("APERTURE_SIZE_INVALID");
  } else if (curve.ok && Number.isFinite(req.outerL_in) && Number.isFinite(req.outerW_in)) {
    openingH = apertureStraightH + curve.rise_in;
    const margin = env.minMarginIn;
    if (apertureW + 2 * margin > req.outerL_in || openingH + 2 * margin > req.outerW_in) {
      reasons.push("APERTURE_OUTSIDE_OUTER_PANEL");
    }
    if (apertureW !== curve.chord_in) {
      reasons.push("APERTURE_WIDTH_MUST_EQUAL_CHORD");
    }
  }

  const workField = centeredWorkFieldResult(req, apertureW, openingH);
  if (workField && workField.parentContainsField === false) {
    reasons.push("CENTER_WORK_FIELD_OUTSIDE_PARENT");
  }
  if (workField && workField.profileInsideField === false) {
    reasons.push("CENTER_WORK_FIELD_EXCEEDED");
  }

  if (req.geometryClass && req.geometryClass !== "CURVILINEAR") {
    reasons.push("GEOMETRY_CLASS_NOT_CURVILINEAR");
  }

  let tabPlan = null;
  if (
    curve.ok &&
    Number.isFinite(apertureW) && apertureW > 0 &&
    Number.isFinite(apertureStraightH) && apertureStraightH > 0 &&
    apertureW === curve.chord_in
  ) {
    tabPlan = planArchedStencilTabs({
      chord_in: curve.chord_in,
      rise_in: curve.rise_in,
      radius_in: curve.radius_in,
      straightHeight_in: apertureStraightH,
      requestedTabCount: req.tabCount
    });
    if (!tabPlan.ok) {
      if (tabPlan.status === "REFUSED") reasons.push(tabPlan.reason);
      else unresolved.push(tabPlan.reason);
    }
  }

  const status = reasons.length
    ? "REFUSED"
    : unresolved.length
      ? "UNRESOLVED"
      : "SUPPORTABLE";

  return {
    status,
    reasons: [...new Set(reasons)],
    unresolved: [...new Set(unresolved)],
    envelope: env.id,
    capabilityId: env.capabilityId,
    parentCapabilityId: env.parentCapabilityId,
    evidenceClass: "REFERENCE",
    physicalStatus: "NOT_CLAIMED",
    measured: false,
    commissioned: false,
    geometryClass: curve.ok ? "CURVILINEAR" : null,
    processClass: env.processClass,
    profileKind: "ARCHED_APERTURE",
    outerKind: env.outerKind,
    apertureKind: env.apertureKind,
    workField,
    curve: curve.ok
      ? {
          kind: "CIRCULAR_SEGMENT",
          chord_in: curve.chord_in,
          rise_in: curve.rise_in,
          radius_in: curve.radius_in,
          derivedRadius_in: curve.derivedRadius_in
        }
      : null,
    retention: {
      class: "STENCIL_TABS",
      requestedTabCount: req.tabCount ?? null,
      plannedTabCount: tabPlan?.plannedTabCount ?? null,
      tabPolicyId: env.tabPolicyId,
      tabPlanStatus: tabPlan?.status ?? null,
      planningReserveTabs: tabPlan?.planningReserveTabs ?? STENCIL_TAB_POLICY_V0.planningReserveTabs,
      tabWidth_in: tabPlan?.minBridgeWidth_in ?? env.tabWidth_in,
      maxAllowedGap_in: tabPlan?.maxAllowedGap_in ?? STENCIL_TAB_POLICY_V0.maxAllowedGap_in,
      placement: env.tabPlacement,
      plan: tabPlan,
      fullSeverance: false,
      physicalRetentionStatus: STENCIL_TAB_POLICY_V0.physicalRetentionStatus,
      secondarySeparation: "OPERATOR_OR_LATER — not claimed automated"
    },
    secondarySeparation: "OPERATOR_OR_LATER — not claimed automated"
  };
}

export function sheetMode2ArchedNeutralOps(req = {}) {
  return sheetMode2NeutralOps({ tabCount: req.tabCount ?? 1 });
}
