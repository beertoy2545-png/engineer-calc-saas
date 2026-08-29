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
