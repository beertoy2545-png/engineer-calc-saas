import { describe, expect, it } from "vitest";
import { calculateTrussAnalysis } from "./trussAnalysis";

describe("calculateTrussAnalysis", () => {
  // Reference case: EngineeringSkills.com "Direct Stiffness Method" tutorial
  // three-bar truss. Node coordinates reverse-derived from the given member
  // lengths/angles (7.211m at 303.7 deg, 6m at 270 deg, 7.211m at 236 deg,
  // all radiating from the free node) -> node1=(-4,6), node2=(0,6),
  // node3=(4,6) all pinned, node4=(0,0) free.
  // A=0.005 m^2 = 5000 mm^2, E=200 GPa.
  // Load at node 4: Fx=+100kN, Fy=-100kN.
  // Reference answer: u4=(1.17mm, -0.28mm),
  //   Member A(1-4)=122.31 kN (tension), B(2-4)=46.47 kN (tension),
  //   C(3-4)=-57.97 kN (compression).
  it("reproduces the reference three-bar truss solution", () => {
    const result = calculateTrussAnalysis({
      elasticModulusGpa: 200,
      nodes: [
        { id: 1, xM: -4, yM: 6, fixX: true, fixY: true, loadFxKn: 0, loadFyKn: 0 },
        { id: 2, xM: 0, yM: 6, fixX: true, fixY: true, loadFxKn: 0, loadFyKn: 0 },
        { id: 3, xM: 4, yM: 6, fixX: true, fixY: true, loadFxKn: 0, loadFyKn: 0 },
        { id: 4, xM: 0, yM: 0, fixX: false, fixY: false, loadFxKn: 100, loadFyKn: -100 },
      ],
      members: [
        { id: 1, nodeAId: 1, nodeBId: 4, areaMm2: 5000 },
        { id: 2, nodeAId: 2, nodeBId: 4, areaMm2: 5000 },
        { id: 3, nodeAId: 3, nodeBId: 4, areaMm2: 5000 },
      ],
    });

    expect(result.isStable).toBe(true);

    const node4 = result.nodeResults.find((n) => n.nodeId === 4)!;
    expect(node4.dxMm).toBeCloseTo(1.17, 1);
    expect(node4.dyMm).toBeCloseTo(-0.28, 1);

    const memberA = result.memberResults.find((m) => m.memberId === 1)!;
    const memberB = result.memberResults.find((m) => m.memberId === 2)!;
    const memberC = result.memberResults.find((m) => m.memberId === 3)!;

    expect(memberA.forceKn).toBeCloseTo(122.31, 0);
    expect(memberB.forceKn).toBeCloseTo(46.47, 0);
    expect(memberC.forceKn).toBeCloseTo(-57.97, 0);
  });

  it("satisfies global equilibrium: reactions balance the applied load", () => {
    const result = calculateTrussAnalysis({
      elasticModulusGpa: 200,
      nodes: [
        { id: 1, xM: -4, yM: 6, fixX: true, fixY: true, loadFxKn: 0, loadFyKn: 0 },
        { id: 2, xM: 0, yM: 6, fixX: true, fixY: true, loadFxKn: 0, loadFyKn: 0 },
        { id: 3, xM: 4, yM: 6, fixX: true, fixY: true, loadFxKn: 0, loadFyKn: 0 },
        { id: 4, xM: 0, yM: 0, fixX: false, fixY: false, loadFxKn: 100, loadFyKn: -100 },
      ],
      members: [
        { id: 1, nodeAId: 1, nodeBId: 4, areaMm2: 5000 },
        { id: 2, nodeAId: 2, nodeBId: 4, areaMm2: 5000 },
        { id: 3, nodeAId: 3, nodeBId: 4, areaMm2: 5000 },
      ],
    });

    const sumRx = result.nodeResults.reduce((s, n) => s + n.reactionFxKn, 0);
    const sumRy = result.nodeResults.reduce((s, n) => s + n.reactionFyKn, 0);
    // Reactions must balance the externally applied load (100, -100)
    expect(sumRx).toBeCloseTo(-100, 0);
    expect(sumRy).toBeCloseTo(100, 0);
  });

  it("flags an unstable mechanism (single member, cannot resist transverse load)", () => {
    const result = calculateTrussAnalysis({
      elasticModulusGpa: 200,
      nodes: [
        { id: 1, xM: 0, yM: 0, fixX: true, fixY: true, loadFxKn: 0, loadFyKn: 0 },
        { id: 2, xM: 5, yM: 0, fixX: false, fixY: false, loadFxKn: 0, loadFyKn: -10 },
      ],
      members: [{ id: 1, nodeAId: 1, nodeBId: 2, areaMm2: 1000 }],
    });
    expect(result.isStable).toBe(false);
  });

  it("computes a simple symmetric triangular truss with zero net horizontal displacement under a vertical load", () => {
    // Symmetric triangle: base nodes pinned, apex loaded straight down.
    const result = calculateTrussAnalysis({
      elasticModulusGpa: 200,
      nodes: [
        { id: 1, xM: -3, yM: 0, fixX: true, fixY: true, loadFxKn: 0, loadFyKn: 0 },
        { id: 2, xM: 3, yM: 0, fixX: true, fixY: true, loadFxKn: 0, loadFyKn: 0 },
        { id: 3, xM: 0, yM: 4, fixX: false, fixY: false, loadFxKn: 0, loadFyKn: -50 },
      ],
      members: [
        { id: 1, nodeAId: 1, nodeBId: 3, areaMm2: 2000 },
        { id: 2, nodeAId: 2, nodeBId: 3, areaMm2: 2000 },
      ],
    });
    const apex = result.nodeResults.find((n) => n.nodeId === 3)!;
    expect(apex.dxMm).toBeCloseTo(0, 3);

    const m1 = result.memberResults.find((m) => m.memberId === 1)!;
    const m2 = result.memberResults.find((m) => m.memberId === 2)!;
    expect(m1.forceKn).toBeCloseTo(m2.forceKn, 3);
    // Both members should be in compression under a downward load
    expect(m1.forceKn).toBeLessThan(0);
  });
});
