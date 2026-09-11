# Shell

Shell 是在 Android 设备上执行 Unix 命令的接口。Monkey King 通过普通
`sh` 或已授权的 `su` 进程执行命令；命令本身可能修改文件、系统设置或输入状态，
因此应只执行可信内容。一次性命令使用全局 `shell()`，需要持续交互时使用 `Shell`
对象。

# shell函数

## shell(cmd[, options][, withRoot])

* `cmd` {string|string[]} 要执行的命令。数组元素会按换行拼接后在同一 shell 进程中执行。
* `options` {string|object|boolean|number} 可选命令参数，或直接用布尔值/数字指定是否使用 root。
* `withRoot` {boolean|number} 当第二个参数是命令参数字符串/对象时，第三个参数指定是否使用 root，默认为 `false`。

`shell` 接受以下常用形式：

```js
shell('id');
shell('id', true);                 // 使用 root（等同于非零数字）
shell('pm list packages', '-f');   // 追加命令参数
shell('pm list packages', { user: 0, root: true });
shell(['echo one', 'echo two']);   // 在同一 shell 中执行多条命令
```

参数对象中的 `root` 和 `exit` 是 Monkey King 选项，不会被拼成命令行标志：`root`
切换到 `su`，`exit` 会在命令末尾追加正常退出和 `kill $$`。其他键会转换为
`--kebab-case`（单字符键转换为短选项），布尔值为 `true` 时只输出选项名，字符串值会在
包含空格或以 `-` 开头时自动加引号。字符串选项可用 `|` 分隔，例如
`shell('am broadcast', 'user=current|root')`。

函数返回一个结果对象：

* `code` {number} 进程退出码，通常 `0` 表示成功，非零表示失败。
* `result` {string} 标准输出。
* `error` {string} 标准错误或执行异常信息。

参数数量、类型或命令参数格式不合法时会抛出异常；进程启动或执行阶段的错误通常编码在
结果对象中，请优先检查 `code` 和 `error`。

```js
const result = shell('am force-stop com.tencent.mm', { root: true });
if (result.code === 0) {
  toast('执行成功');
} else {
  console.error(result.error || result.result);
}
```

# Shell

一次性 `shell()` 调用会在命令完成后关闭进程。如果需要连续发送命令或监听实时输出，
使用 `Shell` 对象可以复用同一个交互式 shell 进程。

## new Shell([root])

* `root` {boolean} 是否以 root 权限启动 shell 进程，默认为 `false`。这会影响该对象后续执行的所有命令。

`Shell` 对象使用内嵌终端模拟器保持一个长期运行的 shell 进程。使用完毕后应调用
`exit()` 或 `exitAndWaitFor()` 释放进程。

```
var sh = new Shell(true);
//强制停止微信
sh.exec("am force-stop com.tencent.mm");
sh.exit();
```

## Shell.exec(cmd)

* `cmd` {string} 要执行的命令

执行命令 `cmd`，立即将命令写入交互式 shell，不返回值。该调用不会等待命令完成；
输出可通过回调监听。

## Shell.execAndWaitFor(cmd)

* `cmd` {string} 要执行的命令
* 返回 {string} 命令输出（不含交互提示符）

执行命令并等待该命令的输出完成后再返回。长时间运行或不会结束的命令会一直阻塞，
此时应改用 `exec()` 和回调。

## Shell.exit()

立即销毁 shell 进程和输出流；正在执行的命令会被终止。

## Shell.exitAndWaitFor()

向 shell 写入 `exit` 并等待进程正常退出。root shell 会依次退出 `su` 和其内部的
`sh` 两层进程。若只需要立即终止而不等待，使用 `exit()`。

## Shell.setCallback(callback)

* `callback` {object} 回调对象；可实现以下方法

设置该 `Shell` 的回调，以监听初始化、输出和中断事件：

* `onOutput(str)`：每当 shell 有新的原始输出时调用。
* `onNewLine(line)`：每当 shell 有新的一行输出时调用，参数不包含末尾换行符。
* `onInitialized()`：交互式 shell 初始化完成时调用。
* `onInterrupted(error)`：等待初始化或退出被线程中断时调用。

未提供的方法可以省略；需要兼容所有回调事件时可继承 `Shell.SimpleCallback`。

例如:

