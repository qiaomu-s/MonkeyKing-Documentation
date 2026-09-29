# 文件 (Files)

files模块提供了一些常见的文件处理, 包括文件读写、移动、复制、删掉等.

一次性的文件读写可以直接使用`files.read()`, `files.write()`, `files.append()`等方便的函数, 但如果需要频繁读写或随机读写, 则使用`open()`函数打开一个文件对象来操作文件, 并在操作完毕后调用`close()`函数关闭文件.

## files.isFile(path)

* `path` {string} 路径
* 返回 {boolean}

返回路径path是否是文件.

```
log(files.isDir("/sdcard/文件夹/")); //返回false
log(files.isDir("/sdcard/文件.txt")); //返回true
```

## files.isDir(path)

* `path` {string} 路径
* 返回 {boolean}

返回路径path是否是文件夹.

```
log(files.isDir("/sdcard/文件夹/")); //返回true
log(files.isDir("/sdcard/文件.txt")); //返回false
```

## files.isEmptyDir(path)

* `path` {string} 路径
* 返回 {boolean}

返回文件夹path是否为空文件夹. 如果该路径并非文件夹, 则直接返回`false`.

## files.join(parent, child)

* `parent` {string} 父目录路径
* `child` {string} 子路径
* 返回 {string}

连接两个路径并返回, 例如`files.join("/sdcard/", "1.txt")`返回"/sdcard/1.txt".

## files.create(path)

* `path` {string} 路径
* 返回 {boolean}

创建一个文件或文件夹并返回是否创建成功. 如果文件已经存在, 则直接返回`false`.

```
files.create("/sdcard/新文件夹/");
```

## files.createWithDirs(path)

* `path` {string} 路径
* 返回 {boolean}

创建一个文件或文件夹并返回是否创建成功. 如果文件所在文件夹不存在, 则先创建他所在的一系列文件夹. 如果文件已经存在, 则直接返回`false`.

```
files.createWithDirs("/sdcard/新文件夹/新文件夹/新文件夹/1.txt");
```

## files.exists(path)

* `path` {string} 路径
* 返回 {boolean}

返回在路径path处的文件是否存在.

## files.ensureDir(path)

* `path` {string} 路径

确保路径path所在的文件夹存在. 如果该路径所在文件夹不存在, 则创建该文件夹.

例如对于路径"/sdcard/Download/ABC/1.txt", 如果/Download/文件夹不存在, 则会先创建Download, 再创建ABC文件夹.

## files.read(path[, encoding = "utf-8"])

* `path` {string} 路径
* `encoding` {string} 字符编码, 可选, 默认为utf-8
* 返回 {string}

读取文本文件path的所有内容并返回. 如果文件不存在, 则抛出`FileNotFoundException`.

```
log(files.read("/sdcard/1.txt"));
```

## files.readBytes(path)

* `path` {string} 路径
* 返回 {byte[]}

读取文件path的所有内容并返回一个字节数组. 如果文件不存在, 则抛出`FileNotFoundException`.

注意, 该数组是Java的数组, 不具有JavaScript数组的forEach, slice等函数.

一个以16进制形式打印文件的例子如下:

```
var data = files.readBytes("/sdcard/1.png");
var sb = new java.lang.StringBuilder();
for(var i = 0; i < data.length; i++){
    sb.append(data[i].toString(16));
}
log(sb.toString());
```

## files.write(path, text[, encoding = "utf-8"])

* `path` {string} 路径
* `text` {string} 要写入的文本内容
* `encoding` {string} 字符编码

把text写入到文件path中. 如果文件存在则覆盖, 不存在则创建.

```
var text = "文件内容";
//写入文件
files.write("/sdcard/1.txt", text);
//用其他应用查看文件
app.viewFile("/sdcard/1.txt");
```

## files.writeBytes(path, bytes)

* `path` {string} 路径
* `bytes` {byte[]} 字节数组, 要写入的二进制数据

把bytes写入到文件path中. 如果文件存在则覆盖, 不存在则创建.

## files.append(path, text[, encoding = 'utf-8'])

