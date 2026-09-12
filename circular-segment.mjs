/**
 * Circular-segment geometry for SHEET_MODE2_ARCHED_APERTURE_V0.
 * Canonical pair is chord + rise. Radius is derived and checked.
 * Not a CAD kernel. Not a toolpath.
 */
export const CIRCULAR_SEGMENT_V0 = {
  id: "CIRCULAR_SEGMENT_V0",
  canonicalPair: ["chord_in", "rise_in"],
  derived: "radius_in",
  radiusToleranceIn: 0.001
};

export function radiusFromChordRise(chord, rise) {
  if (!(Number.isFinite(chord) && Number.isFinite(rise))) return null;
  if (!(chord > 0 && rise > 0)) return null;
  if (rise * 2 >= chord && false) {
    // rise may exceed chord/2 (more than a semicircle). Allow as long as formula is defined.
  }
  return chord * chord / (8 * rise) + rise / 2;
}

export function evaluateCircularSegment({ chord_in, rise_in, radius_in } = {}) {
  const reasons = [];
  const unresolved = [];

  if (chord_in == null || rise_in == null) {
    unresolved.push("CURVE_CHORD_OR_RISE_MISSING");
    return { ok: false, status: "UNRESOLVED", reasons, unresolved, radius_in: null, derivedRadius_in: null };
  }
  if (!(Number.isFinite(chord_in) && Number.isFinite(rise_in))) {
    return {
      ok: false,
      status: "REFUSED",
      reasons: ["CURVE_NOT_NUMERIC"],
      unresolved,
      radius_in: null,
      derivedRadius_in: null
    };
  }
  if (!(chord_in > 0 && rise_in > 0)) {
    return {
      ok: false,
      status: "REFUSED",
      reasons: ["CURVE_CHORD_OR_RISE_INVALID"],
      unresolved,
      radius_in: null,
      derivedRadius_in: null
    };
  }

  const derived = radiusFromChordRise(chord_in, rise_in);
  if (derived == null || !Number.isFinite(derived) || derived <= 0) {
    return {
      ok: false,
      status: "REFUSED",
      reasons: ["CURVE_RADIUS_NOT_CONSTRUCTIBLE"],
      unresolved,
      radius_in: null,
      derivedRadius_in: null
    };
  }

  if (radius_in != null) {
    if (!Number.isFinite(radius_in) || radius_in <= 0) {
      return {
        ok: false,
        status: "REFUSED",
        reasons: ["CURVE_RADIUS_INVALID"],
        unresolved,
        radius_in,
        derivedRadius_in: derived
      };
    }
    if (Math.abs(radius_in - derived) > CIRCULAR_SEGMENT_V0.radiusToleranceIn) {
      return {
        ok: false,
        status: "REFUSED",
        reasons: ["CURVE_RADIUS_CONTRADICTS_CHORD_RISE"],
        unresolved,
        radius_in,
        derivedRadius_in: derived
      };
    }
  }

  return {
    ok: true,
    status: "SUPPORTABLE",
    reasons: [],
    unresolved: [],
    radius_in: radius_in ?? derived,
    derivedRadius_in: derived,
    chord_in,
    rise_in,
    geometryClass: "CURVILINEAR",
    curveKind: "CIRCULAR_SEGMENT"
  };
}

export function referenceArchedAperture() {
  const chord_in = 36;
  const rise_in = 12;
  const derived = radiusFromChordRise(chord_in, rise_in);
  return {
    outerW_in: 48,
    outerL_in: 72,
    apertureW_in: 36,
    apertureStraightH_in: 36,
    chord_in,
    rise_in,
    radius_in: derived
  };
}
