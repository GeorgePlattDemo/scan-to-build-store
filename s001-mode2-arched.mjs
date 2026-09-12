/**
 * S-001 Mode-2 arched-aperture family.
 * First published curvilinear Store Zero study envelope.
 * Does not replace SHEET_MODE2_STENCIL_V1.
 * Does not claim the entire Mode-2 disclosure.
 */
import { evaluateSheetMode2, S001_MODE2_ENVELOPE, sheetMode2NeutralOps } from "./s001-mode2-envelope.mjs";
import { evaluateCircularSegment, referenceArchedAperture } from "./circular-segment.mjs";

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
  tabWidth_in: null,
  tabPlacement: "UNRESOLVED_PHYSICAL_PARAMETER",
  referenceArchitecture: "S-001-MODE2-REFERENCE-ARCHITECTURE-0.1",
  controlsReference: "S-001-MODE2-CONTROLS-REFERENCE-0.1",
  stock: S001_MODE2_ENVELOPE.stock,
  requiredOps: S001_MODE2_ENVELOPE.requiredOps,
  cellFamily: "S-001",
  relationship: S001_MODE2_ENVELOPE.relationship
};

export const REFERENCE_ARCHED_APERTURE = referenceArchedAperture();

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
    (code) => code !== "PROFILE_KIND_MISSING"
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
  if (apertureW == null || apertureStraightH == null) {
    unresolved.push("APERTURE_SIZE_MISSING");
  } else if (!(Number.isFinite(apertureW) && Number.isFinite(apertureStraightH))) {
    reasons.push("APERTURE_SIZE_NOT_NUMERIC");
  } else if (!(apertureW > 0 && apertureStraightH > 0)) {
    reasons.push("APERTURE_SIZE_INVALID");
  } else if (curve.ok && Number.isFinite(req.outerL_in) && Number.isFinite(req.outerW_in)) {
    const openingH = apertureStraightH + curve.rise_in;
    const margin = env.minMarginIn;
    if (apertureW + 2 * margin > req.outerW_in || openingH + 2 * margin > req.outerL_in) {
      reasons.push("APERTURE_OUTSIDE_OUTER_PANEL");
    }
    if (apertureW !== curve.chord_in) {
      reasons.push("APERTURE_WIDTH_MUST_EQUAL_CHORD");
    }
  }

  if (req.geometryClass && req.geometryClass !== "CURVILINEAR") {
    reasons.push("GEOMETRY_CLASS_NOT_CURVILINEAR");
  }

  const status = reasons.length
    ? "REFUSED"
    : unresolved.length
      ? "UNRESOLVED"
      : "SUPPORTABLE";

  return {
    status,
    reasons,
    unresolved,
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
      tabCount: req.tabCount ?? null,
      tabWidth_in: env.tabWidth_in,
      placement: env.tabPlacement,
      fullSeverance: false,
      secondarySeparation: "OPERATOR_OR_LATER — not claimed automated"
    },
    secondarySeparation: "OPERATOR_OR_LATER — not claimed automated"
  };
}

export function sheetMode2ArchedNeutralOps(req = {}) {
  return sheetMode2NeutralOps({ tabCount: req.tabCount ?? 1 });
}
