# 传感器 (Sensors)

sensors模块提供了获取手机上的传感器的信息的支持, 这些传感器包括距离传感器、光线光感器、重力传感器、方向传感器等. 需要指出的是, 脚本只能获取传感器的数据, **不能模拟或伪造传感器的数据和事件**, 因此诸如模拟摇一摇的功能是无法实现的.

要监听一个传感器时, 需要使用`sensors.register()`注册监听器, 之后才能开始监听；不需要监听时则调用`sensors.unregister()`注销监听器. 在脚本结束时会自动注销所有的监听器. 同时, 这种监听会使脚本保持运行状态, 如果不注销监听器, 脚本会一直保持运行状态.

例如, 监听光线传感器的代码为：

```
//光线传感器监听
sensors.register("light").on("change", (event, light)=>{
    log("当前光强度为", light);
});
```

要注意的是, 每个传感器的数据并不相同, 所以对他们调用`on()`监听事件时的回调函数参数也不是相同, 例如光线传感器参数为`(event, light)`, 加速度传感器参数为`(event, ax, ay, az)`. 甚至在某些设备上的传感器参数有所增加, 例如华为手机的距离传感器为三个参数, 一般手机只有一个参数.

常用的传感器及其事件参数如下表：

* `accelerometer` 加速度传感器, 参数`(event, ax, ay, az)`:
    * `event` SensorEvent 传感器事件, 用于获取传感器数据变化时的所有信息
    * `ax` {number} x轴上的加速度, 单位m/s^2
    * `ay` {number} y轴上的加速度, 单位m/s^2
    * `az` {number} z轴上的加速度, 单位m/s^2
x 轴和 y 轴位于设备屏幕平面内，z 轴垂直于设备屏幕表面。

* `orientation` 方向传感器, 参数`(event, azimuth, pitch, roll)`:
    * `event` SensorEvent 传感器事件, 用于获取传感器数据变化时的所有信息
    * `azimuth` {number} 方位角, 从地磁指北方向线起, 依顺时针方向到y轴之间的水平夹角, 单位角度, 范围0~359
    * `pitch` {number} 绕x轴旋转的角度, 当设备水平放置时该值为0, 当设备顶部翘起时该值为正数, 当设备尾部翘起时该值为负数, 单位角度, 范围-180~180
    * `roll` {number} 绕y轴顺时针旋转的角度, 单位角度, 范围-90~90

* `gyroscope` 陀螺仪传感器, 参数`(event, wx, wy, wz)`:
    * `event` SensorEvent 传感器事件, 用于获取传感器数据变化时的所有信息
    * `wx` {number} 绕x轴的角速度, 单位弧度/s
    * `wy` {number} 绕y轴的角速度, 单位弧度/s
    * `wz` {number} 绕z轴的角速度, 单位弧度/s

* `magnetic_field` 磁场传感器, 参数`(event, bx, by, bz)`:
    * `event` SensorEvent 传感器事件, 用于获取传感器数据变化时的所有信息
    * `bx` {number} x轴上的磁场强度, 单位uT
    * `by` {number} y轴上的磁场强度, 单位uT
    * `bz` {number} z轴上的磁场强度, 单位uT

* `gravity` 重力传感器, 参数`(event, gx, gy, gz)`:
    * `event` SensorEvent 传感器事件, 用于获取传感器数据变化时的所有信息
    * `gx` {number} x轴上的重力加速度, 单位m/s^2
    * `gy` {number} y轴上的重力加速度, 单位m/s^2
    * `gz` {number} z轴上的重力加速度, 单位m/s^2

* `linear_acceleration` 线性加速度传感器, 参数`(event, ax, ay, az)`:
    * `event` SensorEvent 传感器事件, 用于获取传感器数据变化时的所有信息
    * `ax` {number} x轴上的线性加速度, 单位m/s^2
    * `ay` {number} y轴上的线性加速度, 单位m/s^2
    * `az` {number} z轴上的线性加速度, 单位m/s^2

* `ambient_temperature` 环境温度传感器, 大部分设备并不支持, 参数`(event, t)`:
    * `event` SensorEvent 传感器事件, 用于获取传感器数据变化时的所有信息
    * `t` {number} 环境温度, 单位摄氏度.

