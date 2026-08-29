// 2D pin-jointed truss solver using the Direct Stiffness Method (matrix
// structural analysis) — a genuine numerical method, not a closed-form
// formula, unlike the other calculators in this project. This is a small,
// simplified step toward the kind of analysis a full FEA package (e.g.
// ANSYS) performs — it handles 2D truss (axial-force-only, pin-jointed)
// members exclusively. It does not do beams/frames with bending, plates,
// solids, meshing, or nonlinear/dynamic analysis.
//
// Method: for each member, build its 4x4 local stiffness matrix in global
// coordinates and assemble into the global stiffness matrix K. Partition
// by free/fixed DOFs, solve K_ff * u_f = F_f for the free-DOF
// displacements (Gaussian elimination with partial pivoting), then back
// out support reactions and member axial forces.
//
// Validated against a fully-worked textbook three-bar truss example
// (engineeringskills.com "Direct Stiffness Method" tutorial): a 3-support
// truss loaded at one free node reproduces the reference member forces
// (122.31, 46.47, -57.97 kN) and nodal displacement (1.17, -0.28 mm) to
// within numerical tolerance — see trussAnalysis.test.ts.
//
// Design-aid / educational tool only — not a substitute for a licensed
// structural engineer's full analysis (including buckling, connections,
// and code-mandated load combinations) before construction.

export interface TrussNode {
  id: number;
  xM: number;
  yM: number;
  fixX: boolean;
  fixY: boolean;
  loadFxKn: number;
  loadFyKn: number;
}

export interface TrussMember {
  id: number;
  nodeAId: number;
  nodeBId: number;
  areaMm2: number;
}

export interface TrussInput {
  nodes: TrussNode[];
  members: TrussMember[];
  elasticModulusGpa: number;
}

export interface TrussNodeResult {
  nodeId: number;
  dxMm: number;
  dyMm: number;
  reactionFxKn: number;
  reactionFyKn: number;
}

export interface TrussMemberResult {
  memberId: number;
  lengthM: number;
  forceKn: number; // positive = tension, negative = compression
  stressMpa: number;
}

export interface TrussOutput {
  nodeResults: TrussNodeResult[];
  memberResults: TrussMemberResult[];
  isStable: boolean;
}

// Solve a dense linear system A*x = b via Gaussian elimination with
// partial pivoting. Returns null if the matrix is singular (unstable
// mechanism / insufficient supports).
function solveLinearSystem(aIn: number[][], bIn: number[]): number[] | null {
  const n = bIn.length;
  const a = aIn.map((row) => [...row]);
  const b = [...bIn];

  for (let col = 0; col < n; col++) {
    let pivotRow = col;
    let maxAbs = Math.abs(a[col][col]);
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(a[row][col]) > maxAbs) {
        maxAbs = Math.abs(a[row][col]);
        pivotRow = row;
      }
    }
    if (maxAbs < 1e-9) return null;

    if (pivotRow !== col) {
      [a[col], a[pivotRow]] = [a[pivotRow], a[col]];
      [b[col], b[pivotRow]] = [b[pivotRow], b[col]];
    }

    for (let row = col + 1; row < n; row++) {
      const factor = a[row][col] / a[col][col];
      for (let k = col; k < n; k++) a[row][k] -= factor * a[col][k];
      b[row] -= factor * b[col];
    }
  }

  const x = new Array(n).fill(0);
  for (let row = n - 1; row >= 0; row--) {
    let sum = b[row];
    for (let k = row + 1; k < n; k++) sum -= a[row][k] * x[k];
    x[row] = sum / a[row][row];
  }
  return x;
}

