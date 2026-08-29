import { describe, expect, it } from "vitest";
import { calculateJointEquilibrium } from "./biomechanics";

describe("calculateJointEquilibrium", () => {
  // Reference: classic OpenStax College Physics worked example.
  // r1=0.04m, r2=0.16m, r3=0.38m, forearm=2.5kg, load(book)=4.0kg, g=9.8
  // Reference answer: F_muscle=470N, F_joint=407N
  it("reproduces the OpenStax biceps/elbow worked example", () => {
    const result = calculateJointEquilibrium({
      muscleMomentArmM: 0.04,
      limbComDistanceM: 0.16,
      loadDistanceM: 0.38,
      limbMassKg: 2.5,
      loadMassKg: 4.0,
      gravityMs2: 9.8,
    });

    expect(result.totalWeightN).toBeCloseTo(63.7, 1);
    expect(result.muscleForceN).toBeCloseTo(470.4, 0);
    expect(result.jointReactionForceN).toBeCloseTo(406.7, 0);
    expect(result.forceMultiplier).toBeCloseTo(7.38, 1);
  });

  it("shows a larger muscle moment arm reduces required muscle force", () => {
    const smallArm = calculateJointEquilibrium({
      muscleMomentArmM: 0.04,
      limbComDistanceM: 0.16,
      loadDistanceM: 0.38,
      limbMassKg: 2.5,
      loadMassKg: 4.0,
      gravityMs2: 9.8,
    });
    const largeArm = calculateJointEquilibrium({
      muscleMomentArmM: 0.06,
      limbComDistanceM: 0.16,
      loadDistanceM: 0.38,
      limbMassKg: 2.5,
      loadMassKg: 4.0,
      gravityMs2: 9.8,
    });
    expect(largeArm.muscleForceN).toBeLessThan(smallArm.muscleForceN);
  });

  it("gives a mechanical advantage well below 1 (typical of human limb levers)", () => {
    const result = calculateJointEquilibrium({
      muscleMomentArmM: 0.04,
      limbComDistanceM: 0.16,
      loadDistanceM: 0.38,
      limbMassKg: 2.5,
      loadMassKg: 4.0,
      gravityMs2: 9.8,
    });
    expect(result.mechanicalAdvantage).toBeLessThan(1);
    expect(result.mechanicalAdvantage).toBeCloseTo(0.1053, 3);
  });
});
