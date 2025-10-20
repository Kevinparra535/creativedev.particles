/**
 * Easing functions (0..1 -> 0..1) migrated from legacy utils/ease.js
 * All functions are pure and assume t in [0,1].
 */

export type EasingFn = (t: number) => number;

export const Linear = {
  None: ((t: number) => t) as EasingFn,
};

export const Quad = {
  In: ((t: number) => t * t) as EasingFn,
  Out: ((t: number) => t * (2 - t)) as EasingFn,
  InOut: ((t: number) => (t * 2 < 1 ? 0.5 * (t * 2) * (t * 2) : -0.5 * ((--t * 2) * ((t * 2) - 2) - 1))) as EasingFn,
};

export const Cubic = {
  In: ((t: number) => t * t * t) as EasingFn,
  Out: ((t: number) => --t * t * t + 1) as EasingFn,
  InOut: ((t: number) => {
    t *= 2;
    if (t < 1) return 0.5 * t * t * t;
    t -= 2;
    return 0.5 * (t * t * t + 2);
  }) as EasingFn,
};

export const Quart = {
  In: ((t: number) => t * t * t * t) as EasingFn,
  Out: ((t: number) => 1 - --t * t * t * t) as EasingFn,
  InOut: ((t: number) => {
    t *= 2;
    if (t < 1) return 0.5 * t * t * t * t;
    t -= 2;
    return -0.5 * (t * t * t * t - 2);
  }) as EasingFn,
};

export const Quint = {
  In: ((t: number) => t * t * t * t * t) as EasingFn,
  Out: ((t: number) => --t * t * t * t * t + 1) as EasingFn,
  InOut: ((t: number) => {
    t *= 2;
    if (t < 1) return 0.5 * t * t * t * t * t;
    t -= 2;
    return 0.5 * (t * t * t * t * t + 2);
  }) as EasingFn,
};

export const Sine = {
  In: ((t: number) => 1 - Math.cos((t * Math.PI) / 2)) as EasingFn,
  Out: ((t: number) => Math.sin((t * Math.PI) / 2)) as EasingFn,
  InOut: ((t: number) => 0.5 * (1 - Math.cos(Math.PI * t))) as EasingFn,
};

export const Expo = {
  In: ((t: number) => (t === 0 ? 0 : Math.pow(1024, t - 1))) as EasingFn,
  Out: ((t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))) as EasingFn,
  InOut: ((t: number) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    t *= 2;
    if (t < 1) return 0.5 * Math.pow(1024, t - 1);
    return 0.5 * (-Math.pow(2, -10 * (t - 1)) + 2);
  }) as EasingFn,
};

export const Circ = {
  In: ((t: number) => 1 - Math.sqrt(1 - t * t)) as EasingFn,
  Out: ((t: number) => Math.sqrt(1 - --t * t)) as EasingFn,
  InOut: ((t: number) => {
    t *= 2;
    if (t < 1) return -0.5 * (Math.sqrt(1 - t * t) - 1);
    t -= 2;
    return 0.5 * (Math.sqrt(1 - t * t) + 1);
  }) as EasingFn,
};

// Elastic family with defaults amplitude=0.1, period=0.4 (as legacy)
const EL_A = 0.1;
const EL_P = 0.4;

export const Elastic = {
  In: ((t: number) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    let a = EL_A;
    const p = EL_P;
    let s: number;
    if (!a || a < 1) {
      a = 1;
      s = p / 4;
    } else {
      s = (p * Math.asin(1 / a)) / (2 * Math.PI);
    }
    t -= 1;
    return -(a * Math.pow(2, 10 * t) * Math.sin(((t - s) * 2 * Math.PI) / p));
  }) as EasingFn,
  Out: ((t: number) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    let a = EL_A;
    const p = EL_P;
    let s: number;
    if (!a || a < 1) {
      a = 1;
      s = p / 4;
    } else {
      s = (p * Math.asin(1 / a)) / (2 * Math.PI);
    }
    return a * Math.pow(2, -10 * t) * Math.sin(((t - s) * 2 * Math.PI) / p) + 1;
  }) as EasingFn,
  InOut: ((t: number) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    let a = EL_A;
    const p = EL_P;
    let s: number;
    if (!a || a < 1) {
      a = 1;
      s = p / 4;
    } else {
      s = (p * Math.asin(1 / a)) / (2 * Math.PI);
    }
    t *= 2;
    if (t < 1) {
      t -= 1;
      return -0.5 * a * Math.pow(2, 10 * t) * Math.sin(((t - s) * 2 * Math.PI) / p);
    }
    t -= 1;
    return a * Math.pow(2, -10 * t) * Math.sin(((t - s) * 2 * Math.PI) / p) * 0.5 + 1;
  }) as EasingFn,
};

export const Back = {
  In: ((t: number) => {
    const s = 1.70158;
    return t * t * ((s + 1) * t - s);
  }) as EasingFn,
  Out: ((t: number) => {
    const s = 1.70158;
    return --t * t * ((s + 1) * t + s) + 1;
  }) as EasingFn,
  InOut: ((t: number) => {
    const s = 1.70158 * 1.525;
    t *= 2;
    if (t < 1) return 0.5 * (t * t * ((s + 1) * t - s));
    t -= 2;
    return 0.5 * (t * t * ((s + 1) * t + s) + 2);
  }) as EasingFn,
};

export const Bounce = {
  In: ((t: number) => 1 - Bounce.Out(1 - t)) as EasingFn,
  Out: ((t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }) as EasingFn,
  InOut: ((t: number) => (t < 0.5 ? Bounce.In(t * 2) * 0.5 : Bounce.Out(t * 2 - 1) * 0.5 + 0.5)) as EasingFn,
};

// Convenience re-exports mirroring legacy naming
export const basic = { Linear, Quad, Cubic, Quart, Quint, Sine, Expo, Circ, Elastic, Back, Bounce };
export const linear = Linear;

export const easeInQuad = Quad.In;
export const easeOutQuad = Quad.Out;
export const easeInOutQuad = Quad.InOut;

export const easeInCubic = Cubic.In;
export const easeOutCubic = Cubic.Out;
export const easeInOutCubic = Cubic.InOut;

export const easeInQuart = Quart.In;
export const easeOutQuart = Quart.Out;
export const easeInOutQuart = Quart.InOut;

export const easeInQuint = Quint.In;
export const easeOutQuint = Quint.Out;
export const easeInOutQuint = Quint.InOut;

export const easeInSine = Sine.In;
export const easeOutSine = Sine.Out;
export const easeInOutSine = Sine.InOut;

export const easeInExpo = Expo.In;
export const easeOutExpo = Expo.Out;
export const easeInOutExpo = Expo.InOut;

export const easeInCirc = Circ.In;
export const easeOutCirc = Circ.Out;
export const easeInOutCirc = Circ.InOut;

export const easeInElastic = Elastic.In;
export const easeOutElastic = Elastic.Out;
export const easeInOutElastic = Elastic.InOut;

export const easeInBack = Back.In;
export const easeOutBack = Back.Out;
export const easeInOutBack = Back.InOut;

export const easeInBounce = Bounce.In;
export const easeOutBounce = Bounce.Out;
export const easeInOutBounce = Bounce.InOut;