export function calculateTrussAnalysis(input: TrussInput): TrussOutput {
  const nodes = input.nodes;
  const n = nodes.length;
  const dof = 2 * n;
  const nodeIndex = new Map(nodes.map((node, i) => [node.id, i]));
  const eMpa = input.elasticModulusGpa * 1000; // GPa -> MPa (N/mm^2)

  const K = Array.from({ length: dof }, () => new Array(dof).fill(0));

  const memberGeom = input.members.map((m) => {
    const ia = nodeIndex.get(m.nodeAId)!;
    const ib = nodeIndex.get(m.nodeBId)!;
    const a = nodes[ia];
    const b = nodes[ib];
    const dxM = b.xM - a.xM;
    const dyM = b.yM - a.yM;
    const lengthM = Math.sqrt(dxM * dxM + dyM * dyM);
    const c = dxM / lengthM;
    const s = dyM / lengthM;
    // stiffness EA/L, with E in MPa (N/mm^2), A in mm^2, L in mm -> N/mm
    const kAxial = (eMpa * m.areaMm2) / (lengthM * 1000);
    return { m, ia, ib, lengthM, c, s, kAxial };
  });

  for (const { ia, ib, c, s, kAxial } of memberGeom) {
    const ke = [
      [c * c, c * s, -c * c, -c * s],
      [c * s, s * s, -c * s, -s * s],
      [-c * c, -c * s, c * c, c * s],
      [-c * s, -s * s, c * s, s * s],
    ].map((row) => row.map((v) => v * kAxial));

    const dofs = [2 * ia, 2 * ia + 1, 2 * ib, 2 * ib + 1];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        K[dofs[i]][dofs[j]] += ke[i][j];
      }
    }
  }

  // Global load vector (kN -> N, since stiffness is in N/mm; displacements
  // come out in mm as a result).
  const F = new Array(dof).fill(0);
  nodes.forEach((node, i) => {
    F[2 * i] = node.loadFxKn * 1000;
    F[2 * i + 1] = node.loadFyKn * 1000;
  });

  const fixed = new Array(dof).fill(false);
  nodes.forEach((node, i) => {
    fixed[2 * i] = node.fixX;
    fixed[2 * i + 1] = node.fixY;
  });

  const freeDofs: number[] = [];
  for (let i = 0; i < dof; i++) if (!fixed[i]) freeDofs.push(i);

  const kFF = freeDofs.map((r) => freeDofs.map((c) => K[r][c]));
  const fF = freeDofs.map((r) => F[r]);

  const uFree = solveLinearSystem(kFF, fF);
  const isStable = uFree !== null;

  const u = new Array(dof).fill(0);
  if (isStable) {
    freeDofs.forEach((globalIdx, i) => {
      u[globalIdx] = uFree![i];
    });
  }

  // Reactions at fixed DOFs: R = K*u - F_applied
  const reactionsN = new Array(dof).fill(0);
  for (let i = 0; i < dof; i++) {
    if (!fixed[i]) continue;
    let sum = 0;
    for (let j = 0; j < dof; j++) sum += K[i][j] * u[j];
    reactionsN[i] = sum - F[i];
  }

  const nodeResults: TrussNodeResult[] = nodes.map((node, i) => ({
    nodeId: node.id,
    dxMm: u[2 * i],
    dyMm: u[2 * i + 1],
    reactionFxKn: fixed[2 * i] ? reactionsN[2 * i] / 1000 : 0,
    reactionFyKn: fixed[2 * i + 1] ? reactionsN[2 * i + 1] / 1000 : 0,
  }));

  const memberResults: TrussMemberResult[] = memberGeom.map(
    ({ m, ia, ib, lengthM, c, s, kAxial }) => {
      const dxDisp = u[2 * ib] - u[2 * ia];
      const dyDisp = u[2 * ib + 1] - u[2 * ia + 1];
      const elongationMm = c * dxDisp + s * dyDisp;
      const forceN = kAxial * elongationMm;
      return {
        memberId: m.id,
        lengthM,
        forceKn: forceN / 1000,
        stressMpa: forceN / m.areaMm2,
      };
    },
  );

  return { nodeResults, memberResults, isStable };
}