* `light` 光线传感器, 参数`(event, light)`:
    * `event` SensorEvent 传感器事件, 用于获取传感器数据变化时的所有信息
    * `light` {number} 环境光强度, 单位lux

* `pressure` 压力传感器, 参数`(event, p)`:
    * `event` SensorEvent 传感器事件, 用于获取传感器数据变化时的所有信息
    * `p` {number} 大气压, 单位hPa

* `proximity` 距离传感器, 参数`(event, distance)`:
    * `event` SensorEvent 传感器事件, 用于获取传感器数据变化时的所有信息
    * `distance` {number} 一般指设备前置摄像头旁边的距离传感器到前方障碍物的距离, 并且很多设备上这个值只有两种情况：当障碍物较近时该值为0, 当障碍物较远或在范围内没有障碍物时该值为5

* `relative_humidity` 湿度传感器, 大部分设备并不支持, 参数`(event, rh)`:
    * `event` SensorEvent 传感器事件, 用于获取传感器数据变化时的所有信息
    * `rh` {number} 相对湿度, 范围为0~100（百分比）

## sensors.register(sensorName[, delay])

* `sensorName` {string} 传感器名称, 常用的传感器名称如上面所述
* `delay` {number} 传感器数据更新频率, 可选, 默认为`sensors.delay.normal`. 可用的值如下：
    * `sensors.delay.normal` 正常频率
    * `sensors.delay.ui` 适合于用户界面的更新频率
    * `sensors.delay.game` 适合于游戏的更新频率
    * `sensors.delay.fastest` 最快的更新频率】
