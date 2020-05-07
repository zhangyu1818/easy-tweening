type ValueType = number | number[];

type onChangeCallBack<T> = (
  currentValue: T extends number ? number : number[]
) => void;

export interface Options<Value extends ValueType> {
  duration: number;
  value: [Value, Value];
  easing?: Easings;
  onChange?: onChangeCallBack<Value>;
  yoyo?: boolean;
  key?: any;
}

interface TweenObject<Value extends ValueType> {
  startTime?: number;
  elapsedTime?: number;
  from: Value;
  to: Value;
  duration: number;
  completed: () => void;
  easing: Easings;
  yoyo?: boolean;
  onChange?: onChangeCallBack<Value>;
  key?: any;
}

interface rAFType {
  all: Set<TweenObject<ValueType>>;
  add: (obj: TweenObject<ValueType>) => void;
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

const NEVER_USED_KEY = "@@NEVER_USED_KEY";

const easings: EasingFunc = {
  linear: (t) => t,
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => --t * t * t + 1,
  easeInOutCubic: (t) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInQuart: (t) => t * t * t * t,
  easeOutQuart: (t) => 1 - --t * t * t * t,
  easeInOutQuart: (t) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,
  easeInQuint: (t) => t * t * t * t * t,
  easeOutQuint: (t) => 1 + --t * t * t * t * t,
  easeInOutQuint: (t) =>
    t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t,
};

const getCurrentValue = (from: ValueType, to: ValueType, easing: number) => {
  if (Array.isArray(from) && Array.isArray(to)) {
    if (from.length !== to.length)
      throw new Error("when value type is Array,they should have same length");
    return from.map((fv, index) => {
      const tv = to[index];
      return fv + (tv - fv) * easing;
    });
  }
  if (typeof from === "number" && typeof to === "number")
    return from + (to - from) * easing;
  throw new Error("value must have same type");
};

const getProgress = ({ elapsedTime = 0, duration }: TweenObject<ValueType>) =>
  duration > 0 ? Math.min(elapsedTime / duration, 1) : 1;

const trackTime = (obj: TweenObject<ValueType>, now: number) => {
  if (!obj.startTime) obj.startTime = now;
  obj.elapsedTime = now - obj.startTime;
};

const removeTrack = (obj: TweenObject<ValueType>) => {
  delete obj.startTime;
  delete obj.elapsedTime;
};

const tick: FrameRequestCallback = (now) => {
  const { all } = rAF;
  all.forEach((current) => {
    trackTime(current, now);
    const progress = getProgress(current);
    const { from, to, completed, onChange, easing, yoyo } = current;
    const currentValue = getCurrentValue(from, to, easings[easing](progress));
    if (onChange) onChange(currentValue);
    if (progress < 1) return;
    if (yoyo) {
      [current.from, current.to] = [current.to, current.from];
      removeTrack(current);
      return;
    }
    completed();
    all.delete(current);
  });
  if (all.size) requestAnimationFrame(tick);
};

const rAF: rAFType = {
  all: new Set(),
  add(obj) {
    if (this.all.add(obj).size < 2) requestAnimationFrame(tick);
  },
};

const tweening = <Value extends ValueType>(
  option: Options<Value>
): Promise<void> =>
  new Promise((completed) => {
    const {
      value: [from, to],
      duration,
      key = NEVER_USED_KEY,
      onChange,
      easing = "linear",
      yoyo,
    } = option;
    const tweenObject: TweenObject<Value> = {
      from,
      to,
      duration,
      key,
      completed,
      onChange,
      easing,
      yoyo,
    };
    rAF.add(tweenObject);
  });

const stop = (key: any) => {
  const target = [...rAF.all].find((v) => v.key === key);
  if (target) rAF.all.delete(target);
};

const clear = () => {
  rAF.all.clear();
};

export default tweening;
export { stop, clear };
