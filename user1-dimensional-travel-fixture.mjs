export const USER1_DIMENSIONAL_TRAVEL_DEMAND = Object.freeze({
  title: "Start Your Own — User 1 X brace",
  configurationId: "SYO-USER1-XBRACE",
  configurationVersion: "0.1",
  classId: "app.user-defined-board.v1",
  materialDemand: Object.freeze({
    species: "spf",
    form: "board",
    nominalT: 2,
    nominalW: 4
  }),
  definedWorkpieceLengthIn: 60,
  requiredOps: Object.freeze(["MITER_LIMITED", "SPOT_ON_LOCATION"]),
  sawAngleDeg: 30,
  cutPlane: "miter-face",
  datumCMethod: "REFERENCE_CUT",
  declaredSawCuts: 3,
  declaredSpotCount: 2,
  unresolvedConditions: Object.freeze([]),
  parts: Object.freeze([
    Object.freeze({
      partId: "PART-1",
      lengthIn: 16,
      features: Object.freeze([
        Object.freeze({
          featureId: "SPOT-1",
          kind: "SPOT_ON_LOCATION",
          xIn: 8,
          locationRule: "CENTERED_ON_PART",
          acrossWidthRule: "CENTERED_ON_WIDE_FACE"
        })
      ])
    }),
    Object.freeze({
      partId: "PART-2",
      lengthIn: 16,
      features: Object.freeze([
        Object.freeze({
          featureId: "SPOT-2",
          kind: "SPOT_ON_LOCATION",
          xIn: 8,
          locationRule: "CENTERED_ON_PART",
          acrossWidthRule: "CENTERED_ON_WIDE_FACE"
        })
      ])
    })
  ])
});