* `path` {string} 路径
* `text` {string} 要写入的文本内容
* `encoding` {string} 字符编码

把text追加到文件path的末尾. 如果文件不存在则创建.

```
var text = "追加的文件内容";
files.append("/sdcard/1.txt", text);
files.append("/sdcard/1.txt", text);
//用其他应用查看文件
app.viewFile("/sdcard/1.txt");
```

## files.appendBytes(path, text[, encoding = 'utf-8'])

* `path` {string} 路径
* `bytes` {byte[]} 字节数组, 要写入的二进制数据

把bytes追加到文件path的末尾. 如果文件不存在则创建.

## files.copy(fromPath, toPath)

* `fromPath` {string} 要复制的原文件路径
* `toPath` {string} 复制到的文件路径
* 返回 {boolean}

复制文件, 返回是否复制成功. 例如`files.copy("/sdcard/1.txt", "/sdcard/Download/1.txt")`.

## files.move(fromPath, toPath)

* `fromPath` {string} 要移动的原文件路径
* `toPath` {string} 移动到的文件路径
* 返回 {boolean}

移动文件, 返回是否移动成功. 例如`files.move("/sdcard/1.txt", "/sdcard/Download/1.txt")`会把1.txt文件从sd卡根目录移动到Download文件夹.

## files.rename(path, newName)

* `path` {string} 要重命名的原文件路径
* `newName` {string} 要重命名的新文件名
* 返回 {boolean}

重命名文件, 并返回是否重命名成功. 例如`files.rename("/sdcard/1.txt", "2.txt")`.

## files.renameWithoutExtension(path, newName)

* `path` {string} 要重命名的原文件路径
* `newName` {string} 要重命名的新文件名
* 返回 {boolean}

重命名文件, 不包含拓展名, 并返回是否重命名成功. 例如`files.rename("/sdcard/1.txt", "2")`会把"1.txt"重命名为"2.txt".

## files.getName(path)

* `path` {string} 路径
* 返回 {string}

返回文件的文件名. 例如`files.getName("/sdcard/1.txt")`返回"1.txt".

## files.getNameWithoutExtension(path)

* `path` {string} 路径
* 返回 {string}

返回不含拓展名的文件的文件名. 例如`files.getName("/sdcard/1.txt")`返回"1".

## files.getExtension(path)

* `path` {string} 路径
* 返回 {string}

返回文件的拓展名. 例如`files.getExtension("/sdcard/1.txt")`返回"txt".

## files.remove(path)

* `path` {string} 路径
* 返回 {boolean}

删除文件或**空文件夹**, 返回是否删除成功.

## files.removeDir(path)

* `path` {string} 路径
* `path` {string} 路径
* 返回 {boolean}

删除文件夹, 如果文件夹不为空, 则删除该文件夹的所有内容再删除该文件夹, 返回是否全部删除成功.

## files.getSdcardPath()

* 返回 {string}

返回SD卡路径. 所谓SD卡, 即外部存储器.

## files.cwd()

* 返回 {string}

返回脚本的"当前工作文件夹路径". 该路径指的是, 如果脚本本身为脚本文件, 则返回这个脚本文件所在目录；否则返回`null`获取其他设定路径.

例如, 对于脚本文件"/sdcard/脚本/1.js"运行`files.cwd()`返回"/sdcard/脚本/".

## files.path(relativePath)

* `relativePath` {string} 相对路径
* 返回 {string}

返回相对路径对应的绝对路径. 例如`files.path("./1.png")`, 如果运行这个语句的脚本位于文件夹"/sdcard/脚本/"中, 则返回`"/sdcard/脚本/1.png"`.

## files.listDir(path[, filter])

* `path` {string} 路径
* `filter` {Function} 过滤函数, 可选. 接收一个`string`参数（文件名）, 返回一个`boolean`值.

列出文件夹path下的满足条件的文件和文件夹的名称的数组. 如果不加filter参数, 则返回所有文件和文件夹.

列出sdcard目录下所有文件和文件夹为:

```
var arr = files.listDir("/sdcard/");
log(arr);
```

列出脚本目录下所有js脚本文件为:

