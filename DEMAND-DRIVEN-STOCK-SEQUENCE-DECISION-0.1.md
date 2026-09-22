# Demand-driven stock and sequence — decision record

Scope: User-defined Store-selected board demand only.

Hidden assumptions removed on this path:
- a 60 in display/demo seed was acting as manufacturing input;
- the 24 in retained-control tail was being compared to finished-part length;
- one parent SKU was treated as fixed before sequence feasibility;
- User 1 economics were tied to the inherited 60 in sequence.

Disposition:
- finished-part length and quantity are requirements;
- parent SKU and parent length are Store resolution results;
- intermediate blank is absent unless a named rule requires it;
- retained-control is proved on each parent remainder, not on the finished part;
- 0.125 in kerf and 24 in retained tail are declared inputs;
- 2x4 wide-face-on-table is the declared presentation for this job.

Selection rule:
FEWEST_PARENTS_THEN_SHORTEST_PARENT. This is explicitly the fallback because no existing multi-part Store selection policy was present. It does not claim cheapest stock or least waste.

Still unresolved:
- spot tool point geometry;
- applicability of the legacy fixed spot cycle to the depth-defined spot;
- external support for parents longer than the declared D-001 unsupported envelope;
- physical execution remains unauthorized.
