# OpenCVPoint

[org.opencv.core.Point](https://docs.opencv.org/4.x/javadoc/org/opencv/core/Point.html) 别名.

Point 表示一个点, 作为控件信息时则表示点在屏幕的相对位置.

```js
let point = pickup(/.+/, '.');
console.log(`${point.x}, ${point.y}`);
```

常见相关方法或属性:

- [UiSelector.pickup](../automation/ui-selector.md#m-pickup)

> 本页聚焦 MonkeyKing 脚本中实际使用的构造与坐标属性；OpenCV 的其余 Java 方法请查阅上方官方类参考。

---

<p style="font: bold 2em sans-serif; color: #FF7043">org.opencv.core.Point</p>

---

## [C] org.opencv.core.Point

### [c] (x, y)

- **x** { [number](data-types.md#number) } - 点 X 坐标
- **y** { [number](data-types.md#number) } - 点 Y 坐标
- <ins>**returns**</ins> { [org.opencv.core.Point](#c-org-opencv-core-point) }

生成一个点.

```js
console.log(new org.opencv.core.Point(10, 20)); // {10.0, 20.0}
```

坐标不会被化为整型:

```js
console.log(new org.opencv.core.Point(10.8, 20.44)); // {10.8, 20.44}
```

### [c] ()

- <ins>**returns**</ins> { [org.opencv.core.Point](#c-org-opencv-core-point) }

生成一个点, 并初始化为 `{0, 0}` 坐标.

```js
console.log(new org.opencv.core.Point()); // {0.0, 0.0}
```

### [c] (points)

- **points** { [number](data-types.md#number)[[]](data-types.md#array) } - 点坐标数组
- <ins>**returns**</ins> { [org.opencv.core.Point](#c-org-opencv-core-point) }

生成一个点, 并按指定参数初始化坐标.

两个坐标:

```js
console.log(new org.opencv.core.Point([ 5, 23 ])); // {5.0, 23.0}
```

一个坐标, 此坐标作为 X 坐标, Y 坐标初始化为 0:

```js
console.log(new org.opencv.core.Point([ 5 ])); // {5.0, 0.0}
```

空数组, X 与 Y 坐标均为 0:

```js
console.log(new org.opencv.core.Point([])); // {0.0, 0.0}
```

超过两个坐标, 多余坐标将被忽略:

```js
console.log(new org.opencv.core.Point([ 5, 23, 7, 8, 9 ])); // {5.0, 23.0}
```

## [p#] x

- { [number](data-types.md#number) }

点 X 坐标.

如: Point(**180**, 440) 表示点距屏幕左边缘 180 像素.

## [p#] y

- { [number](data-types.md#number) }

点 Y 坐标.

如: Point(180, **440**) 表示点距屏幕上边缘 440 像素.