```
var dir = "/sdcard/脚本/";
var jsFiles = files.listDir(dir, function(name){
    return name.endsWith(".js") && files.isFile(files.join(dir, name));
});
log(jsFiles);
```

## open(path[, mode = "r", encoding = "utf-8", bufferSize = 8192])

* `path` {string} 文件路径, 例如"/sdcard/1.txt".
* `mode` {string} 文件打开模式, 包括:
    * "r": 只读文本模式. 该模式下只能对文件执行**文本**读取操作.
    * "w": 只写文本模式. 该模式下只能对文件执行**文本**覆盖写入操作.
    * "a": 附加文本模式. 该模式下将会把写入的文本附加到文件末尾.
    * "rw": 随机读写文本模式. 该模式下将会把写入的文本附加到文件末尾.
      目前暂不支持二进制模式, 随机读写模式.
* `encoding` {string} 字符编码.
* `bufferSize` {number} 文件读写的缓冲区大小.

打开一个文件. 根据打开模式返回不同的文件对象. 包括：

* "r": 返回一个ReadableTextFile对象.
* "w", "a": 返回一个WritableTextFile对象.

对于"w"模式, 如果文件并不存在, 则会创建一个, 已存在则会清空该文件内容；其他模式文件不存在会抛出FileNotFoundException.

# ReadableTextFile

可读文件对象.

## ReadableTextFile.read()

返回该文件剩余的所有内容的字符串.

## ReadableTextFile.read(maxCount)

* `maxCount` {Number} 最大读取的字符数量

读取该文件接下来最长为maxCount的字符串并返回. 即使文件剩余内容不足maxCount也不会出错.

## ReadableTextFile.readline()

读取一行并返回（不包含换行符）.

## ReadableTextFile.readlines()

读取剩余的所有行, 并返回它们按顺序组成的字符串数组.

## close()

关闭该文件.

**打开一个文件不再使用时务必关闭**

# PWritableTextFile

可写文件对象.

## PWritableTextFile.write(text)

* `text` {string} 文本

把文本内容text写入到文件中.

## PWritableTextFile.writeline(line)

* `text` {string} 文本

把文本line写入到文件中并写入一个换行符.

## PWritableTextFile.writelines(lines)

* `lines` {Array} 字符串数组

把很多行写入到文件中....

## PWritableTextFile.flush()

把缓冲区内容输出到文件中.

## PWritableTextFile.close()

关闭文件. 同时会被缓冲区内容输出到文件.

**打开一个文件写入后, 不再使用时务必关闭, 否则文件可能会丢失**

<!-- api-contracts:start -->

## API 合同表

下表覆盖本页在当前公开 API 中的每个 canonical 公共成员。每行同时给出稳定锚点、实现合同、参数与返回合同、权限与线程、生命周期与副作用、版本，以及可独立执行的 Rhino 2.0 成员存在性或值读取示例。对象实例名（如 `db`、`cursor`、`storage`）沿用本页正文中的创建方式。