```
var sh = new Shell();
sh.setCallback({
	onNewLine: function(line){
		//有新的一行输出时打印到控制台
		log(line);
	}
})
while(true){
	//循环输入命令
	var cmd = dialogs.rawInput("请输入要执行的命令, 输入exit退出");
	if(cmd == "exit"){
		break;
	}
	//执行命令
	sh.exec(cmd);
}
sh.exit();
```

## Shell.isInitialized()

返回 {boolean} 当前交互式 shell 是否已完成初始化。调用 `exec()` 或
`execAndWaitFor()` 时，Monkey King 会自动等待初始化完成。

# 附录: shell命令简介

以下关于shell命令的资料来自[AndroidStudio用户指南：Shell命令](https://developer.android.com/studio/command-line/adb.html#shellcommands/).

## am命令

am命令即Activity Manager命令, 用于管理应用程序活动、服务等.

**以下命令均以"am "开头, 例如`shell('am start -p com.tencent.mm');`(启动微信)**

### start [options] intent

启动 intent 指定的 Activity(应用程序活动).<br>
请参阅 [intent 参数的规范](#intent参数的规范).

选项包括：

* -D：启用调试.
* -W：等待启动完成.
* --start-profiler file：启动分析器并将结果发送到 file.
* -P file：类似于 --start-profiler, 但当应用进入空闲状态时分析停止.
* -R count：重复 Activity 启动 count 次数. 在每次重复前, 将完成顶部 Activity.
* -S：启动 Activity 前强行停止目标应用.
* --opengl-trace：启用 OpenGL 函数的跟踪.
* --user user_id | current：指定要作为哪个用户运行；如果未指定, 则作为当前用户运行.

### startservice [options] intent

启动 intent 指定的 Service(服务).<br>
请参阅 [intent 参数的规范](#intent参数的规范).<br>
选项包括：

* --user user_id | current：指定要作为哪个用户运行；如果未指定, 则作为当前用户运行.

### force-stop package

强行停止与 package（[应用包名](#应用包名)）关联的所有应用.

### kill [options] package

终止与 package（[应用包名](#应用包名)）关联的所有进程. 此命令仅终止可安全终止且不会影响用户体验的进程.<br>
选项包括：

* --user user_id | all | current：指定将终止其进程的用户；如果未指定, 则终止所有用户的进程.

### kill-all

终止所有后台进程.

### broadcast [options] intent

发出广播 intent.
请参阅 [intent 参数的规范](#intent参数的规范).

选项包括：

* [--user user_id | all | current]：指定要发送到的用户；如果未指定, 则发送到所有用户.

### instrument [options] component

使用 Instrumentation 实例启动监控. 通常, 目标 component 是表单 test_package/runner_class.<br>
选项包括：

* -r：输出原始结果（否则对 report_key_streamresult 进行解码）. 与 [-e perf true] 结合使用以生成性能测量的原始输出.
* -e name value：将参数 name 设为 value. 对于测试运行器, 通用表单为 -e testrunner_flag value[,value...].
* -p file：将分析数据写入 file.
* -w：先等待仪器完成, 然后再返回. 测试运行器需要使用此选项.
* --no-window-animation：运行时关闭窗口动画.
* --user user_id | current：指定仪器在哪个用户中运行；如果未指定, 则在当前用户中运行.
* profile start process file 启动 process 的分析器, 将结果写入 file.
* profile stop process 停止 process 的分析器.

### dumpheap [options] process file

转储 process 的堆, 写入 file.

选项包括：

* --user [user_id|current]：提供进程名称时, 指定要转储的进程用户；如果未指定, 则使用当前用户.
* -n：转储原生堆, 而非托管堆.
* set-debug-app [options] package 将应用 package 设为调试.

选项包括：

* -w：应用启动时等待调试程序.
* --persistent：保留此值.
* clear-debug-app 使用 set-debug-app 清除以前针对调试用途设置的软件包.

### monitor [options]    启动对崩溃或 ANR 的监控.

选项包括：

* --gdb：在崩溃/ANR 时在给定端口上启动 gdbserv.

### screen-compat {on|off} package

控制 package 的屏幕兼容性模式.

### display-size [reset|widthxheight]

替换模拟器/设备显示尺寸. 此命令对于在不同尺寸的屏幕上测试您的应用非常有用, 它支持使用大屏设备模仿小屏幕分辨率（反之亦然）.<br>
示例：

```
shell("am display-size 1280x800", true);

```

### display-density dpi

替换模拟器/设备显示密度. 此命令对于在不同密度的屏幕上测试您的应用非常有用, 它支持使用低密度屏幕在高密度环境环境上进行测试（反之亦然）.<br>
示例：

```
shell("am display-density 480", true);
```

### to-uri intent

将给定的 intent 规范以 URI 的形式输出.
请参阅  [intent 参数的规范](#intent参数的规范).

### to-intent-uri intent

将给定的 intent 规范以 intent:URI 的形式输出.
请参阅 intent 参数的规范.

### intent参数的规范

对于采用 intent 参数的 am 命令, 您可以使用以下选项指定 intent：

* -a action<br>
  指定 intent 操作, 如“android.intent.action.VIEW”. 此指定只能声明一次.
* -d data_uri<br>
  指定 intent 数据 URI, 如“content://contacts/people/1”. 此指定只能声明一次.
* -t mime_type<br>
  指定 intent MIME 类型, 如“image/png”. 此指定只能声明一次.
* -c category<br>
  指定 intent 类别, 如“android.intent.category.APP_CONTACTS”.
* -n component<br>
  指定带有软件包名称前缀的组件名称以创建显式 intent, 如“com.example.app/.ExampleActivity”.
* -f flags<br>
  将标志添加到 setFlags() 支持的 intent.
* --esn extra_key<br>
  添加一个 null extra. URI intent 不支持此选项.
* -e|--es extra_key extra_string_value<br>
  添加字符串数据作为键值对.
* --ez extra_key extra_boolean_value<br>
  添加布尔型数据作为键值对.
* --ei extra_key extra_int_value<br>
  添加整数型数据作为键值对.
* --el extra_key extra_long_value<br>
  添加长整型数据作为键值对.
* --ef extra_key extra_float_value<br>
  添加浮点型数据作为键值对.
* --eu extra_key extra_uri_value<br>
  添加 URI 数据作为键值对.
* --ecn extra_key extra_component_name_value<br>
  添加组件名称, 将其作为 ComponentName 对象进行转换和传递.
* --eia extra_key extra_int_value[,extra_int_value...]<br>
  添加整数数组.
* --ela extra_key extra_long_value[,extra_long_value...]<br>
  添加长整型数组.
* --efa extra_key extra_float_value[,extra_float_value...]<br>
  添加浮点型数组.
* --grant-read-uri-permission<br>
  包含标志 FLAG_GRANT_READ_URI_PERMISSION.
* --grant-write-uri-permission<br>
  包含标志 FLAG_GRANT_WRITE_URI_PERMISSION.
* --debug-log-resolution<br>
  包含标志 FLAG_DEBUG_LOG_RESOLUTION.
* --exclude-stopped-packages<br>
  包含标志 FLAG_EXCLUDE_STOPPED_PACKAGES.
* --include-stopped-packages<br>
  包含标志 FLAG_INCLUDE_STOPPED_PACKAGES.
* --activity-brought-to-front<br>
  包含标志 FLAG_ACTIVITY_BROUGHT_TO_FRONT.
* --activity-clear-top<br>
  包含标志 FLAG_ACTIVITY_CLEAR_TOP.
* --activity-clear-when-task-reset<br>
  包含标志 FLAG_ACTIVITY_CLEAR_WHEN_TASK_RESET.
* --activity-exclude-from-recents<br>
  包含标志 FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS.
* --activity-launched-from-history<br>
  包含标志 FLAG_ACTIVITY_LAUNCHED_FROM_HISTORY.
* --activity-multiple-task<br>
  包含标志 FLAG_ACTIVITY_MULTIPLE_TASK.
* --activity-no-animation<br>
  包含标志 FLAG_ACTIVITY_NO_ANIMATION.
* --activity-no-history<br>
  包含标志 FLAG_ACTIVITY_NO_HISTORY.
* --activity-no-user-action<br>
  包含标志 FLAG_ACTIVITY_NO_USER_ACTION.
* --activity-previous-is-top<br>
  包含标志 FLAG_ACTIVITY_PREVIOUS_IS_TOP.
* --activity-reorder-to-front<br>
  包含标志 FLAG_ACTIVITY_REORDER_TO_FRONT.
* --activity-reset-task-if-needed<br>
  包含标志 FLAG_ACTIVITY_RESET_TASK_IF_NEEDED.
* --activity-single-top<br>
  包含标志 FLAG_ACTIVITY_SINGLE_TOP.
* --activity-clear-task<br>
  包含标志 FLAG_ACTIVITY_CLEAR_TASK.
* --activity-task-on-home<br>
  包含标志 FLAG_ACTIVITY_TASK_ON_HOME.
* --receiver-registered-only<br>
  包含标志 FLAG_RECEIVER_REGISTERED_ONLY.
* `--receiver-replace-pending`<br>
  包含标志 FLAG_RECEIVER_REPLACE_PENDING.
* --selector<br>
  需要使用 -d 和 -t 选项以设置 intent 数据和类型.

#### URI component package

如果不受上述某一选项的限制, 您可以直接指定 URI、软件包名称和组件名称. 当参数不受限制时, 如果参数包含一个“:”（冒号）, 则此工具假定参数是一个 URI；如果参数包含一个“/”（正斜杠）, 则此工具假定参数是一个组件名称；否则, 此工具假定参数是一个软件包名称.

## 应用包名

所谓应用包名, 是唯一确定应用的标识. 例如微信的包名是"com.tencent.mm", QQ的包名是"com.tencent.mobileqq".<br>
要获取一个应用的包名, 可以通过函数`getPackageName(appName)`获取. 参见帮助->其他一般函数.

## pm命令

pm命令用于管理应用程序, 例如卸载应用、冻结应用等.<br>
**以下命令均以"pm "开头, 例如"shell(\"pm disable com.tencent.mm\");"(冻结微信)**

### list packages [options] filter

输出所有软件包, 或者, 仅输出包名称包含 filter 中的文本的软件包.<br>
选项：

* -f：查看它们的关联文件.
* -d：进行过滤以仅显示已停用的软件包.
* -e：进行过滤以仅显示已启用的软件包.
* -s：进行过滤以仅显示系统软件包.
* -3：进行过滤以仅显示第三方软件包.
* -i：查看软件包的安装程序.
* -u：也包括卸载的软件包.
* --user user_id：要查询的用户空间.

### list permission-groups

输出所有已知的权限组.

### list permissions [options] group

输出所有已知权限, 或者, 仅输出 group 中的权限.<br>
选项：

* -g：按组加以组织.
* -f：输出所有信息.
* -s：简短摘要.
* -d：仅列出危险权限.
* -u：仅列出用户将看到的权限.

### list instrumentation [options]

列出所有测试软件包.<br>
选项：

* -f：列出用于测试软件包的 APK 文件.
* target_package：列出仅用于此应用的测试软件包.

### list features

输出系统的所有功能.

### list libraries

输出当前设备支持的所有库.

### list users

输出系统上的所有用户.

### path package

输出给定 package 的 APK 的路径.

### install [options] path

将软件包（通过 path 指定）安装到系统.<br>
选项：

* -l：安装具有转发锁定功能的软件包.
* -r：重新安装现有应用, 保留其数据.
* -t：允许安装测试 APK.
* -i installer_package_name：指定安装程序软件包名称.
* -s：在共享的大容量存储（如 sdcard）上安装软件包.
* -f：在内部系统内存上安装软件包.
* -d：允许版本代码降级.
* -g：授予应用清单文件中列出的所有权限.

### uninstall [options] package

从系统中卸载软件包.<br>
选项：

* -k：移除软件包后保留数据和缓存目录.

### clear package

删除与软件包关联的所有数据.

### enable package_or_component

启用给定软件包或组件（作为“package/class”写入）.

### disable package_or_component

停用给定软件包或组件（作为“package/class”写入）.

### disable-user [options] package_or_component

选项：

* --user user_id：要停用的用户.

### grant package_name permission

向应用授予权限. 在运行 Android 6.0（API 级别 23）及更高版本的设备上, 可以是应用清单中声明的任何权限. 在运行 Android 5.1（API 级别 22）和更低版本的设备上, 必须是应用定义的可选权限.

### revoke package_name permission

从应用中撤销权限. 在运行 Android 6.0（API 级别 23）及更高版本的设备上, 可以是应用清单中声明的任何权限. 在运行 Android 5.1（API 级别 22）和更低版本的设备上, 必须是应用定义的可选权限.

### set-install-location location

更改默认安装位置. 位置值：

* 0：自动—让系统决定最佳位置.
* 1：内部—安装在内部设备存储上.
* 2：外部—安装在外部介质上.

> 注：此命令仅用于调试目的；使用此命令会导致应用中断和其他意外行为.

### get-install-location

返回当前安装位置. 返回值：

* 0 [auto]：让系统决定最佳位置.
* 1 [internal]：安装在内部设备存储上
* 2 [external]：安装在外部介质上

### set-permission-enforced permission [true|false]

指定是否应强制执行给定的权限.

### trim-caches desired_free_space

减少缓存文件以达到给定的可用空间.

### create-user user_name

使用给定的 user_name 创建新用户, 输出新用户的标识符.

### remove-user user_id

移除具有给定的 user_id 的用户, 删除与该用户关联的所有数据.

### get-max-users

输出设备支持的最大用户数.

## 其他命令

### 进行屏幕截图

screencap 命令是一个用于对设备显示屏进行屏幕截图的 shell 实用程序。Monkey King 的全局
`Screencap(path)` 包装器固定调用 `screencap -p <path>`，其中 `-p` 要求 Android 以 PNG
格式写出截图。

```
screencap -p <path>
```

`Screencap` 只接受一个路径参数，参数会按字符串转换后直接拼接到命令末尾；路径应指向可写位置，
包含空格的路径需要调用方自行按 shell 规则转义。函数返回 `undefined`，不会返回截图文件内容或
`shell()` 的结果对象；命令执行失败应通过 shell 输出或回调排查。

例如：

```js
Screencap('/sdcard/screen.png');
```

### 列表文件

```
ls filepath
```

例如:

```
log(shell("ls /system/bin").result);
```

<!-- api-contracts:start -->

## API 合同表

下表覆盖本页在产品版本 `6.7.0` 中的每个 canonical 公共成员。每行同时给出稳定锚点、实现合同、参数与返回合同、权限与线程、生命周期与副作用、版本，以及可独立执行的 Rhino 2.0 成员存在性或值读取示例。对象实例名（如 `db`、`cursor`、`storage`）沿用本页正文中的创建方式。

| API ID / 稳定锚点 | 签名或入口 | 参数、可选项与默认值 | 返回值与异常 | 权限与线程 | 生命周期与副作用 | 版本 | Rhino 2.0 示例 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| <a id="api-symbol-Y2FsbDpzaGVsbA"></a> `call:shell` | `shell(cmd[, options][, withRoot])` · 实现合同  | `cmd` 为字符串或 JavaScript 数组；可选 `options` 为字符串/对象，或直接传布尔值/数字作为 root；第三参数为布尔值/数字；总参数数 1 至 3 | 返回 `AbstractShell.Result`（`code`、`result`、`error`）；参数校验失败抛出异常，进程错误写入结果 | 权限：普通 shell 使用应用权限，root 与 Shizuku 路径需对应授权；线程：同步等待命令进程结束 | 生命周期：一次性调用完成后关闭进程；副作用：命令可修改系统、文件和输入状态；`exit` 选项会追加退出命令 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(shell('id').code);` |
| <a id="api-symbol-Z2xvYmFsOkJhY2s"></a> `global:Back` | `Back()` · 实现合同  | 参数：无参数；可选项与默认值见本页说明或页面约束 | 返回：Undefined；参数校验、状态或底层异常原样传播 | 权限：普通 shell 使用应用权限，root 与 Shizuku 路径需对应授权；线程：命令通常同步等待 | 生命周期：一次性调用等待进程结束，交互对象必须退出；副作用：命令可修改系统、文件和输入状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof Back);` |
| <a id="api-symbol-Z2xvYmFsOkNhbWVyYQ"></a> `global:Camera` | `Camera()` · 实现合同  | 参数：无参数；可选项与默认值见本页说明或页面约束 | 返回：Undefined；参数校验、状态或底层异常原样传播 | 权限：普通 shell 使用应用权限，root 与 Shizuku 路径需对应授权；线程：命令通常同步等待 | 生命周期：一次性调用等待进程结束，交互对象必须退出；副作用：命令可修改系统、文件和输入状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof Camera);` |
| <a id="api-symbol-Z2xvYmFsOkRvd24"></a> `global:Down` | `Down()` · 实现合同  | 参数：无参数；可选项与默认值见本页说明或页面约束 | 返回：Undefined；参数校验、状态或底层异常原样传播 | 权限：普通 shell 使用应用权限，root 与 Shizuku 路径需对应授权；线程：命令通常同步等待 | 生命周期：一次性调用等待进程结束，交互对象必须退出；副作用：命令可修改系统、文件和输入状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof Down);` |
| <a id="api-symbol-Z2xvYmFsOkhvbWU"></a> `global:Home` | `Home()` · 实现合同  | 参数：无参数；可选项与默认值见本页说明或页面约束 | 返回：Undefined；参数校验、状态或底层异常原样传播 | 权限：普通 shell 使用应用权限，root 与 Shizuku 路径需对应授权；线程：命令通常同步等待 | 生命周期：一次性调用等待进程结束，交互对象必须退出；副作用：命令可修改系统、文件和输入状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof Home);` |
| <a id="api-symbol-Z2xvYmFsOklucHV0"></a> `global:Input` | `Input(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：Undefined；参数校验、状态或底层异常原样传播 | 权限：普通 shell 使用应用权限，root 与 Shizuku 路径需对应授权；线程：命令通常同步等待 | 生命周期：一次性调用等待进程结束，交互对象必须退出；副作用：命令可修改系统、文件和输入状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof Input);` |
| <a id="api-symbol-Z2xvYmFsOktleUNvZGU"></a> `global:KeyCode` | `KeyCode(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：Undefined；参数校验、状态或底层异常原样传播 | 权限：普通 shell 使用应用权限，root 与 Shizuku 路径需对应授权；线程：命令通常同步等待 | 生命周期：一次性调用等待进程结束，交互对象必须退出；副作用：命令可修改系统、文件和输入状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof KeyCode);` |
| <a id="api-symbol-Z2xvYmFsOkxlZnQ"></a> `global:Left` | `Left()` · 实现合同  | 参数：无参数；可选项与默认值见本页说明或页面约束 | 返回：Undefined；参数校验、状态或底层异常原样传播 | 权限：普通 shell 使用应用权限，root 与 Shizuku 路径需对应授权；线程：命令通常同步等待 | 生命周期：一次性调用等待进程结束，交互对象必须退出；副作用：命令可修改系统、文件和输入状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof Left);` |
| <a id="api-symbol-Z2xvYmFsOk1lbnU"></a> `global:Menu` | `Menu()` · 实现合同  | 参数：无参数；可选项与默认值见本页说明或页面约束 | 返回：Undefined；参数校验、状态或底层异常原样传播 | 权限：普通 shell 使用应用权限，root 与 Shizuku 路径需对应授权；线程：命令通常同步等待 | 生命周期：一次性调用等待进程结束，交互对象必须退出；副作用：命令可修改系统、文件和输入状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof Menu);` |
| <a id="api-symbol-Z2xvYmFsOk9L"></a> `global:OK` | `OK()` · 实现合同  | 参数：无参数；可选项与默认值见本页说明或页面约束 | 返回：Undefined；参数校验、状态或底层异常原样传播 | 权限：普通 shell 使用应用权限，root 与 Shizuku 路径需对应授权；线程：命令通常同步等待 | 生命周期：一次性调用等待进程结束，交互对象必须退出；副作用：命令可修改系统、文件和输入状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof OK);` |
| <a id="api-symbol-Z2xvYmFsOlBvd2Vy"></a> `global:Power` | `Power()` · 实现合同  | 参数：无参数；可选项与默认值见本页说明或页面约束 | 返回：Undefined；参数校验、状态或底层异常原样传播 | 权限：普通 shell 使用应用权限，root 与 Shizuku 路径需对应授权；线程：命令通常同步等待 | 生命周期：一次性调用等待进程结束，交互对象必须退出；副作用：命令可修改系统、文件和输入状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof Power);` |
| <a id="api-symbol-Z2xvYmFsOlJpZ2h0"></a> `global:Right` | `Right()` · 实现合同  | 参数：无参数；可选项与默认值见本页说明或页面约束 | 返回：Undefined；参数校验、状态或底层异常原样传播 | 权限：普通 shell 使用应用权限，root 与 Shizuku 路径需对应授权；线程：命令通常同步等待 | 生命周期：一次性调用等待进程结束，交互对象必须退出；副作用：命令可修改系统、文件和输入状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof Right);` |
| <a id="api-symbol-Z2xvYmFsOlNjcmVlbmNhcA"></a> `global:Screencap` | `Screencap(path)` · 实现合同  | 参数：恰好 1 个路径参数；按字符串转换后传给 root shell；包装器固定追加 `-p` | 返回：`undefined`；参数校验失败抛出异常，截图命令错误不通过返回值报告 | 权限：需要 root shell 或等效截图授权；线程：向 `rootShell` 写入 `screencap -p <path>` | 生命周期：命令写入后由 shell 执行；副作用：在目标路径创建或覆盖 PNG 截图文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`Screencap('/sdcard/screen.png'); console.log('requested');` |
| <a id="api-symbol-Z2xvYmFsOlNldFNjcmVlbk1ldHJpY3M"></a> `global:SetScreenMetrics` | `SetScreenMetrics(...args)` · 实现合同  | 参数：恰好 2 个参数；可选项与默认值见本页说明或页面约束 | 返回：Undefined；参数校验、状态或底层异常原样传播 | 权限：普通 shell 使用应用权限，root 与 Shizuku 路径需对应授权；线程：命令通常同步等待 | 生命周期：一次性调用等待进程结束，交互对象必须退出；副作用：命令可修改系统、文件和输入状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof SetScreenMetrics);` |
| <a id="api-symbol-Z2xvYmFsOlN3aXBl"></a> `global:Swipe` | `Swipe(...args)` · 实现合同  | 参数：4 至 5 个参数；可选项与默认值见本页说明或页面约束 | 返回：Undefined；参数校验、状态或底层异常原样传播 | 权限：普通 shell 使用应用权限，root 与 Shizuku 路径需对应授权；线程：命令通常同步等待 | 生命周期：一次性调用等待进程结束，交互对象必须退出；副作用：命令可修改系统、文件和输入状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof Swipe);` |
| <a id="api-symbol-Z2xvYmFsOlRhcA"></a> `global:Tap` | `Tap(x, y)` · 实现合同  | 参数：恰好 2 个数值坐标参数 `x`、`y`；不接受额外参数 | 返回：Undefined；坐标转换或 shell 执行异常原样传播 | 权限：需要 root shell 或等效输入注入授权；线程：同步写入命令 | 生命周期：调用完成后无持久状态；副作用：向设备注入点击事件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`Tap(100, 200); console.log('tap sent');` |
| <a id="api-symbol-Z2xvYmFsOlRleHQ"></a> `global:Text` | `Text(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：Undefined；参数校验、状态或底层异常原样传播 | 权限：普通 shell 使用应用权限，root 与 Shizuku 路径需对应授权；线程：命令通常同步等待 | 生命周期：一次性调用等待进程结束，交互对象必须退出；副作用：命令可修改系统、文件和输入状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof Text);` |
| <a id="api-symbol-Z2xvYmFsOlVw"></a> `global:Up` | `Up()` · 实现合同  | 参数：无参数；可选项与默认值见本页说明或页面约束 | 返回：Undefined；参数校验、状态或底层异常原样传播 | 权限：普通 shell 使用应用权限，root 与 Shizuku 路径需对应授权；线程：命令通常同步等待 | 生命周期：一次性调用等待进程结束，交互对象必须退出；副作用：命令可修改系统、文件和输入状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof Up);` |
| <a id="api-symbol-Z2xvYmFsOlZvbHVtZURvd24"></a> `global:VolumeDown` | `VolumeDown()` · 实现合同  | 参数：无参数；可选项与默认值见本页说明或页面约束 | 返回：Undefined；参数校验、状态或底层异常原样传播 | 权限：普通 shell 使用应用权限，root 与 Shizuku 路径需对应授权；线程：命令通常同步等待 | 生命周期：一次性调用等待进程结束，交互对象必须退出；副作用：命令可修改系统、文件和输入状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof VolumeDown);` |
| <a id="api-symbol-Z2xvYmFsOlZvbHVtZVVw"></a> `global:VolumeUp` | `VolumeUp()` · 实现合同  | 参数：无参数；可选项与默认值见本页说明或页面约束 | 返回：Undefined；参数校验、状态或底层异常原样传播 | 权限：普通 shell 使用应用权限，root 与 Shizuku 路径需对应授权；线程：命令通常同步等待 | 生命周期：一次性调用等待进程结束，交互对象必须退出；副作用：命令可修改系统、文件和输入状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof VolumeUp);` |
| <a id="api-symbol-bW9kdWxlOnNoZWxs"></a> `module:shell` | `shell` 模块入口 · 实现合同  | 入口：全局或父模块属性；无构造参数 | 返回：模块对象；参数校验、状态或底层异常原样传播 | 权限：普通 shell 使用应用权限，root 与 Shizuku 路径需对应授权；线程：命令通常同步等待 | 生命周期：一次性调用等待进程结束，交互对象必须退出；副作用：命令可修改系统、文件和输入状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof shell);` |
| <a id="api-symbol-c2hlbGwuY3VycmVudEFjdGl2aXR5"></a> `shell.currentActivity` | `shell.currentActivity()` · 实现合同  | 参数：无参数；可选项与默认值见本页说明或页面约束 | 返回：String；参数校验、状态或底层异常原样传播 | 权限：普通 shell 使用应用权限，root 与 Shizuku 路径需对应授权；线程：命令通常同步等待 | 生命周期：一次性调用等待进程结束，交互对象必须退出；副作用：命令可修改系统、文件和输入状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof shell.currentActivity);` |
| <a id="api-symbol-c2hlbGwuY3VycmVudENvbXBvbmVudA"></a> `shell.currentComponent` | `shell.currentComponent()` · 实现合同  | 参数：无参数；可选项与默认值见本页说明或页面约束 | 返回：String；参数校验、状态或底层异常原样传播 | 权限：普通 shell 使用应用权限，root 与 Shizuku 路径需对应授权；线程：命令通常同步等待 | 生命周期：一次性调用等待进程结束，交互对象必须退出；副作用：命令可修改系统、文件和输入状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof shell.currentComponent);` |
| <a id="api-symbol-c2hlbGwuY3VycmVudFBhY2thZ2U"></a> `shell.currentPackage` | `shell.currentPackage()` · 实现合同  | 参数：无参数；可选项与默认值见本页说明或页面约束 | 返回：String；参数校验、状态或底层异常原样传播 | 权限：普通 shell 使用应用权限，root 与 Shizuku 路径需对应授权；线程：命令通常同步等待 | 生命周期：一次性调用等待进程结束，交互对象必须退出；副作用：命令可修改系统、文件和输入状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof shell.currentPackage);` |
| <a id="api-symbol-c2hlbGwuZXhlY0NvbW1hbmQ"></a> `shell.execCommand` | `shell.execCommand(...args)` · 实现合同  | 参数：1 至 3 个参数；可选项与默认值见本页说明或页面约束 | 返回：AbstractShell.Result；参数校验、状态或底层异常原样传播 | 权限：普通 shell 使用应用权限，root 与 Shizuku 路径需对应授权；线程：命令通常同步等待 | 生命周期：一次性调用等待进程结束，交互对象必须退出；副作用：命令可修改系统、文件和输入状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof shell.execCommand);` |
| <a id="api-symbol-c2hlbGwuZnJvbUludGVudA"></a> `shell.fromIntent` | `shell.fromIntent(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：String；参数校验、状态或底层异常原样传播 | 权限：普通 shell 使用应用权限，root 与 Shizuku 路径需对应授权；线程：命令通常同步等待 | 生命周期：一次性调用等待进程结束，交互对象必须退出；副作用：命令可修改系统、文件和输入状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof shell.fromIntent);` |
| <a id="api-symbol-c2hlbGwuZ2V0Q29tbWFuZA"></a> `shell.getCommand` | `shell.getCommand(cmd[, options][, withRoot])` · 实现合同  | 参数：1 至 3 个；`cmd` 为字符串或数组，`options` 为字符串/对象或 root 布尔值/数字，第三参数为 root 布尔值/数字 | 返回：String；仅生成规范化命令，不执行它；参数校验失败抛出异常 | 权限：不执行命令，不额外申请权限；线程：同步字符串转换 | 生命周期：纯计算，无持久状态；副作用：不启动进程 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(shell.getCommand('am', { user: 0 }));` |
| <a id="api-symbol-c2hlbGwua2lsbA"></a> `shell.kill` | `shell.kill(app)` · 实现合同  | 参数：恰好 1 个应用标识，可由 `App.getPackageName` 解析 | 返回 `boolean`；无 root、无法解析包名或 force-stop 失败时返回 `false` | 权限：需要可用 root；线程：同步执行 force-stop | 生命周期：调用完成后无持久状态；副作用：强制停止目标应用 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(shell.kill('com.tencent.mm'));` |

### Rhino 2.0 表格读取示例

```js
console.log('Rhino 2.0 contract table: shell');
```

<!-- api-contracts:end -->
