// Control Systems Engineering: second-order system transient response and
// Ziegler-Nichols PID tuning — foundational tools used across mechatronics,
// process control, robotics, and automotive control. Formulas cross-checked
// via web search against independent references before implementation.
//
// Second-order underdamped step response, T(s) = wn^2 / (s^2 + 2*zeta*wn*s + wn^2):
//   wd  = wn * sqrt(1 - zeta^2)                       damped natural frequency
//   theta = acos(zeta)
//   td (delay time)   = (1 + 0.7*zeta) / wn
//   tr (rise time)    = (pi - theta) / wd
//   tp (peak time)    = pi / wd
//   %OS (overshoot)   = exp(-zeta*pi / sqrt(1-zeta^2)) * 100
//   ts (settling, 2%) = 4 / (zeta*wn)
//   ts (settling, 5%) = 3 / (zeta*wn)
// Valid for underdamped systems (0 < zeta < 1) only; overshoot/peak time
// are not meaningful for zeta >= 1 (no oscillation).
//
// Ziegler-Nichols closed-loop (ultimate sensitivity) PID tuning, from the
// ultimate gain Ku and ultimate oscillation period Tu found by increasing
// proportional gain alone until sustained oscillation:
//   P:   Kp = 0.5*Ku
//   PI:  Kp = 0.45*Ku,  Ti = Tu/1.2
//   PID: Kp = 0.6*Ku,   Ti = 0.5*Tu,  Td = 0.125*Tu
//
// Design-aid / educational tool only — real controller tuning should be
// verified against the actual plant response and refined in the field;
// Ziegler-Nichols settings are a starting point (typically ~25% overshoot),
// not a final production tuning.

export interface SecondOrderInput {
  naturalFreqRadS: number; // omega_n
  dampingRatio: number; // zeta
}

export interface SecondOrderResult {
  isUnderdamped: boolean;
  dampedFreqRadS: number;
  delayTimeS: number;
  riseTimeS: number | null;
  peakTimeS: number | null;
  percentOvershoot: number | null;
  settlingTime2PctS: number;
  settlingTime5PctS: number;
}

export function calculateSecondOrderResponse(
  input: SecondOrderInput,
): SecondOrderResult {
  const { naturalFreqRadS: wn, dampingRatio: zeta } = input;
  const isUnderdamped = zeta > 0 && zeta < 1;

  const wd = isUnderdamped ? wn * Math.sqrt(1 - zeta * zeta) : 0;
  const delayTimeS = (1 + 0.7 * zeta) / wn;
  const settlingTime2PctS = 4 / (zeta * wn);
  const settlingTime5PctS = 3 / (zeta * wn);

  if (!isUnderdamped) {
    return {
      isUnderdamped,
      dampedFreqRadS: wd,
      delayTimeS,
      riseTimeS: null,
      peakTimeS: null,
      percentOvershoot: null,
      settlingTime2PctS,
      settlingTime5PctS,
    };
  }

  const theta = Math.acos(zeta);
  const riseTimeS = (Math.PI - theta) / wd;
  const peakTimeS = Math.PI / wd;
  const percentOvershoot =
    Math.exp((-zeta * Math.PI) / Math.sqrt(1 - zeta * zeta)) * 100;

  return {
    isUnderdamped,
    dampedFreqRadS: wd,
    delayTimeS,
    riseTimeS,
    peakTimeS,
    percentOvershoot,
    settlingTime2PctS,
    settlingTime5PctS,
  };
}

// Unit-step response c(t) of the standard second-order system, normalized
// so the steady-state value is 1. Standard closed-form solutions (Nise/
// Ogata Control Systems textbooks) for each damping regime:
//
//   Underdamped (0<zeta<1):
//     c(t) = 1 - e^(-zeta*wn*t) * [cos(wd*t) + (zeta/sqrt(1-zeta^2))*sin(wd*t)]
//   Critically damped (zeta=1):
//     c(t) = 1 - e^(-wn*t) * (1 + wn*t)
//   Overdamped (zeta>1), with wd' = wn*sqrt(zeta^2-1):
//     c(t) = 1 - e^(-zeta*wn*t) * [cosh(wd'*t) + (zeta/sqrt(zeta^2-1))*sinh(wd'*t)]
//
// The underdamped curve's peak value at t=peak_time equals 1 + %OS/100,
// which is cross-checked against calculateSecondOrderResponse's own
// overshoot figure in the test suite.
export interface StepResponsePoint {
  tS: number;
  value: number;
}

export function calculateStepResponseCurve(
  input: SecondOrderInput,
  durationS: number,
  numPoints = 200,
): StepResponsePoint[] {
  const { naturalFreqRadS: wn, dampingRatio: zeta } = input;
  const points: StepResponsePoint[] = [];

  for (let i = 0; i < numPoints; i++) {
    const t = (durationS * i) / (numPoints - 1);
    let value: number;

    if (zeta <= 0) {
      // Undamped: pure oscillation, included for completeness/exploration.
      value = 1 - Math.cos(wn * t);
    } else if (zeta < 1) {
      const wd = wn * Math.sqrt(1 - zeta * zeta);
      value =
        1 -
        Math.exp(-zeta * wn * t) *
          (Math.cos(wd * t) + (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(wd * t));
    } else if (zeta === 1) {
      value = 1 - Math.exp(-wn * t) * (1 + wn * t);
    } else {
      const wdPrime = wn * Math.sqrt(zeta * zeta - 1);
      value =
        1 -
        Math.exp(-zeta * wn * t) *
          (Math.cosh(wdPrime * t) +
            (zeta / Math.sqrt(zeta * zeta - 1)) * Math.sinh(wdPrime * t));
    }

    points.push({ tS: t, value });
  }
  return points;
}

export interface ZieglerNicholsInput {
  ultimateGainKu: number;
  ultimatePeriodTuS: number;
}

export interface PidGains {
  kp: number;
  ti: number | null; // null = not used (P controller)
  td: number | null;
}

export interface ZieglerNicholsResult {
  p: PidGains;
  pi: PidGains;
  pid: PidGains;
}

export function calculateZieglerNicholsTuning(
  input: ZieglerNicholsInput,
): ZieglerNicholsResult {
  const { ultimateGainKu: ku, ultimatePeriodTuS: tu } = input;
  return {
    p: { kp: 0.5 * ku, ti: null, td: null },
    pi: { kp: 0.45 * ku, ti: tu / 1.2, td: null },
    pid: { kp: 0.6 * ku, ti: 0.5 * tu, td: 0.125 * tu },
  };
}