* 返回 [SensorEventEmiiter](#sensoreventemitter)

注册一个传感器监听并返回[SensorEventEmitter](#sensoreventemitter).

例如:

```
console.show();
//注册传感器监听
var sensor = sensors.register("gravity");
if(sensor == null){
    toast("不支持重力传感器");
    exit();
}
//监听数据
sensor.on("change", (gx, gy, gz)=>{
    log("重力加速度: %d, %d, %d", gx, gy, gz);
});
```

可以通过delay参数来指定传感器数据的更新频率, 例如：

```
var sensor = sensors.register("gravity", sensors.delay.game);
```

另外, 如果不支持`sensorName`所指定的传感器, 那么该函数将返回`null`；但如果`sensors.ignoresUnsupportedSensor`的值被设置为`true`, 则该函数会返回一个不会分发任何传感器事件的[SensorEventEmitter](#sensoreventemitter).

例如:

```
sensors.ignoresUnsupportedSensor = true;
//无需null判断
sensors.register("gravity").on("change", (gx, gy, gz)=>{
    log("重力加速度: %d, %d, %d", gx, gy, gz);
});
```

更多信息, 参见[SensorEventEmitter](#sensoreventemitter)和[sensors.ignoresUnsupportedSensor](#sensors-ignoresunsupportedsensor).

## sensors.unregister(emitter)

* `emiiter` [SensorEventEmitter](#sensoreventemitter)

注销该传感器监听器. 被注销的监听器将不再能监听传感器数据.

```
//注册一个传感器监听器
var sensor = sensors.register("gravity");
if(sensor == null){
    exit();
}
//2秒后注销该监听器
setTimeout(()=> {
    sensors.unregister(sensor);
}, 2000);
```

## sensors.unregisterAll()

注销所有传感器监听器.

## sensors.ignoresUnsupportedSensor

* {boolean}

表示是否忽略不支持的传感器. 如果该值被设置为`true`, 则函数`sensors.register()`即使对不支持的传感器也会返回一个无任何数据的虚拟传感器监听, 也就是`sensors.register()`不会返回`null`从而避免非空判断, 并且此时会触发`sensors`的"unsupported_sensor"事件.

```
//忽略不支持的传感器
sensors.ignoresUnsupportedSensor = true;
//监听有不支持的传感器时的事件
sensors.on("unsupported_sensor", function(sensorName){
    toastLog("不支持的传感器: " + sensorName);
});
//随便注册一个不存在的传感器.
log(sensors.register("aaabbb"));
```

## 事件: 'unsupported_sensor'

* `sensorName` {string} 不支持的传感器名称

当`sensors.ignoresUnsupportedSensor`被设置为`true`并且有不支持的传感器被注册时触发该事件. 事件参数的传感器名称.

# SensorEventEmitter

注册传感器返回的对象, 其本身是一个EventEmmiter, 用于监听传感器事件.

## 事件: 'change'

* `..args` {Any} 传感器参数

当传感器数据改变时触发该事件；该事件触发的最高频繁由`sensors.register()`指定的delay参数决定.

事件参数根据传感器类型不同而不同, 具体参见本章最前面的列表.

一个监听光线传感器和加速度传感器并且每0.5秒获取一个数据并最终写入一个csv表格文件的例子如下：

```
//csv文件路径
cosnt csvPath = "/sdcard/sensors_data.csv";
//记录光线传感器的数据
var light = 0;
//记录加速度传感器的数据
var ax = 0;
var ay = 0;
var az = 0;
//监听光线传感器
sensors.register("light", sensors.delay.fastest)
    .on("change", l => {
        light = l;
    });
//监听加速度传感器
sensors.register("accelerometer", sensors.delay.fastest)
    .on("change", (ax0, ay0, az0) => {
        ax = ax0;
        ay = ay0;
        az = az0;
    });

var file = open(csvPath, "w");
//写csv表格头
file.writeline("light,ax,ay,az")
//每0.5秒获取一次数据并写入文件
setInterval(()=>{
    file.writeline(util.format("%d,%d,%d,%d", light, ax, ay, az));
}, 500);
//10秒后退出并打开文件
setTimeout(()=>{
    file.close();
    sensors.unregsiterAll();
    app.viewFile(csvPath);
}, 10 * 1000);

```

## 事件: 'accuracy_change'

* `accuracy` {number} 表示传感器精度. 为以下值之一:
    * -1 传感器未连接
    * 0 传感器不可读
    * 1 低精度
    * 2 中精度
    * 3 高精度

当传感器精度改变时会触发的事件. 比较少用.

<!-- api-contracts:start -->

## API 合同表

下表覆盖本页在当前公开 API 中的每个 canonical 公共成员。每行同时给出稳定锚点、实现合同、参数与返回合同、权限与线程、生命周期与副作用、版本，以及可独立执行的 Rhino 2.0 成员存在性或值读取示例。对象实例名（如 `db`、`cursor`、`storage`）沿用本页正文中的创建方式。

| API ID / 稳定锚点 | 签名或入口 | 参数、可选项与默认值 | 返回值与异常 | 权限与线程 | 生命周期与副作用 | 版本 | Rhino 2.0 示例 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| <a id="api-symbol-bW9kdWxlOnNlbnNvcnM"></a> `module:sensors` | `sensors` 模块入口 · 实现合同  | 入口：全局或父模块属性；无构造参数 | 返回：模块对象；参数校验、状态或底层异常原样传播 | 权限：多数传感器无需权限，具体硬件或系统版本可能要求权限；线程：回调由传感器或事件线程触发 | 生命周期：监听器保持脚本存活，unregister 后释放；副作用：注册硬件监听并持续接收采样 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof sensors);` |
| <a id="api-symbol-c2Vuc29ycy5hZGRMaXN0ZW5lcg"></a> `sensors.addListener` | `sensors.addListener(String eventName, BaseFunction listener)` · 实现合同  | 参数：String eventName, BaseFunction listener；可选项与默认值按实现合同重载 | 返回：EventEmitter；参数校验、状态或底层异常原样传播 | 权限：多数传感器无需权限，具体硬件或系统版本可能要求权限；线程：回调由传感器或事件线程触发 | 生命周期：监听器保持脚本存活，unregister 后释放；副作用：注册硬件监听并持续接收采样 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof sensors.addListener);` |
| <a id="api-symbol-c2Vuc29ycy5kZWZhdWx0TWF4TGlzdGVuZXJz"></a> `sensors.defaultMaxListeners` | `sensors.defaultMaxListeners` · 实现合同  | 属性访问；无调用参数 | 返回：属性值；参数校验、状态或底层异常原样传播 | 权限：多数传感器无需权限，具体硬件或系统版本可能要求权限；线程：回调由传感器或事件线程触发 | 生命周期：监听器保持脚本存活，unregister 后释放；副作用：注册硬件监听并持续接收采样 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(sensors.defaultMaxListeners);` |
| <a id="api-symbol-c2Vuc29ycy5kZWxheQ"></a> `sensors.delay` | `sensors.delay` · 实现合同  | 属性访问；无调用参数 | 返回：属性值；参数校验、状态或底层异常原样传播 | 权限：多数传感器无需权限，具体硬件或系统版本可能要求权限；线程：回调由传感器或事件线程触发 | 生命周期：监听器保持脚本存活，unregister 后释放；副作用：注册硬件监听并持续接收采样 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(sensors.delay);` |
| <a id="api-symbol-c2Vuc29ycy5lbWl0"></a> `sensors.emit` | `sensors.emit(String eventName, Object... args)` · 实现合同  | 参数：String eventName, Object... args；可选项与默认值按实现合同重载 | 返回：boolean；参数校验、状态或底层异常原样传播 | 权限：多数传感器无需权限，具体硬件或系统版本可能要求权限；线程：回调由传感器或事件线程触发 | 生命周期：监听器保持脚本存活，unregister 后释放；副作用：注册硬件监听并持续接收采样 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof sensors.emit);` |
| <a id="api-symbol-c2Vuc29ycy5lbWl0U3RpY2t5"></a> `sensors.emitSticky` | `sensors.emitSticky(String eventName, Object... args)` · 实现合同  | 参数：String eventName, Object... args；可选项与默认值按实现合同重载 | 返回：boolean；参数校验、状态或底层异常原样传播 | 权限：多数传感器无需权限，具体硬件或系统版本可能要求权限；线程：回调由传感器或事件线程触发 | 生命周期：监听器保持脚本存活，unregister 后释放；副作用：注册硬件监听并持续接收采样 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof sensors.emitSticky);` |
| <a id="api-symbol-c2Vuc29ycy5ldmVudE5hbWVz"></a> `sensors.eventNames` | `sensors.eventNames()` · 实现合同  | 无参数；不接受额外参数 | 返回：String[]；参数校验、状态或底层异常原样传播 | 权限：多数传感器无需权限，具体硬件或系统版本可能要求权限；线程：回调由传感器或事件线程触发 | 生命周期：监听器保持脚本存活，unregister 后释放；副作用：注册硬件监听并持续接收采样 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof sensors.eventNames);` |
| <a id="api-symbol-c2Vuc29ycy5nZXRNYXhMaXN0ZW5lcnM"></a> `sensors.getMaxListeners` | `sensors.getMaxListeners()` · 实现合同  | 无参数；不接受额外参数 | 返回：int；参数校验、状态或底层异常原样传播 | 权限：多数传感器无需权限，具体硬件或系统版本可能要求权限；线程：回调由传感器或事件线程触发 | 生命周期：监听器保持脚本存活，unregister 后释放；副作用：注册硬件监听并持续接收采样 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof sensors.getMaxListeners);` |
| <a id="api-symbol-c2Vuc29ycy5nZXRTZW5zb3I"></a> `sensors.getSensor` | `sensors.getSensor(String sensorName)` · 实现合同  | 参数：String sensorName；可选项与默认值按实现合同重载 | 返回：Sensor；参数校验、状态或底层异常原样传播 | 权限：多数传感器无需权限，具体硬件或系统版本可能要求权限；线程：回调由传感器或事件线程触发 | 生命周期：监听器保持脚本存活，unregister 后释放；副作用：注册硬件监听并持续接收采样 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof sensors.getSensor);` |
| <a id="api-symbol-c2Vuc29ycy5nZXRUaW1lcg"></a> `sensors.getTimer` | `sensors.getTimer()` · 实现合同  | 无参数；不接受额外参数 | 返回：Timer；参数校验、状态或底层异常原样传播 | 权限：多数传感器无需权限，具体硬件或系统版本可能要求权限；线程：回调由传感器或事件线程触发 | 生命周期：监听器保持脚本存活，unregister 后释放；副作用：注册硬件监听并持续接收采样 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof sensors.getTimer);` |
| <a id="api-symbol-c2Vuc29ycy5pZ25vcmVzVW5zdXBwb3J0ZWRTZW5zb3I"></a> `sensors.ignoresUnsupportedSensor` | `sensors.ignoresUnsupportedSensor` · 实现合同  | 属性访问；无调用参数 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：多数传感器无需权限，具体硬件或系统版本可能要求权限；线程：回调由传感器或事件线程触发 | 生命周期：监听器保持脚本存活，unregister 后释放；副作用：注册硬件监听并持续接收采样 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(sensors.ignoresUnsupportedSensor);` |
| <a id="api-symbol-c2Vuc29ycy5saXN0ZW5lckNvdW50"></a> `sensors.listenerCount` | `sensors.listenerCount(String eventName)` · 实现合同  | 参数：String eventName；可选项与默认值按实现合同重载 | 返回：int；参数校验、状态或底层异常原样传播 | 权限：多数传感器无需权限，具体硬件或系统版本可能要求权限；线程：回调由传感器或事件线程触发 | 生命周期：监听器保持脚本存活，unregister 后释放；副作用：注册硬件监听并持续接收采样 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof sensors.listenerCount);` |
| <a id="api-symbol-c2Vuc29ycy5saXN0ZW5lcnM"></a> `sensors.listeners` | `sensors.listeners(String eventName)` · 实现合同  | 参数：String eventName；可选项与默认值按实现合同重载 | 返回：Object[]；参数校验、状态或底层异常原样传播 | 权限：多数传感器无需权限，具体硬件或系统版本可能要求权限；线程：回调由传感器或事件线程触发 | 生命周期：监听器保持脚本存活，unregister 后释放；副作用：注册硬件监听并持续接收采样 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof sensors.listeners);` |
| <a id="api-symbol-c2Vuc29ycy5vbg"></a> `sensors.on` | `sensors.on(String eventName, BaseFunction listener)` · 实现合同  | 参数：String eventName, BaseFunction listener；可选项与默认值按实现合同重载 | 返回：EventEmitter；参数校验、状态或底层异常原样传播 | 权限：多数传感器无需权限，具体硬件或系统版本可能要求权限；线程：回调由传感器或事件线程触发 | 生命周期：监听器保持脚本存活，unregister 后释放；副作用：注册硬件监听并持续接收采样 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof sensors.on);` |
| <a id="api-symbol-c2Vuc29ycy5vbmNl"></a> `sensors.once` | `sensors.once(String eventName, BaseFunction listener)` · 实现合同  | 参数：String eventName, BaseFunction listener；可选项与默认值按实现合同重载 | 返回：EventEmitter；参数校验、状态或底层异常原样传播 | 权限：多数传感器无需权限，具体硬件或系统版本可能要求权限；线程：回调由传感器或事件线程触发 | 生命周期：监听器保持脚本存活，unregister 后释放；副作用：注册硬件监听并持续接收采样 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof sensors.once);` |
| <a id="api-symbol-c2Vuc29ycy5wcmVwZW5kTGlzdGVuZXI"></a> `sensors.prependListener` | `sensors.prependListener(String eventName, BaseFunction listener)` · 实现合同  | 参数：String eventName, BaseFunction listener；可选项与默认值按实现合同重载 | 返回：EventEmitter；参数校验、状态或底层异常原样传播 | 权限：多数传感器无需权限，具体硬件或系统版本可能要求权限；线程：回调由传感器或事件线程触发 | 生命周期：监听器保持脚本存活，unregister 后释放；副作用：注册硬件监听并持续接收采样 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof sensors.prependListener);` |
| <a id="api-symbol-c2Vuc29ycy5wcmVwZW5kT25jZUxpc3RlbmVy"></a> `sensors.prependOnceListener` | `sensors.prependOnceListener(String eventName, BaseFunction listener)` · 实现合同  | 参数：String eventName, BaseFunction listener；可选项与默认值按实现合同重载 | 返回：EventEmitter；参数校验、状态或底层异常原样传播 | 权限：多数传感器无需权限，具体硬件或系统版本可能要求权限；线程：回调由传感器或事件线程触发 | 生命周期：监听器保持脚本存活，unregister 后释放；副作用：注册硬件监听并持续接收采样 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof sensors.prependOnceListener);` |
| <a id="api-symbol-c2Vuc29ycy5yZWdpc3Rlcg"></a> `sensors.register` | `sensors.register(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：多数传感器无需权限，具体硬件或系统版本可能要求权限；线程：回调由传感器或事件线程触发 | 生命周期：监听器保持脚本存活，unregister 后释放；副作用：注册硬件监听并持续接收采样 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof sensors.register);` |
| <a id="api-symbol-c2Vuc29ycy5yZW1vdmVBbGxMaXN0ZW5lcnM"></a> `sensors.removeAllListeners` | `sensors.removeAllListeners()` · 实现合同  | 无参数；不接受额外参数 | 返回：EventEmitter；参数校验、状态或底层异常原样传播 | 权限：多数传感器无需权限，具体硬件或系统版本可能要求权限；线程：回调由传感器或事件线程触发 | 生命周期：监听器保持脚本存活，unregister 后释放；副作用：注册硬件监听并持续接收采样 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof sensors.removeAllListeners);` |
| <a id="api-symbol-c2Vuc29ycy5yZW1vdmVMaXN0ZW5lcg"></a> `sensors.removeListener` | `sensors.removeListener(String eventName, BaseFunction listener)` · 实现合同  | 参数：String eventName, BaseFunction listener；可选项与默认值按实现合同重载 | 返回：EventEmitter；参数校验、状态或底层异常原样传播 | 权限：多数传感器无需权限，具体硬件或系统版本可能要求权限；线程：回调由传感器或事件线程触发 | 生命周期：监听器保持脚本存活，unregister 后释放；副作用：注册硬件监听并持续接收采样 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof sensors.removeListener);` |
| <a id="api-symbol-c2Vuc29ycy5zZXRNYXhMaXN0ZW5lcnM"></a> `sensors.setMaxListeners` | `sensors.setMaxListeners(int maxListeners)` · 实现合同  | 参数：int maxListeners；可选项与默认值按实现合同重载 | 返回：EventEmitter；参数校验、状态或底层异常原样传播 | 权限：多数传感器无需权限，具体硬件或系统版本可能要求权限；线程：回调由传感器或事件线程触发 | 生命周期：监听器保持脚本存活，unregister 后释放；副作用：注册硬件监听并持续接收采样 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof sensors.setMaxListeners);` |
| <a id="api-symbol-c2Vuc29ycy5zaG91bGRRdWl0"></a> `sensors.shouldQuit` | `sensors.shouldQuit()` · 实现合同  | 无参数；不接受额外参数 | 返回：boolean；参数校验、状态或底层异常原样传播 | 权限：多数传感器无需权限，具体硬件或系统版本可能要求权限；线程：回调由传感器或事件线程触发 | 生命周期：监听器保持脚本存活，unregister 后释放；副作用：注册硬件监听并持续接收采样 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof sensors.shouldQuit);` |
| <a id="api-symbol-c2Vuc29ycy51bnJlZ2lzdGVy"></a> `sensors.unregister` | `sensors.unregister(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：多数传感器无需权限，具体硬件或系统版本可能要求权限；线程：回调由传感器或事件线程触发 | 生命周期：监听器保持脚本存活，unregister 后释放；副作用：注册硬件监听并持续接收采样 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof sensors.unregister);` |
| <a id="api-symbol-c2Vuc29ycy51bnJlZ2lzdGVyQWxs"></a> `sensors.unregisterAll` | `sensors.unregisterAll(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：多数传感器无需权限，具体硬件或系统版本可能要求权限；线程：回调由传感器或事件线程触发 | 生命周期：监听器保持脚本存活，unregister 后释放；副作用：注册硬件监听并持续接收采样 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof sensors.unregisterAll);` |

### Rhino 2.0 表格读取示例

```js
console.log('Rhino 2.0 contract table: sensors');
```

<!-- api-contracts:end -->