| API ID / 稳定锚点 | 签名或入口 | 参数、可选项与默认值 | 返回值与异常 | 权限与线程 | 生命周期与副作用 | 版本 | Rhino 2.0 示例 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| <a id="api-symbol-ZmlsZXMuYXBwZW5k"></a> `files.append` | `files.append(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：应用私有目录通常无需权限，公共路径遵循 Android 存储策略；线程：同步 I/O，大文件应放工作线程 | 生命周期：一次性方法自行完成，open 返回对象必须关闭；副作用：按成员读写、移动或删除文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof files.append);` |
| <a id="api-symbol-ZmlsZXMuYXBwZW5kQnl0ZXM"></a> `files.appendBytes` | `files.appendBytes(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：应用私有目录通常无需权限，公共路径遵循 Android 存储策略；线程：同步 I/O，大文件应放工作线程 | 生命周期：一次性方法自行完成，open 返回对象必须关闭；副作用：按成员读写、移动或删除文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof files.appendBytes);` |
| <a id="api-symbol-ZmlsZXMuY29udGV4dA"></a> `files.context` | `files.context` · 实现合同  | 属性访问；无调用参数 | 返回：Context；参数校验、状态或底层异常原样传播 | 权限：应用私有目录通常无需权限，公共路径遵循 Android 存储策略；线程：同步 I/O，大文件应放工作线程 | 生命周期：一次性方法自行完成，open 返回对象必须关闭；副作用：按成员读写、移动或删除文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(files.context);` |
| <a id="api-symbol-ZmlsZXMuY29weQ"></a> `files.copy` | `files.copy(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：应用私有目录通常无需权限，公共路径遵循 Android 存储策略；线程：同步 I/O，大文件应放工作线程 | 生命周期：一次性方法自行完成，open 返回对象必须关闭；副作用：按成员读写、移动或删除文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof files.copy);` |
| <a id="api-symbol-ZmlsZXMuY3JlYXRl"></a> `files.create` | `files.create(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：应用私有目录通常无需权限，公共路径遵循 Android 存储策略；线程：同步 I/O，大文件应放工作线程 | 生命周期：一次性方法自行完成，open 返回对象必须关闭；副作用：按成员读写、移动或删除文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof files.create);` |
| <a id="api-symbol-ZmlsZXMuY3JlYXRlSWZOb3RFeGlzdHM"></a> `files.createIfNotExists` | `files.createIfNotExists(path: String?)` · 实现合同  | 参数：path: String?；可选项与默认值按实现合同重载 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：应用私有目录通常无需权限，公共路径遵循 Android 存储策略；线程：同步 I/O，大文件应放工作线程 | 生命周期：一次性方法自行完成，open 返回对象必须关闭；副作用：按成员读写、移动或删除文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof files.createIfNotExists);` |
| <a id="api-symbol-ZmlsZXMuY3JlYXRlV2l0aERpcnM"></a> `files.createWithDirs` | `files.createWithDirs(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：应用私有目录通常无需权限，公共路径遵循 Android 存储策略；线程：同步 I/O，大文件应放工作线程 | 生命周期：一次性方法自行完成，open 返回对象必须关闭；副作用：按成员读写、移动或删除文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof files.createWithDirs);` |
| <a id="api-symbol-ZmlsZXMuY3dk"></a> `files.cwd` | `files.cwd(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：应用私有目录通常无需权限，公共路径遵循 Android 存储策略；线程：同步 I/O，大文件应放工作线程 | 生命周期：一次性方法自行完成，open 返回对象必须关闭；副作用：按成员读写、移动或删除文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof files.cwd);` |
| <a id="api-symbol-ZmlsZXMuZW5zdXJlRGly"></a> `files.ensureDir` | `files.ensureDir(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：应用私有目录通常无需权限，公共路径遵循 Android 存储策略；线程：同步 I/O，大文件应放工作线程 | 生命周期：一次性方法自行完成，open 返回对象必须关闭；副作用：按成员读写、移动或删除文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof files.ensureDir);` |
| <a id="api-symbol-ZmlsZXMuZXhpc3Rz"></a> `files.exists` | `files.exists(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：应用私有目录通常无需权限，公共路径遵循 Android 存储策略；线程：同步 I/O，大文件应放工作线程 | 生命周期：一次性方法自行完成，open 返回对象必须关闭；副作用：按成员读写、移动或删除文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof files.exists);` |
| <a id="api-symbol-ZmlsZXMuZm9ybWF0U2l6ZVdpdGhVbml0"></a> `files.formatSizeWithUnit` | `files.formatSizeWithUnit(bytes: Long)` · 实现合同  | 参数：bytes: Long；可选项与默认值按实现合同重载 | 返回：String；参数校验、状态或底层异常原样传播 | 权限：应用私有目录通常无需权限，公共路径遵循 Android 存储策略；线程：同步 I/O，大文件应放工作线程 | 生命周期：一次性方法自行完成，open 返回对象必须关闭；副作用：按成员读写、移动或删除文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof files.formatSizeWithUnit);` |
| <a id="api-symbol-ZmlsZXMuZ2V0RXh0ZW5zaW9u"></a> `files.getExtension` | `files.getExtension(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：应用私有目录通常无需权限，公共路径遵循 Android 存储策略；线程：同步 I/O，大文件应放工作线程 | 生命周期：一次性方法自行完成，open 返回对象必须关闭；副作用：按成员读写、移动或删除文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof files.getExtension);` |
| <a id="api-symbol-ZmlsZXMuZ2V0SHVtYW5SZWFkYWJsZVNpemU"></a> `files.getHumanReadableSize` | `files.getHumanReadableSize(bytes: Long, useIecIdentifier: Boolean = false)` · 实现合同  | 参数：bytes: Long, useIecIdentifier: Boolean = false；可选项与默认值按实现合同重载 | 返回：String；参数校验、状态或底层异常原样传播 | 权限：应用私有目录通常无需权限，公共路径遵循 Android 存储策略；线程：同步 I/O，大文件应放工作线程 | 生命周期：一次性方法自行完成，open 返回对象必须关闭；副作用：按成员读写、移动或删除文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof files.getHumanReadableSize);` |
| <a id="api-symbol-ZmlsZXMuZ2V0TmFtZQ"></a> `files.getName` | `files.getName(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：应用私有目录通常无需权限，公共路径遵循 Android 存储策略；线程：同步 I/O，大文件应放工作线程 | 生命周期：一次性方法自行完成，open 返回对象必须关闭；副作用：按成员读写、移动或删除文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof files.getName);` |
| <a id="api-symbol-ZmlsZXMuZ2V0TmFtZVdpdGhvdXRFeHRlbnNpb24"></a> `files.getNameWithoutExtension` | `files.getNameWithoutExtension(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：应用私有目录通常无需权限，公共路径遵循 Android 存储策略；线程：同步 I/O，大文件应放工作线程 | 生命周期：一次性方法自行完成，open 返回对象必须关闭；副作用：按成员读写、移动或删除文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof files.getNameWithoutExtension);` |
| <a id="api-symbol-ZmlsZXMuZ2V0U2ltcGxpZmllZFBhdGg"></a> `files.getSimplifiedPath` | `files.getSimplifiedPath(path: String?)` · 实现合同  | 参数：path: String?；可选项与默认值按实现合同重载 | 返回：String；参数校验、状态或底层异常原样传播 | 权限：应用私有目录通常无需权限，公共路径遵循 Android 存储策略；线程：同步 I/O，大文件应放工作线程 | 生命周期：一次性方法自行完成，open 返回对象必须关闭；副作用：按成员读写、移动或删除文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof files.getSimplifiedPath);` |
| <a id="api-symbol-ZmlsZXMuaXNEaXI"></a> `files.isDir` | `files.isDir(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：应用私有目录通常无需权限，公共路径遵循 Android 存储策略；线程：同步 I/O，大文件应放工作线程 | 生命周期：一次性方法自行完成，open 返回对象必须关闭；副作用：按成员读写、移动或删除文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof files.isDir);` |
| <a id="api-symbol-ZmlsZXMuaXNFbXB0eURpcg"></a> `files.isEmptyDir` | `files.isEmptyDir(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：应用私有目录通常无需权限，公共路径遵循 Android 存储策略；线程：同步 I/O，大文件应放工作线程 | 生命周期：一次性方法自行完成，open 返回对象必须关闭；副作用：按成员读写、移动或删除文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof files.isEmptyDir);` |
| <a id="api-symbol-ZmlsZXMuaXNGaWxl"></a> `files.isFile` | `files.isFile(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：应用私有目录通常无需权限，公共路径遵循 Android 存储策略；线程：同步 I/O，大文件应放工作线程 | 生命周期：一次性方法自行完成，open 返回对象必须关闭；副作用：按成员读写、移动或删除文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof files.isFile);` |
| <a id="api-symbol-ZmlsZXMuam9pbg"></a> `files.join` | `files.join(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：应用私有目录通常无需权限，公共路径遵循 Android 存储策略；线程：同步 I/O，大文件应放工作线程 | 生命周期：一次性方法自行完成，open 返回对象必须关闭；副作用：按成员读写、移动或删除文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof files.join);` |
| <a id="api-symbol-ZmlsZXMubGlzdERpcg"></a> `files.listDir` | `files.listDir(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：应用私有目录通常无需权限，公共路径遵循 Android 存储策略；线程：同步 I/O，大文件应放工作线程 | 生命周期：一次性方法自行完成，open 返回对象必须关闭；副作用：按成员读写、移动或删除文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof files.listDir);` |
| <a id="api-symbol-ZmlsZXMubW92ZQ"></a> `files.move` | `files.move(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：应用私有目录通常无需权限，公共路径遵循 Android 存储策略；线程：同步 I/O，大文件应放工作线程 | 生命周期：一次性方法自行完成，open 返回对象必须关闭；副作用：按成员读写、移动或删除文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof files.move);` |
| <a id="api-symbol-ZmlsZXMubm9uTnVsbFBhdGg"></a> `files.nonNullPath` | `files.nonNullPath(relativePath: String)` · 实现合同  | 参数：relativePath: String；可选项与默认值按实现合同重载 | 返回：String；参数校验、状态或底层异常原样传播 | 权限：应用私有目录通常无需权限，公共路径遵循 Android 存储策略；线程：同步 I/O，大文件应放工作线程 | 生命周期：一次性方法自行完成，open 返回对象必须关闭；副作用：按成员读写、移动或删除文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof files.nonNullPath);` |
| <a id="api-symbol-ZmlsZXMub3Blbg"></a> `files.open` | `files.open(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：应用私有目录通常无需权限，公共路径遵循 Android 存储策略；线程：同步 I/O，大文件应放工作线程 | 生命周期：一次性方法自行完成，open 返回对象必须关闭；副作用：按成员读写、移动或删除文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof files.open);` |
| <a id="api-symbol-ZmlsZXMucGF0aA"></a> `files.path` | `files.path(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：应用私有目录通常无需权限，公共路径遵循 Android 存储策略；线程：同步 I/O，大文件应放工作线程 | 生命周期：一次性方法自行完成，open 返回对象必须关闭；副作用：按成员读写、移动或删除文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof files.path);` |
| <a id="api-symbol-ZmlsZXMucmVhZA"></a> `files.read` | `files.read(path: String?, encoding: String? = PFiles.DEFAULT_ENCODING)` · 实现合同  | 参数：path: String?, encoding: String? = PFiles.DEFAULT_ENCODING；可选项与默认值按实现合同重载 | 返回：String；参数校验、状态或底层异常原样传播 | 权限：应用私有目录通常无需权限，公共路径遵循 Android 存储策略；线程：同步 I/O，大文件应放工作线程 | 生命周期：一次性方法自行完成，open 返回对象必须关闭；副作用：按成员读写、移动或删除文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof files.read);` |
| <a id="api-symbol-ZmlsZXMucmVhZEFzc2V0cw"></a> `files.readAssets` | `files.readAssets(fileName: String?, encoding: String? = PFiles.DEFAULT_ENCODING)` · 实现合同  | 参数：fileName: String?, encoding: String? = PFiles.DEFAULT_ENCODING；可选项与默认值按实现合同重载 | 返回：String；参数校验、状态或底层异常原样传播 | 权限：应用私有目录通常无需权限，公共路径遵循 Android 存储策略；线程：同步 I/O，大文件应放工作线程 | 生命周期：一次性方法自行完成，open 返回对象必须关闭；副作用：按成员读写、移动或删除文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof files.readAssets);` |
| <a id="api-symbol-ZmlsZXMucmVhZEJ5dGVz"></a> `files.readBytes` | `files.readBytes(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：应用私有目录通常无需权限，公共路径遵循 Android 存储策略；线程：同步 I/O，大文件应放工作线程 | 生命周期：一次性方法自行完成，open 返回对象必须关闭；副作用：按成员读写、移动或删除文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof files.readBytes);` |
| <a id="api-symbol-ZmlsZXMucmVtb3Zl"></a> `files.remove` | `files.remove(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：应用私有目录通常无需权限，公共路径遵循 Android 存储策略；线程：同步 I/O，大文件应放工作线程 | 生命周期：一次性方法自行完成，open 返回对象必须关闭；副作用：按成员读写、移动或删除文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof files.remove);` |
| <a id="api-symbol-ZmlsZXMucmVtb3ZlRGly"></a> `files.removeDir` | `files.removeDir(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：应用私有目录通常无需权限，公共路径遵循 Android 存储策略；线程：同步 I/O，大文件应放工作线程 | 生命周期：一次性方法自行完成，open 返回对象必须关闭；副作用：按成员读写、移动或删除文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof files.removeDir);` |
| <a id="api-symbol-ZmlsZXMucmVuYW1l"></a> `files.rename` | `files.rename(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：应用私有目录通常无需权限，公共路径遵循 Android 存储策略；线程：同步 I/O，大文件应放工作线程 | 生命周期：一次性方法自行完成，open 返回对象必须关闭；副作用：按成员读写、移动或删除文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof files.rename);` |
| <a id="api-symbol-ZmlsZXMucmVuYW1lV2l0aG91dEV4dGVuc2lvbg"></a> `files.renameWithoutExtension` | `files.renameWithoutExtension(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：应用私有目录通常无需权限，公共路径遵循 Android 存储策略；线程：同步 I/O，大文件应放工作线程 | 生命周期：一次性方法自行完成，open 返回对象必须关闭；副作用：按成员读写、移动或删除文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof files.renameWithoutExtension);` |
| <a id="api-symbol-ZmlsZXMuc2RjYXJkUGF0aA"></a> `files.sdcardPath` | `files.sdcardPath` · 实现合同  | 属性访问；无调用参数 | 返回：String；参数校验、状态或底层异常原样传播 | 权限：应用私有目录通常无需权限，公共路径遵循 Android 存储策略；线程：同步 I/O，大文件应放工作线程 | 生命周期：一次性方法自行完成，open 返回对象必须关闭；副作用：按成员读写、移动或删除文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(files.sdcardPath);` |
| <a id="api-symbol-ZmlsZXMudG9GaWxl"></a> `files.toFile` | `files.toFile(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：File；参数校验、状态或底层异常原样传播 | 权限：应用私有目录通常无需权限，公共路径遵循 Android 存储策略；线程：同步 I/O，大文件应放工作线程 | 生命周期：一次性方法自行完成，open 返回对象必须关闭；副作用：按成员读写、移动或删除文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof files.toFile);` |
| <a id="api-symbol-ZmlsZXMud3JpdGU"></a> `files.write` | `files.write(path: String?, text: String, encoding: String? = PFiles.DEFAULT_ENCODING)` · 实现合同  | 参数：path: String?, text: String, encoding: String? = PFiles.DEFAULT_ENCODING；可选项与默认值按实现合同重载 | 返回：运行时值；参数校验、状态或底层异常原样传播 | 权限：应用私有目录通常无需权限，公共路径遵循 Android 存储策略；线程：同步 I/O，大文件应放工作线程 | 生命周期：一次性方法自行完成，open 返回对象必须关闭；副作用：按成员读写、移动或删除文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof files.write);` |
| <a id="api-symbol-ZmlsZXMud3JpdGVCeXRlcw"></a> `files.writeBytes` | `files.writeBytes(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：应用私有目录通常无需权限，公共路径遵循 Android 存储策略；线程：同步 I/O，大文件应放工作线程 | 生命周期：一次性方法自行完成，open 返回对象必须关闭；副作用：按成员读写、移动或删除文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof files.writeBytes);` |
| <a id="api-symbol-bW9kdWxlOmZpbGVz"></a> `module:files` | `files` 模块入口 · 实现合同  | 入口：全局或父模块属性；无构造参数 | 返回：模块对象；参数校验、状态或底层异常原样传播 | 权限：应用私有目录通常无需权限，公共路径遵循 Android 存储策略；线程：同步 I/O，大文件应放工作线程 | 生命周期：一次性方法自行完成，open 返回对象必须关闭；副作用：按成员读写、移动或删除文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof files);` |

### Rhino 2.0 表格读取示例

```js
console.log('Rhino 2.0 contract table: files');
```

<!-- api-contracts:end -->
