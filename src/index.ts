type FromValue = number;
type ToValue = number;

type onChangeCallBack = (currentValue: number) => void;

export interface Options {
  duration: number;
  value: [FromValue, ToValue];
  easing?: Easings;
  onChange?: onChangeCallBack;
  key?: any;
}

interface TweenObject {
  startTime?: number;
  elapsedTime?: number;
  from: number;
  to: number;
  duration: number;
  completed: () => void;
  easing: Easings;
  onChange?: onChangeCallBack;
  key?: any;
}

interface rAFType {
  all: Set<TweenObject>;
  add: (obj: TweenObject) => void;
}

export type Easings =
  | "linear"
  | "easeInQuad"
  | "easeOutQuad"
  | "easeInOutQuad"
  | "easeInCubic"
  | "easeOutCubic"
  | "easeInOutCubic"
  | "easeInQuart"
  | "easeOutQuart"
  | "easeInOutQuart"
  | "easeInQuint"
  | "easeOutQuint"
  | "easeInOutQuint";

type EasingFunc = {
  [key in Easings]: (t: number) => number;
};

const easings: EasingFunc = {
  linear: t => t,
  easeInQuad: t => t * t,
  easeOutQuad: t => t * (2 - t),
  easeInOutQuad: t => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: t => t * t * t,
  easeOutCubic: t => --t * t * t + 1,
  easeInOutCubic: t =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInQuart: t => t * t * t * t,
  easeOutQuart: t => 1 - --t * t * t * t,
  easeInOutQuart: t => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t),
  easeInQuint: t => t * t * t * t * t,
  easeOutQuint: t => 1 + --t * t * t * t * t,
  easeInOutQuint: t =>
    t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t
};

const getCurrentValue = (from: number, to: number, easing: number) =>
  from + (to - from) * easing;

const getProgress = ({ elapsedTime = 0, duration }: TweenObject) =>
  duration > 0 ? Math.min(elapsedTime / duration, 1) : 1;

const trackTime = (obj: TweenObject, now: number) => {
  if (!obj.startTime) obj.startTime = now;
  obj.elapsedTime = now - obj.startTime;
};

const tick: FrameRequestCallback = now => {
  const { all } = rAF;
  all.forEach(current => {
    trackTime(current, now);
    const progress = getProgress(current);
    const { from, to, completed, onChange, easing } = current;
    const currentValue = getCurrentValue(from, to, easings[easing](progress));
    if (onChange) onChange(currentValue);
    if (progress < 1) return;
    completed();
    all.delete(current);
  });
  if (all.size) requestAnimationFrame(tick);
};

const rAF: rAFType = {
  all: new Set(),
  add(obj) {
    if (this.all.add(obj).size < 2) requestAnimationFrame(tick);
  }
};

const tweening = (option: Options): Promise<void> =>
  new Promise(completed => {
    const {
      value: [from, to],
      duration,
      key,
      onChange,
      easing = "linear"
    } = option;
    const tweenObject = {
      from,
      to,
      duration,
      key,
      completed,
      onChange,
      easing
    };
    rAF.add(tweenObject);
  });

const stop = (key: any) => {
  const target = [...rAF.all].find(v => v.key === key);
  if (target) rAF.all.delete(target);
};

export default tweening;
export { stop };
