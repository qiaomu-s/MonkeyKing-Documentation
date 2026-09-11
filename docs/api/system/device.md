# 设备 (Device)

device模块提供了与设备有关的信息与操作, 例如获取设备宽高, 内存使用率, IMEI, 调整设备亮度、音量等.

此模块的部分函数, 例如调整音量, 需要"修改系统设置"的权限. 如果没有该权限, 会抛出`SecurityException`并跳转到权限设置界面.

## device.width

* {number}

设备屏幕分辨率宽度. 例如1080.

## device.height

* {number}

设备屏幕分辨率高度. 例如1920.

## device.buildId

* {string}

Either a changelist number, or a label like "M4-rc20".

修订版本号, 或者诸如"M4-rc20"的标识.

## device.board

* {string}

The name of the underlying board, like "goldfish".

设备底层主板的名称，例如 `goldfish`。该值直接来自 Android `Build.BOARD`，具体格式和内容由设备厂商决定。

## device.brand

* {string}

The consumer-visible brand with which the product/hardware will be associated, if any.

与产品或硬件相关的厂商品牌, 如"Xiaomi", "Huawei"等.

## device.device

* {string}

The name of the industrial design.

设备在工业设计中的名称.

## device.model

* {string}

The end-user-visible name for the end product.

设备型号.

## device.product

* {string}

The name of the overall product.

整个产品的名称.

## device.bootloader

* {string}

The system bootloader version number.

设备Bootloader的版本.

## device.hardware

* {string}

The name of the hardware (from the kernel command line or /proc).

设备的硬件名称(来自内核命令行或者/proc).

## device.fingerprint

* {string}

A string that uniquely identifies this build. Do not attempt to parse this value.

构建(build)的唯一标识码.

## device.imei

* {string|null}

