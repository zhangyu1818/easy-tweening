# easy-tweening

- 仅1kb(gzipped)的补间动画库
- 支持多种缓动算法
- 使用Typescript编写，自动推断类型

## 安装

```sh
$ npm install easy-tweening
```

## 使用说明

| 参数     	| 描述                     	| 类型                          	| 默认值 	|
|----------	|--------------------------	|-------------------------------	|--------	|
| duration 	| 动画持续时间（毫秒）     	| number                        	| -      	|
| easing   	| 缓动动画                 	| 见下方                        	    | linear 	|
| value    	| 需要计算的值             	| number\|number[]               	| -      	|
| onChange 	| 每帧计算后调用的回调函数 	| (value:number\|number[])=>void 	| -      	|

easing类型：`linear`
           | `easeInQuad`
           | `easeOutQuad`
           | `easeInOutQuad`
           | `easeInCubic`
           | `easeOutCubic`
           | `easeInOutCubic`
           | `easeInQuart`
           | `easeOutQuart`
           | `easeInOutQuart`
           | `easeInQuint`
           | `easeOutQuint`
           | `easeInOutQuint`;

**基本使用**

```javascript
import tweening from "easy-tweening";

const element = document.querySelector(".box");
tweening({
  duration: 3000,
  easing: "easeInOutQuad",
  value: [0, 200],
  onChange(x) {
    element.style.transform = `translateX(${x}px)`;
  }
})
```

**计算多个值**

```javascript
import tweening from "easy-tweening";

const element = document.querySelector(".box");
tweening({
  duration: 3000,
  easing: "easeInOutQuad",
  value: [
    [0, 100],
    [200, 500]
  ],
  onChange([x, y]) {
    element.style.transform = `translate(${x}px,${y}px)`;
  }
});
```

**补间动画完成后调用**

本质上返回的是一个`Promise`，在动画执行完后会调用`resolve`

```javascript
import tweening from "easy-tweening";

const element = document.querySelector(".box");
tweening({
  duration: 3000,
  easing: "easeInOutQuad",
  value: [0, 1],
  onChange(opacity) {
    element.style.opacity = String(opacity);
  }
}).then(() => {
  console.log("completed");
});
```

**停止动画**

传入参数`key`，`key`可以为任何值，元素、字符串、数字、对象,`tweening`会寻找`key`相同的元素，将其移出动画队列，所以确保`key`的唯一

```javascript
import tweening, { stop } from "easy-tweening";

const element = document.querySelector(".box");
tweening({
  key: element,
  duration: 3000,
  easing: "easeInOutQuad",
  value: [0, 1],
  onChange(opacity) {
    element.style.opacity = String(opacity);
  }
});

stop(element);
```

## 使用许可

[MIT](/LICENSE)