设备的 IMEI。该字段在模块初始化时读取；Android 系统限制、缺少电话状态权限或设备不提供
IMEI 时为 `null`。需要实时读取或处理权限失败时，请使用 [device.getIMEI()](#device-getimei)。

## device.serial

* {string|null}

A hardware serial number, if available. Alphanumeric only, case-insensitive. Android 版本、权限或
厂商策略不允许读取时为 `null`。

硬件序列号.

## device.sdkInt

* {number}

The user-visible SDK version of the framework; its possible values are defined in Build.VERSION_CODES.

安卓系统API版本. 例如安卓4.4的sdkInt为19.

## device.incremental

* {string}

The internal value used by the underlying source control to represent this build. E.g., a perforce changelist number or a git hash.

## device.release

* {string}

The user-visible version string. E.g., "1.0" or "3.4b5".

Android系统版本号. 例如"5.0", "7.1.1".

## device.baseOS

* {string}

The base OS build the product is based on.

## device.securityPatch

* {string}

The user-visible security patch level.

安全补丁程序级别.

## device.codename

* {string}

The current development codename, or the string "REL" if this is a release build.

开发代号, 例如发行版是"REL".

## device.getIMEI()

* {string|null}

返回设备的 IMEI。Android 系统限制、缺少电话状态权限或设备不提供 IMEI 时返回 `null`；
不要假设所有设备都能返回非空字符串。

```js
const imei = device.getIMEI();
console.log(imei == null ? 'IMEI unavailable' : imei);
```

## device.getSerial()

* {string|null}

返回设备的硬件序列号。Android 版本、系统权限或厂商策略不允许读取时返回 `null`；
不要把空值当作稳定的设备标识。

```js
const serial = device.getSerial();
console.log(serial == null ? 'serial unavailable' : serial);
```

## device.getAndroidId()

* {string|null}

返回设备的 Android ID。通常是以十六进制字符串表示的 64 位标识；Android 提供程序未返回值时为
`null`，因此不能假设每台设备都一定有非空字符串。

在同一设备配置下它通常保持稳定，但可能因恢复出厂设置、用户配置或系统版本策略而变化；不要把它当作
跨设备或永久不变的唯一标识。

```js
const androidId = device.getAndroidId();
console.log(androidId == null ? 'Android ID unavailable' : androidId);
```

## device.getMacAddress()

* {string|null}

返回设备的 MAC 地址。实现会先读取 Wi‑Fi 信息；如果得到空值或系统返回伪 MAC，还会回退到 `wlan0` 网络接口和 `/sys/class/net/wlan0/address`。权限、接口或系统策略不允许读取时返回 `null`，读取过程中的底层异常可能向脚本传播；不要用此方法判断当前是否已连接 WLAN。

## device.getIpAddress(useIPv4?)

* `useIPv4` {boolean} 可选。省略、传入 `null` 或 `undefined` 时按 `true` 处理；其他值按 Rhino 的布尔转换规则处理。
* {string}

返回第一个非回环网络接口地址。默认返回 IPv4；传入 `false` 时返回 IPv6 地址（去除 zone 后缀并转为大写）。找不到符合条件的地址或读取网络接口失败时返回 `"0.0.0.0"`。

```js
const ipv4 = device.getIpAddress();
const ipv6 = device.getIpAddress(false);
console.log(ipv4, ipv6);
```

## device.getIpv6Address()

* {string}

返回 IPv6 地址，等价于 `device.getIpAddress(false)`；没有可用的非回环 IPv6 地址时返回 `"0.0.0.0"`。

## device.getGatewayAddress()

* {string}

返回当前 Wi‑Fi DHCP 网关地址。无法读取网关或地址无效时返回 `"0.0.0.0"`。

## device.getBrightness()

* {number}

返回当前的(手动)亮度. 范围为0~255.

## device.getBrightnessMode()

* {number}

返回当前亮度模式, 0为手动亮度, 1为自动亮度.

## device.setBrightness(b)

* `b` {number} 亮度, 范围0~255

设置当前手动亮度. 如果当前是自动亮度模式, 该函数不会影响屏幕的亮度.

此函数需要"修改系统设置"的权限. 如果没有该权限, 会抛出SecurityException并跳转到权限设置界面.

## device.setBrightnessMode(mode)

* `mode` {number} 亮度模式, 0为手动亮度, 1为自动亮度

设置当前亮度模式.

此函数需要"修改系统设置"的权限. 如果没有该权限, 会抛出SecurityException并跳转到权限设置界面.

## device.getMusicVolume()

* {number} 整数值

返回当前媒体音量.

## device.getNotificationVolume()

* {number} 整数值

返回当前通知音量.

## device.getAlarmVolume()

* {number} 整数值

返回当前闹钟音量.

## device.getMusicMaxVolume()

* {number} 整数值

返回媒体音量的最大值.

## device.getNotificationMaxVolume()

* {number} 整数值

返回通知音量的最大值.

## device.getAlarmMaxVolume()

* {number} 整数值

返回闹钟音量的最大值.

## device.setMusicVolume(volume)

* `volume` {number} 音量

设置当前媒体音量.

此函数需要"修改系统设置"的权限. 如果没有该权限, 会抛出SecurityException并跳转到权限设置界面.

## device.setNotificationVolume(volume)

* `volume` {number} 音量

设置当前通知音量.

此函数需要"修改系统设置"的权限. 如果没有该权限, 会抛出SecurityException并跳转到权限设置界面.

## device.setAlarmVolume(volume)

* `volume` {number} 音量

设置当前闹钟音量.

此函数需要"修改系统设置"的权限. 如果没有该权限, 会抛出SecurityException并跳转到权限设置界面.

## device.getBattery()

* {number} 0.0~100.0的浮点数

返回当前电量百分比.

## device.isCharging()

* {boolean}

返回设备是否正在充电.

## device.getTotalMem()

* {number}

返回设备内存总量, 单位字节(B). 1MB = 1024 * 1024B.

## device.getAvailMem()

* {number}

返回设备当前可用的内存, 单位字节(B).

## device.rotation

* {number}

返回默认显示器当前的旋转常量：`0`（`Surface.ROTATION_0`）、`1`（`ROTATION_90`）、`2`
（`ROTATION_180`）或 `3`（`ROTATION_270`）。每次读取都会查询当前显示状态，不接受参数。

## device.orientation

* {number}

返回当前资源方向：`1`（`Configuration.ORIENTATION_PORTRAIT`）或 `2`
（`Configuration.ORIENTATION_LANDSCAPE`）。在无法取得 Activity 资源时，增强属性回退为竖屏值 `1`。
该属性是动态 getter，不接受参数。

## device.getOrientation()

* {number}

根据当前显示旋转返回 Android `Configuration` 方向常量：竖屏为 `1`，横屏为 `2`；无法判断时返回
`0`（`ORIENTATION_UNDEFINED`）。此方法不接受参数。

```js
console.log(device.orientation, device.getOrientation());
```

## device.getRotation()

* {number}

返回默认显示器的 `Surface` 旋转常量 `0`、`1`、`2` 或 `3`。此方法不接受参数。

```js
console.log(device.rotation, device.getRotation());
```

## device.isScreenOn()

* 返回 {boolean}

返回设备屏幕是否是亮着的. 如果屏幕亮着, 返回`true`; 否则返回`false`.

需要注意的是, 类似于vivo xplay系列的息屏时钟不属于"屏幕亮着"的情况, 虽然屏幕确实亮着但只能显示时钟而且不可交互, 此时`isScreenOn()`也会返回`false`.

## device.wakeUp()

唤醒设备. 包括唤醒设备CPU、屏幕等. 可以用来点亮屏幕.

## device.wakeUpIfNeeded()

如果屏幕没有点亮, 则唤醒设备.

## device.keepScreenOn([timeout])

* `timeout` {number} 屏幕保持常亮的时间, 单位毫秒. 如果不加此参数, 则一直保持屏幕常亮.

保持屏幕常亮.

此函数无法阻止用户使用锁屏键等正常关闭屏幕, 只能使得设备在无人操作的情况下保持屏幕常亮；同时, 如果此函数调用时屏幕没有点亮, 则会唤醒屏幕.

在某些设备上, 如果不加参数timeout, 只能在Monkey King的界面保持屏幕常亮, 在其他界面会自动失效, 这是因为设备的省电策略造成的. 因此, 建议使用比较长的时长来代替"一直保持屏幕常亮"的功能, 例如`device.keepScreenOn(3600 * 1000)`.

可以使用`device.cancelKeepingAwake()`来取消屏幕常亮.

```
//一直保持屏幕常亮
device.keepScreenOn()
```

## device.keepScreenDim([timeout])

* `timeout` {number} 屏幕保持常亮的时间, 单位毫秒. 如果不加此参数, 则一直保持屏幕常亮.

保持屏幕常亮, 但允许屏幕变暗来节省电量. 此函数可以用于定时脚本唤醒屏幕操作, 不需要用户观看屏幕, 可以让屏幕变暗来节省电量.

此函数无法阻止用户使用锁屏键等正常关闭屏幕, 只能使得设备在无人操作的情况下保持屏幕常亮；同时, 如果此函数调用时屏幕没有点亮, 则会唤醒屏幕.

可以使用`device.cancelKeepingAwake()`来取消屏幕常亮.

## device.cancelKeepingAwake()

取消设备保持唤醒状态. 用于取消`device.keepScreenOn()`, `device.keepScreenDim()`等函数设置的屏幕常亮.

## device.vibrate(millis)

`device.vibrate` 是一个统一的 Rhino 入口，支持以下重载；调用参数数量必须为 1 或 2，返回
`undefined`：

```ts
device.vibrate(millis: number): undefined
device.vibrate(off: number, millis: number): undefined
device.vibrate(timings: number[]): undefined
device.vibrate(text: string, delay?: number): undefined
device.vibrate(timingsWithoutOff: number[], off: number): undefined
```

* `millis` {number}：单次振动时长，单位毫秒。
* `off` {number}：波形开始前的静默时长，单位毫秒；与 `millis` 一起形成 `[off, millis]` 波形。
* `timings` {number[]}：完整振动/静默时序数组，元素按数字转换后传给 Android 振动器。
* `timingsWithoutOff` {number[]}、`off` {number}：在数组开头插入 `off`，再按波形执行。
* `text` {string}：按摩尔斯电码振动；`delay` 可选，表示开始播放前的静默时长，默认 `0` 毫秒。

数组元素或数值参数无法转换为有效数字时抛出参数异常；非法参数数量或类型也会抛出异常。振动是同步
提交到设备振动器的副作用，实际效果取决于设备是否具备振动器和系统权限。

```js
device.vibrate(2000);                 // 单次振动 2 秒
device.vibrate(200, 800);             // 静默 200 ms，再振动 800 ms
device.vibrate([100, 100, 300, 100]); // 完整波形
device.vibrate([100, 100, 300], 50);  // 先静默 50 ms，再执行数组波形
device.vibrate('SOS', 500);            // 摩尔斯电码，先延迟 500 ms
```

## device.cancelVibration()

如果设备处于振动状态, 则取消振动.

<!-- api-contracts:start -->

## API 合同表

下表覆盖本页在产品版本 `6.7.0` 中的每个 canonical 公共成员。每行同时给出稳定锚点、实现合同、参数与返回合同、权限与线程、生命周期与副作用、版本，以及可独立执行的 Rhino 2.0 成员存在性或值读取示例。对象实例名（如 `db`、`cursor`、`storage`）沿用本页正文中的创建方式。

| API ID / 稳定锚点 | 签名或入口 | 参数、可选项与默认值 | 返回值与异常 | 权限与线程 | 生命周期与副作用 | 版本 | Rhino 2.0 示例 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| <a id="api-symbol-ZGV2aWNlLmJhc2VPUw"></a> `device.baseOS` | `device.baseOS` · 实现合同  | 属性访问；无调用参数 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(device.baseOS);` |
| <a id="api-symbol-ZGV2aWNlLmJvYXJk"></a> `device.board` | `device.board` · 实现合同  | 属性访问；无调用参数 | 返回：String；直接读取 Android `Build.BOARD`，内容由设备厂商决定 | 权限：不需要额外权限；线程：同步读取 | 生命周期：模块随脚本运行时存在；副作用：只读设备构建信息 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(device.board);` |
| <a id="api-symbol-ZGV2aWNlLmJvb3Rsb2FkZXI"></a> `device.bootloader` | `device.bootloader` · 实现合同  | 属性访问；无调用参数 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(device.bootloader);` |
| <a id="api-symbol-ZGV2aWNlLmJyYW5k"></a> `device.brand` | `device.brand` · 实现合同  | 属性访问；无调用参数 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(device.brand);` |
| <a id="api-symbol-ZGV2aWNlLmJyYW5kcw"></a> `device.brands` | `device.brands` · 实现合同  | 属性访问；无调用参数 | 返回：属性值；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(device.brands);` |
| <a id="api-symbol-ZGV2aWNlLmJ1aWxkRGlzcGxheQ"></a> `device.buildDisplay` | `device.buildDisplay` · 实现合同  | 属性访问；无调用参数 | 返回：属性值；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(device.buildDisplay);` |
| <a id="api-symbol-ZGV2aWNlLmJ1aWxkSWQ"></a> `device.buildId` | `device.buildId` · 实现合同  | 属性访问；无调用参数 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(device.buildId);` |
| <a id="api-symbol-ZGV2aWNlLmNhbmNlbEtlZXBpbmdBd2FrZQ"></a> `device.cancelKeepingAwake` | `device.cancelKeepingAwake(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.cancelKeepingAwake);` |
| <a id="api-symbol-ZGV2aWNlLmNhbmNlbFZpYnJhdGlvbg"></a> `device.cancelVibration` | `device.cancelVibration(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.cancelVibration);` |
| <a id="api-symbol-ZGV2aWNlLmNvZGVuYW1l"></a> `device.codename` | `device.codename` · 实现合同  | 属性访问；无调用参数 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(device.codename);` |
| <a id="api-symbol-ZGV2aWNlLmRlbnNpdHk"></a> `device.density` | `device.density` · 实现合同  | 属性访问；无调用参数 | 返回：属性值；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(device.density);` |
| <a id="api-symbol-ZGV2aWNlLmRldmljZQ"></a> `device.device` | `device.device` · 实现合同  | 属性访问；无调用参数 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(device.device);` |
| <a id="api-symbol-ZGV2aWNlLmRpZ2VzdA"></a> `device.digest` | `device.digest()` · 实现合同  | 参数：无参数；可选项与默认值见本页说明或页面约束 | 返回：String；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.digest);` |
| <a id="api-symbol-ZGV2aWNlLmRvVmlicmF0ZQ"></a> `device.doVibrate` | `device.doVibrate(long millis)` · 实现合同  | 参数：long millis；可选项与默认值按实现合同重载 | 返回：void；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.doVibrate);` |
| <a id="api-symbol-ZGV2aWNlLmVuc3VyZVJlYWRQaG9uZVN0YXRlUGVybWlzc2lvbg"></a> `device.ensureReadPhoneStatePermission` | `device.ensureReadPhoneStatePermission()` · 实现合同  | 无参数；不接受额外参数 | 返回：void；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.ensureReadPhoneStatePermission);` |
| <a id="api-symbol-ZGV2aWNlLmZpbmdlcnByaW50"></a> `device.fingerprint` | `device.fingerprint` · 实现合同  | 属性访问；无调用参数 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(device.fingerprint);` |
| <a id="api-symbol-ZGV2aWNlLmdldEFsYXJtTWF4Vm9sdW1l"></a> `device.getAlarmMaxVolume` | `device.getAlarmMaxVolume(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.getAlarmMaxVolume);` |
| <a id="api-symbol-ZGV2aWNlLmdldEFsYXJtVm9sdW1l"></a> `device.getAlarmVolume` | `device.getAlarmVolume(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.getAlarmVolume);` |
| <a id="api-symbol-ZGV2aWNlLmdldEFuZHJvaWRJZA"></a> `device.getAndroidId` | `device.getAndroidId()` · 实现合同  | 无参数；不接受额外参数 | 返回：String 或 `null`；`Settings.Secure` 未提供 Android ID 时返回 `null` | 权限：读取 Android ID 不需要 READ_PHONE_STATE；线程：同步读取 | 生命周期：模块随脚本运行时存在；副作用：只读设备设置，不修改系统状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(device.getAndroidId());` |
| <a id="api-symbol-ZGV2aWNlLmdldEF2YWlsTWVt"></a> `device.getAvailMem` | `device.getAvailMem(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.getAvailMem);` |
| <a id="api-symbol-ZGV2aWNlLmdldEJhdHRlcnk"></a> `device.getBattery` | `device.getBattery(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.getBattery);` |
| <a id="api-symbol-ZGV2aWNlLmdldEJyaWdodG5lc3M"></a> `device.getBrightness` | `device.getBrightness(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.getBrightness);` |
| <a id="api-symbol-ZGV2aWNlLmdldEJyaWdodG5lc3NNb2Rl"></a> `device.getBrightnessMode` | `device.getBrightnessMode(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.getBrightnessMode);` |
| <a id="api-symbol-ZGV2aWNlLmdldEdhdGV3YXlBZGRyZXNz"></a> `device.getGatewayAddress` | `device.getGatewayAddress()` · 实现合同  | 参数：无参数；可选项与默认值见本页说明或页面约束 | 返回：String；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.getGatewayAddress);` |
| <a id="api-symbol-ZGV2aWNlLmdldElNRUk"></a> `device.getIMEI` | `device.getIMEI()` · 实现合同  | 无参数；不接受额外参数 | 返回：String 或 `null`；缺少权限、系统限制或设备不提供 IMEI 时返回 `null`；其他底层异常原样传播 | 权限：可能请求 READ_PHONE_STATE；线程：同步执行 | 生命周期：模块随脚本运行时存在；副作用：只读设备标识，不修改系统状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(device.getIMEI());` |
| <a id="api-symbol-ZGV2aWNlLmdldElwQWRkcmVzcw"></a> `device.getIpAddress` | `device.getIpAddress(useIPv4?)` · 实现合同  | 参数：0 至 1 个；`useIPv4` 可选，省略或传 `null`/`undefined` 时默认 `true`，其他值按 Rhino 布尔规则转换 | 返回：String；`true` 返回首个非回环 IPv4，`false` 返回去掉 zone 后缀并转大写的 IPv6；无匹配时返回 `0.0.0.0` | 权限：不需要额外权限；线程：同步枚举网络接口 | 生命周期：模块随脚本运行时存在；副作用：只读网络状态，不修改设备 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(device.getIpAddress(false));` |
| <a id="api-symbol-ZGV2aWNlLmdldElwdjZBZGRyZXNz"></a> `device.getIpv6Address` | `device.getIpv6Address()` · 实现合同  | 参数：无参数；可选项与默认值见本页说明或页面约束 | 返回：String；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.getIpv6Address);` |
| <a id="api-symbol-ZGV2aWNlLmdldE1hY0FkZHJlc3M"></a> `device.getMacAddress` | `device.getMacAddress()` · 实现合同  | 无参数；不接受额外参数 | 返回：String 或 `null`；无法读取 Wi‑Fi、`wlan0` 或 sysfs 地址时返回 `null`；读取过程中的底层异常可能传播 | 权限：可能受 Wi‑Fi/网络状态和系统策略限制；线程：同步执行 | 生命周期：模块随脚本运行时存在；副作用：只读网络标识 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(device.getMacAddress());` |
| <a id="api-symbol-ZGV2aWNlLmdldE11c2ljTWF4Vm9sdW1l"></a> `device.getMusicMaxVolume` | `device.getMusicMaxVolume(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.getMusicMaxVolume);` |
| <a id="api-symbol-ZGV2aWNlLmdldE11c2ljVm9sdW1l"></a> `device.getMusicVolume` | `device.getMusicVolume(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.getMusicVolume);` |
| <a id="api-symbol-ZGV2aWNlLmdldE5vdGlmaWNhdGlvbk1heFZvbHVtZQ"></a> `device.getNotificationMaxVolume` | `device.getNotificationMaxVolume(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.getNotificationMaxVolume);` |
| <a id="api-symbol-ZGV2aWNlLmdldE5vdGlmaWNhdGlvblZvbHVtZQ"></a> `device.getNotificationVolume` | `device.getNotificationVolume(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.getNotificationVolume);` |
| <a id="api-symbol-ZGV2aWNlLmdldE9yaWVudGF0aW9u"></a> `device.getOrientation` | `device.getOrientation()` · 实现合同  | 无参数；不接受额外参数 | 返回：int；竖屏 `1`、横屏 `2`，无法判断时为 `0`（`ORIENTATION_UNDEFINED`） | 权限：不需要额外权限；线程：同步读取显示旋转 | 生命周期：模块随脚本运行时存在；副作用：只读当前显示状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(device.getOrientation());` |
| <a id="api-symbol-ZGV2aWNlLmdldFJvdGF0aW9u"></a> `device.getRotation` | `device.getRotation()` · 实现合同  | 无参数；不接受额外参数 | 返回：int；`Surface.ROTATION_0/90/180/270` 对应 `0/1/2/3` | 权限：不需要额外权限；线程：同步读取默认显示器 | 生命周期：模块随脚本运行时存在；副作用：只读当前显示状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(device.getRotation());` |
| <a id="api-symbol-ZGV2aWNlLmdldFNlcmlhbA"></a> `device.getSerial` | `device.getSerial()` · 实现合同  | 无参数；不接受额外参数 | 返回：String 或 `null`；Android 版本、权限或厂商策略不允许读取时返回 `null`；其他底层异常原样传播 | 权限：可能受设备标识访问策略限制；线程：同步执行 | 生命周期：模块随脚本运行时存在；副作用：只读设备标识，不修改系统状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(device.getSerial());` |
| <a id="api-symbol-ZGV2aWNlLmdldFNoYXJlZERldmljZUlk"></a> `device.getSharedDeviceId` | `device.getSharedDeviceId()` · 实现合同  | 参数：无参数；可选项与默认值见本页说明或页面约束 | 返回：String?；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.getSharedDeviceId);` |
| <a id="api-symbol-ZGV2aWNlLmdldFRvdGFsTWVt"></a> `device.getTotalMem` | `device.getTotalMem(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.getTotalMem);` |
| <a id="api-symbol-ZGV2aWNlLmhhcmR3YXJl"></a> `device.hardware` | `device.hardware` · 实现合同  | 属性访问；无调用参数 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(device.hardware);` |
| <a id="api-symbol-ZGV2aWNlLmhhc1JlYWRQaG9uZVN0YXRlUGVybWlzc2lvbg"></a> `device.hasReadPhoneStatePermission` | `device.hasReadPhoneStatePermission()` · 实现合同  | 无参数；不接受额外参数 | 返回：boolean；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.hasReadPhoneStatePermission);` |
| <a id="api-symbol-ZGV2aWNlLmhlaWdodA"></a> `device.height` | `device.height` · 实现合同  | 属性访问；无调用参数 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(device.height);` |
| <a id="api-symbol-ZGV2aWNlLmltZWk"></a> `device.imei` | `device.imei` · 实现合同  | 属性访问；无调用参数 | 返回：String 或 `null`；初始化读取失败或系统限制时为 `null` | 权限：可能请求 READ_PHONE_STATE；线程：模块初始化时同步读取 | 生命周期：模块构造时缓存；副作用：只读设备标识 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(device.imei);` |
| <a id="api-symbol-ZGV2aWNlLmluY3JlbWVudGFs"></a> `device.incremental` | `device.incremental` · 实现合同  | 属性访问；无调用参数 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(device.incremental);` |
| <a id="api-symbol-ZGV2aWNlLmlzQWN0aXZlTmV0d29ya01ldGVyZWQ"></a> `device.isActiveNetworkMetered` | `device.isActiveNetworkMetered()` · 实现合同  | 参数：无参数；可选项与默认值见本页说明或页面约束 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.isActiveNetworkMetered);` |
| <a id="api-symbol-ZGV2aWNlLmlzQ2hhcmdpbmc"></a> `device.isCharging` | `device.isCharging(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.isCharging);` |
| <a id="api-symbol-ZGV2aWNlLmlzQ29ubmVjdGVkT3JDb25uZWN0aW5n"></a> `device.isConnectedOrConnecting` | `device.isConnectedOrConnecting()` · 实现合同  | 参数：无参数；可选项与默认值见本页说明或页面约束 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.isConnectedOrConnecting);` |
| <a id="api-symbol-ZGV2aWNlLmlzTWFudWZhY3R1cmVy"></a> `device.isManufacturer` | `device.isManufacturer(String manufacturer)` · 实现合同  | 参数：String manufacturer；可选项与默认值按实现合同重载 | 返回：boolean；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.isManufacturer);` |
| <a id="api-symbol-ZGV2aWNlLmlzUG9pbnRlckxvY2F0aW9uRGlzYWJsZWQ"></a> `device.isPointerLocationDisabled` | `device.isPointerLocationDisabled()` · 实现合同  | 参数：无参数；可选项与默认值见本页说明或页面约束 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.isPointerLocationDisabled);` |
| <a id="api-symbol-ZGV2aWNlLmlzUG9pbnRlckxvY2F0aW9uRW5hYmxlZA"></a> `device.isPointerLocationEnabled` | `device.isPointerLocationEnabled()` · 实现合同  | 参数：无参数；可选项与默认值见本页说明或页面约束 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.isPointerLocationEnabled);` |
| <a id="api-symbol-ZGV2aWNlLmlzUG93ZXJTb3VyY2VBQw"></a> `device.isPowerSourceAC` | `device.isPowerSourceAC()` · 实现合同  | 无参数；不接受额外参数 | 返回：boolean；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.isPowerSourceAC);` |
| <a id="api-symbol-ZGV2aWNlLmlzUG93ZXJTb3VyY2VEb2Nr"></a> `device.isPowerSourceDock` | `device.isPowerSourceDock()` · 实现合同  | 无参数；不接受额外参数 | 返回：boolean；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.isPowerSourceDock);` |
| <a id="api-symbol-ZGV2aWNlLmlzUG93ZXJTb3VyY2VVU0I"></a> `device.isPowerSourceUSB` | `device.isPowerSourceUSB()` · 实现合同  | 无参数；不接受额外参数 | 返回：boolean；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.isPowerSourceUSB);` |
| <a id="api-symbol-ZGV2aWNlLmlzUG93ZXJTb3VyY2VXaXJlbGVzcw"></a> `device.isPowerSourceWireless` | `device.isPowerSourceWireless()` · 实现合同  | 无参数；不接受额外参数 | 返回：boolean；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.isPowerSourceWireless);` |
| <a id="api-symbol-ZGV2aWNlLmlzU2NyZWVuTGFuZHNjYXBl"></a> `device.isScreenLandscape` | `device.isScreenLandscape()` · 实现合同  | 参数：无参数；可选项与默认值见本页说明或页面约束 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.isScreenLandscape);` |
| <a id="api-symbol-ZGV2aWNlLmlzU2NyZWVuT2Zm"></a> `device.isScreenOff` | `device.isScreenOff()` · 实现合同  | 参数：无参数；可选项与默认值见本页说明或页面约束 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.isScreenOff);` |
| <a id="api-symbol-ZGV2aWNlLmlzU2NyZWVuT24"></a> `device.isScreenOn` | `device.isScreenOn(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.isScreenOn);` |
| <a id="api-symbol-ZGV2aWNlLmlzU2NyZWVuUG9ydHJhaXQ"></a> `device.isScreenPortrait` | `device.isScreenPortrait()` · 实现合同  | 参数：无参数；可选项与默认值见本页说明或页面约束 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.isScreenPortrait);` |
| <a id="api-symbol-ZGV2aWNlLmlzV2lmaUF2YWlsYWJsZQ"></a> `device.isWifiAvailable` | `device.isWifiAvailable()` · 实现合同  | 参数：无参数；可选项与默认值见本页说明或页面约束 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.isWifiAvailable);` |
| <a id="api-symbol-ZGV2aWNlLmtlZXBBd2FrZQ"></a> `device.keepAwake` | `device.keepAwake(int flags, long timeout)` · 实现合同  | 参数：int flags, long timeout；可选项与默认值按实现合同重载 | 返回：void；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.keepAwake);` |
| <a id="api-symbol-ZGV2aWNlLmtlZXBTY3JlZW5EaW0"></a> `device.keepScreenDim` | `device.keepScreenDim(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.keepScreenDim);` |
| <a id="api-symbol-ZGV2aWNlLmtlZXBTY3JlZW5Pbg"></a> `device.keepScreenOn` | `device.keepScreenOn(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.keepScreenOn);` |
| <a id="api-symbol-ZGV2aWNlLm1hbnVmYWN0dXJlcg"></a> `device.manufacturer` | `device.manufacturer` · 实现合同  | 属性访问；无调用参数 | 返回：属性值；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(device.manufacturer);` |
| <a id="api-symbol-ZGV2aWNlLm1hbnVmYWN0dXJlcnM"></a> `device.manufacturers` | `device.manufacturers` · 实现合同  | 属性访问；无调用参数 | 返回：属性值；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(device.manufacturers);` |
| <a id="api-symbol-ZGV2aWNlLm1vZGVs"></a> `device.model` | `device.model` · 实现合同  | 属性访问；无调用参数 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(device.model);` |
| <a id="api-symbol-ZGV2aWNlLm9yaWVudGF0aW9u"></a> `device.orientation` | `device.orientation` · 实现合同  | 属性访问；无调用参数；动态 getter | 返回：int；竖屏为 `1`、横屏为 `2`；无 Activity 资源时回退为 `1` | 权限：不需要额外权限；线程：同步读取当前资源配置 | 生命周期：模块随脚本运行时存在；副作用：只读当前方向 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(device.orientation);` |
| <a id="api-symbol-ZGV2aWNlLnByb2R1Y3Q"></a> `device.product` | `device.product` · 实现合同  | 属性访问；无调用参数 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(device.product);` |
| <a id="api-symbol-ZGV2aWNlLnJlbGVhc2U"></a> `device.release` | `device.release` · 实现合同  | 属性访问；无调用参数 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(device.release);` |
| <a id="api-symbol-ZGV2aWNlLnJvbXM"></a> `device.roms` | `device.roms` · 实现合同  | 属性访问；无调用参数 | 返回：属性值；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(device.roms);` |
| <a id="api-symbol-ZGV2aWNlLnJvdGF0aW9u"></a> `device.rotation` | `device.rotation` · 实现合同  | 属性访问；无调用参数；动态 getter | 返回：int；`Surface.ROTATION_0/90/180/270` 对应 `0/1/2/3` | 权限：不需要额外权限；线程：同步读取默认显示器 | 生命周期：模块随脚本运行时存在；副作用：只读当前显示状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(device.rotation);` |
| <a id="api-symbol-ZGV2aWNlLnNka0ludA"></a> `device.sdkInt` | `device.sdkInt` · 实现合同  | 属性访问；无调用参数 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(device.sdkInt);` |
| <a id="api-symbol-ZGV2aWNlLnNlY3VyaXR5UGF0Y2g"></a> `device.securityPatch` | `device.securityPatch` · 实现合同  | 属性访问；无调用参数 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(device.securityPatch);` |
| <a id="api-symbol-ZGV2aWNlLnNlcmlhbA"></a> `device.serial` | `device.serial` · 实现合同  | 属性访问；无调用参数 | 返回：String 或 `null`；初始化读取失败或系统限制时为 `null` | 权限：可能受设备标识访问策略限制；线程：模块初始化时同步读取 | 生命周期：模块构造时缓存；副作用：只读设备标识 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(device.serial);` |
| <a id="api-symbol-ZGV2aWNlLnNldEFsYXJtVm9sdW1l"></a> `device.setAlarmVolume` | `device.setAlarmVolume(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.setAlarmVolume);` |
| <a id="api-symbol-ZGV2aWNlLnNldEJyaWdodG5lc3M"></a> `device.setBrightness` | `device.setBrightness(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.setBrightness);` |
| <a id="api-symbol-ZGV2aWNlLnNldEJyaWdodG5lc3NNb2Rl"></a> `device.setBrightnessMode` | `device.setBrightnessMode(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.setBrightnessMode);` |
| <a id="api-symbol-ZGV2aWNlLnNldE11c2ljVm9sdW1l"></a> `device.setMusicVolume` | `device.setMusicVolume(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.setMusicVolume);` |
| <a id="api-symbol-ZGV2aWNlLnNldE5vdGlmaWNhdGlvblZvbHVtZQ"></a> `device.setNotificationVolume` | `device.setNotificationVolume(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.setNotificationVolume);` |
| <a id="api-symbol-ZGV2aWNlLnNldFBvaW50ZXJMb2NhdGlvbg"></a> `device.setPointerLocation` | `device.setPointerLocation(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.setPointerLocation);` |
| <a id="api-symbol-ZGV2aWNlLnNldFBvaW50ZXJMb2NhdGlvbkRpc2FibGVk"></a> `device.setPointerLocationDisabled` | `device.setPointerLocationDisabled()` · 实现合同  | 参数：无参数；可选项与默认值见本页说明或页面约束 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.setPointerLocationDisabled);` |
| <a id="api-symbol-ZGV2aWNlLnNldFBvaW50ZXJMb2NhdGlvbkVuYWJsZWQ"></a> `device.setPointerLocationEnabled` | `device.setPointerLocationEnabled()` · 实现合同  | 参数：无参数；可选项与默认值见本页说明或页面约束 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.setPointerLocationEnabled);` |
| <a id="api-symbol-ZGV2aWNlLnN1bW1hcnk"></a> `device.summary` | `device.summary()` · 实现合同  | 参数：无参数；可选项与默认值见本页说明或页面约束 | 返回：String；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.summary);` |
| <a id="api-symbol-ZGV2aWNlLnRvZ2dsZVBvaW50ZXJMb2NhdGlvbg"></a> `device.togglePointerLocation` | `device.togglePointerLocation()` · 实现合同  | 参数：无参数；可选项与默认值见本页说明或页面约束 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.togglePointerLocation);` |
| <a id="api-symbol-ZGV2aWNlLnRvU3RyaW5n"></a> `device.toString` | `device.toString()` · 实现合同  | 无参数；不接受额外参数 | 返回：String；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.toString);` |
| <a id="api-symbol-ZGV2aWNlLnZpYnJhdGU"></a> `device.vibrate` | `device.vibrate(millis)`、`device.vibrate(off, millis)`、`device.vibrate(timings)`、`device.vibrate(text, delay?)`、`device.vibrate(timingsWithoutOff, off)` · 实现合同  | 参数：1 或 2 个；数值参数按毫秒转换，数组参数为数值时序，字符串为摩尔斯电码；`delay` 省略时为 `0` | 返回：`undefined`；非法参数数量、类型或数组元素转换失败时抛出异常 | 权限：使用系统振动器，需设备振动能力及系统授权；线程：同步提交振动请求 | 生命周期：振动请求提交后由系统执行；副作用：改变设备振动状态，后续请求可能覆盖当前振动 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`device.vibrate([100, 100]); console.log('done');` |
| <a id="api-symbol-ZGV2aWNlLndha2VVcA"></a> `device.wakeUp` | `device.wakeUp(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.wakeUp);` |
| <a id="api-symbol-ZGV2aWNlLndha2VVcElmTmVlZGVk"></a> `device.wakeUpIfNeeded` | `device.wakeUpIfNeeded(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device.wakeUpIfNeeded);` |
| <a id="api-symbol-ZGV2aWNlLndpZHRo"></a> `device.width` | `device.width` · 实现合同  | 属性访问；无调用参数 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(device.width);` |
| <a id="api-symbol-bW9kdWxlOmRldmljZQ"></a> `module:device` | `device` 模块入口 · 实现合同  | 入口：全局或父模块属性；无构造参数 | 返回：模块对象；初始化或目标成员异常原样传播 | 权限：成员而异，设备标识可能请求 READ_PHONE_STATE，系统设置写入需要相应特权；线程：查询和设置同步执行 | 生命周期：模块随脚本运行时存在；副作用：多数 getter 只读，唤醒、振动和系统设置成员会修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof device);` |

### Rhino 2.0 表格读取示例

```js
console.log('Rhino 2.0 contract table: device');
```

<!-- api-contracts:end -->
