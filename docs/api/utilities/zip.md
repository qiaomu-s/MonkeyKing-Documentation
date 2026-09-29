# Zip - 压缩与解压

`zip` 基于 [Zip4j 2.11.5](https://github.com/srikanth-lingala/zip4j) 同步创建、修改和解压 ZIP 文件。运行时同时注册 `zip` 与 `$zip`，两者引用同一个模块对象。外部类型参阅 Zip4j 官方 API：[`ZipFile`](https://javadoc.io/doc/net.lingala.zip4j/zip4j/2.11.5/net/lingala/zip4j/ZipFile.html)、[`FileHeader`](https://javadoc.io/doc/net.lingala.zip4j/zip4j/2.11.5/net/lingala/zip4j/model/FileHeader.html)、[`ZipParameters`](https://javadoc.io/doc/net.lingala.zip4j/zip4j/2.11.5/net/lingala/zip4j/model/ZipParameters.html) 和 [`UnzipParameters`](https://javadoc.io/doc/net.lingala.zip4j/zip4j/2.11.5/net/lingala/zip4j/model/UnzipParameters.html)。
本页所有 `js` 代码块均为 Monkey King **Rhino 2.0** 示例。

## zip

### zip(path)

等价于 `zip.open(path)`，返回 `ZipNativeObject`。

```js
let archive = zip(files.path('./backup.zip'));
archive.addFile(files.path('./config.json'));
console.log(archive.isValidZipFile());
```

## zip.open(path, options?)

打开或准备一个 ZIP 路径并返回 `ZipNativeObject`，本身不添加或提取文件。

- `path` {string} - ZIP 文件路径，不能为空
- `options` {Object} - 默认压缩与解压选项
- 返回 {ZipNativeObject}

路径按 `files.nonNullPath` 规则解析。空值、空字符串或非对象选项会抛出参数错误。

## zip.zipFile(filePath, destination, options?)

把一个文件加入 ZIP 并返回 `ZipNativeObject`。调用必须提供 **2 至 3 个参数**；一参调用会由参数守卫抛出异常。`destination` 槽必传：它是字符串时表示目标 ZIP 路径；它是 JavaScript 对象且总参数数为 2 时按 `options` 处理，并使用源文件去除扩展名后的名称生成 `.zip` 目标。

- `filePath` {string} - 必填源文件路径
- `destination` {string | Object} - 必填目标路径，或二参简写中的选项对象
- `options` {Object} - 可选压缩选项，仅用于三参形式
- 返回 {ZipNativeObject}
- 异常 - 参数数不是 2 至 3、源路径非法或底层 Zip4j 写入失败时抛出
- 权限 / 线程 / 生命周期 / 副作用 - 当前线程同步读取源文件并创建或修改目标 ZIP；需要目标路径写权限，返回对象不要求脚本级 `close()`

```js
let result = zip.zipFile('./report.txt', './report.zip', {
    compressionLevel: 'NORMAL',
});
console.log(result.getPath());
```

## zip.zipDir(directoryPath, destination, options?)

把整个目录创建为 ZIP 并返回 `ZipNativeObject`。调用必须提供 **2 至 3 个参数**；一参调用会由参数守卫抛出异常。`destination` 槽必传，并与 `zip.zipFile` 一样接受目标路径或二参形式的选项对象。该实现调用 Zip4j 的目录压缩接口，分卷压缩关闭。

- `directoryPath` {string} - 必填源目录路径
- `destination` {string | Object} - 必填目标 ZIP 路径，或二参简写中的选项对象
- `options` {Object} - 可选压缩选项
- 返回 {ZipNativeObject}
- 异常 / 权限 / 线程 / 生命周期 / 副作用 - 参数数不是 2 至 3 时抛出；当前线程同步遍历目录并写 ZIP，需要源目录读取与目标写入权限，不保留脚本级可关闭资源

## zip.zipFiles(filePaths, destination, options?)

把可迭代的多个路径加入一个 ZIP 并返回 `ZipNativeObject`。

- 调用必须提供 **2 至 3 个参数**；一参调用会由参数守卫抛出异常。
- `filePaths` 必须是可迭代对象，且每个源路径必须存在。
- `destination` 槽必传；字符串表示目标 ZIP，二参形式传对象则把它作为选项并计算默认目标名。
- 二参选项简写且只有一个源路径时，目标名取该项目名称并改为 `.zip`。
- 二参选项简写且多个源路径位于同一父目录时，默认使用父目录名；无法确定统一名称时生成 `yyyyMMdd-HHmmss-XXXX.zip`。

返回 `ZipNativeObject`。非可迭代参数、缺失源文件、无效路径或底层写入失败会同步抛出错误；方法读取所有源路径并写目标 ZIP，需要相应文件权限，没有脚本级资源关闭要求。

## zip.unzip(zipPath, destination, options?)

解压整个 ZIP 并返回 `ZipNativeObject`。调用必须提供 **2 至 3 个参数**；一参调用会由参数守卫抛出异常。`destination` 槽必传：字符串表示目标目录；二参形式传对象时把它作为 `options`，并把空字符串交给 `files.nonNullPath` 解析默认目录。为避免依赖当前路径，通常应显式提供目标目录。

- `zipPath` {string} - 必填 ZIP 路径
- `destination` {string | Object} - 必填目标目录，或二参简写中的选项对象
- `options` {Object} - 可选解压选项
- 返回 {ZipNativeObject}
- 异常 / 权限 / 线程 / 生命周期 / 副作用 - 参数数不是 2 至 3、密码或归档非法、目标不可写时抛出；当前线程同步读取归档并写文件，不保留脚本级可关闭资源

```js
zip.unzip('./backup.zip', './restored', {
    password: 'secret',
});
```

## 选项

这些选项可传给模块级方法，也可传给实例的 `addFile`、`addFiles`、`addFolder`。未说明的 Zip4j 行为沿用底层库默认值。

| 选项 | 默认值或行为 | 说明 |
| --- | --- | --- |
| `aesKeyStrength` | `256` | AES 密钥强度；接受 Zip4j 枚举、原始代码或 `128`、`192`、`256` |
| `aesVersion` | `2` | AES 版本；接受枚举、版本号或名称 |
| `compressionLevel` | `NORMAL` | Zip4j 压缩级别枚举、级别数值或名称 |
| `compressionMethod` | `DEFLATE` | Zip4j 压缩方法枚举、代码或名称 |
| `encryptionMethod` | `AES` | `NONE`、`ZIP_STANDARD`、`ZIP_STANDARD_VARIANT_STRONG`、`AES`，也接受兼容数字代码 |
| `password` | 未设置 | 为 `ZipFile` 设置密码，并自动启用文件加密 |
| `isEncryptFiles` / `encryptFiles` | Zip4j 默认值 | 是否加密条目 |
| `defaultFolderPath` | 未设置 | 默认目录路径 |
| `entryCRC` | 未设置 | 条目 CRC |
| `entrySize` | 未设置 | 条目大小 |
| `excludeFileFilter` | 未设置 | `ExcludeFileFilter` 或返回布尔值的 JavaScript 函数 |
| `fileComment` / `comment` | 未设置 | 条目注释 |
| `fileNameInZip` | 未设置 | ZIP 内的条目名称 |
| `isIncludeRootFolder` / `includeRootFolder` | Zip4j 默认值 | 是否包含根目录 |
| `isOverrideExistingFilesInZip` / `overrideExistingFilesInZip` | Zip4j 默认值 | 是否覆盖归档内同名条目 |
| `isReadHiddenFiles` / `readHiddenFiles` | Zip4j 默认值 | 是否读取隐藏文件 |
| `isReadHiddenFolders` / `readHiddenFolders` | Zip4j 默认值 | 是否读取隐藏目录 |
| `isUnixMode` / `unixMode` | Zip4j 默认值 | 是否使用 Unix 模式元数据 |
| `isWriteExtendedLocalFileHeader` / `writeExtendedLocalFileHeader` | Zip4j 默认值 | 是否写扩展本地文件头 |
| `lastModifiedFileTime` | 未设置 | 条目最后修改时间 |
| `rootFolderNameInZip` | 未设置 | ZIP 内根目录名 |
| `symbolicLinkAction` | `INCLUDE_LINKED_FILE_ONLY` | Zip4j 符号链接处理枚举 |

解压相关选项：

- `password`：设置解密密码。
- `isExtractSymbolicLinks`：当前实现合同会读取该值，但没有写回 `UnzipParameters`，因此不会改变底层参数。
- `isIgnoreDateTimeAttributes` / `ignoreDateTimeAttributes`：Zip4j 2.x 已不支持，传入时直接抛出异常。

枚举名称、数值或选项类型非法时会传播参数解析异常。

## ZipNativeObject

### 属性

| 属性 | 说明 |
| --- | --- |
| `name` | 创建对象的操作名，例如 `open`、`zipFile` 或 `unzip` |
| `path` | 解析后的 ZIP 绝对路径 |
| `zipFile` | 底层 Zip4j `ZipFile` |
| `options` | 原始 JavaScript 选项对象 |
| `zipParameters` | 由默认选项构造的 `ZipParameters` |
| `unzipParameters` | 由默认选项构造的 `UnzipParameters` |

这些属性只读。`String(archive)` 或 `archive.toString()` 返回操作名、路径和选项的可读摘要。

### 公共方法契约总表

以下成员自 **当前版本** 起公开。所有方法都同步执行；参数数量不符、路径或选项非法以及 Zip4j 操作失败会立即抛出异常。修改或提取方法需要相应文件读写权限。

| 签名与参数数 | 参数、合法值与返回 | 生命周期与副作用 |
| --- | --- | --- |
| archive.addFile(filePath, options?) — 1 至 2 个参数 | `filePath: string`；`options?: Object`；返回 `undefined`。 | 按 `files.nonNullPath` 解析文件并把它写入当前 ZIP。 |
| archive.addFiles(filePaths, options?) — 1 至 2 个参数 | `filePaths: Iterable<string>`；`options?: Object`；返回 `undefined`。非可迭代值抛出参数异常。 | 解析每个路径并把文件集合写入当前 ZIP。 |
| archive.addFolder(directoryPath, options?) — 1 至 2 个参数 | `directoryPath: string`；`options?: Object`；返回 `undefined`。 | 递归读取目录并写入当前 ZIP。 |
| archive.extractAll(destination, options?) — 1 至 2 个参数 | `destination: string`；`options?: Object`；返回 `undefined`。 | 创建或覆盖目标目录中的文件；归档、密码或目标无效时抛出。 |
| archive.extractFile(entryPath, destination, options?, newFileName?) — 2 至 4 个参数 | `entryPath: string`、`destination: string`；`options?: Object`；`newFileName?: string`；返回 `undefined`。提供新文件名时若不需要选项，应在第三位传 `null`。实现合同会先按 `files.nonNullPath` 解析 `entryPath` 与目标路径。 | 从当前 ZIP 写出一个条目，可按第四参数改名。 |
| archive.setPassword(password) — 1 个参数 | `password: string`；返回 `undefined`。 | 修改底层 `ZipFile` 后续读写使用的密码，不会重写既有条目。 |
| archive.getFileHeader(entryName) — 1 个参数 | `entryName: string`；返回 Zip4j `FileHeader`，未命中时可能为 `null`。 | 同步读取归档目录，不写文件。 |
| archive.getFileHeaders() — 0 个参数 | 返回 `Array<FileHeader>`。 | 同步读取全部条目元数据，不写文件。 |
| archive.isEncrypted() — 0 个参数 | 返回 `boolean`。 | 同步检查归档加密状态。 |
| archive.removeFile(entryName) — 1 个参数 | `entryName: string`；返回 `undefined`。 | 重写归档并删除指定条目。 |
| archive.isValidZipFile() — 0 个参数 | 返回 `boolean`。 | 同步读取归档结构；无效归档返回 `false` 或传播底层 I/O 错误。 |
| archive.getPath() — 0 个参数 | 返回绝对 ZIP 路径 `string`。 | 纯读取，不访问文件。 |
| archive.getZipFile() — 0 个参数 | 返回底层 Zip4j `ZipFile`。 | 暴露可变底层资源；调用方若直接关闭或修改它，必须自行管理生命周期，后续 `archive` 调用会看到同一状态。 |
| archive.toString() — 0 个参数 | 返回包含 operation、path 与 options 的 `string`。 | 纯读取，不再次访问 ZIP。 |

### archive.addFile(filePath, options?)

把单个文件加入归档，没有返回值。实例选项会为本次调用重新构造压缩参数。

### archive.addFiles(filePaths, options?)

把可迭代路径集合加入归档，没有返回值。非可迭代值会抛出参数错误。

### archive.addFolder(directoryPath, options?)

把目录加入归档，没有返回值。

### archive.extractAll(destination, options?)

把全部条目解压到目标目录，没有返回值。

### archive.extractFile(entryPath, destination, options?, newFileName?)

解压指定条目。第三个参数是解压选项，第四个参数可指定新的文件名；没有返回值。

### archive.setPassword(password)

设置后续读取或写入所用密码，没有返回值。

### archive.getFileHeader(entryName)

返回指定条目的 Zip4j `FileHeader`。条目不存在时沿用底层库返回或异常行为。

### archive.getFileHeaders()

返回全部 Zip4j `FileHeader` 组成的 JavaScript 数组。

### archive.isEncrypted()

返回归档是否包含加密内容。

### archive.removeFile(entryName)

从归档删除指定条目，没有返回值。

### archive.isValidZipFile()

返回当前路径是否为有效 ZIP 文件。

### archive.getPath()

返回 `path`。

### archive.getZipFile()

返回底层 Zip4j `ZipFile`，供高级互操作使用。

```js
let archive = $zip.open('./bundle.zip', { password: 'secret' });
archive.addFiles(['./a.txt', './b.txt']);

console.log(archive.getFileHeaders().length);
console.log(archive.isEncrypted());
```

## 文件副作用与错误处理

- 所有操作都是同步文件 I/O，可能创建或修改 ZIP、创建目录并写出解压文件。
- 一次性方法 `zipFile`、`zipDir`、`zipFiles`、`unzip` 执行失败时会尝试关闭底层 `ZipFile` 后重新抛出原异常。
- 成功返回的 `ZipNativeObject` 没有额外的脚本级 `close()`；需要底层生命周期控制时可通过 `getZipFile()` 使用 Zip4j API。
- 写入前应确认目标路径，尤其是解压到已存在目录时的同名文件处理。

<!-- api-contracts:start -->

## API 合同表

下表覆盖本页在当前公开 API 中的每个 canonical 公共成员。每行同时给出稳定锚点、实现合同、参数与返回合同、权限与线程、生命周期与副作用、版本，以及可独立执行的 Rhino 2.0 成员存在性或值读取示例。对象实例名（如 `db`、`cursor`、`storage`）沿用本页正文中的创建方式。

| API ID / 稳定锚点 | 签名或入口 | 参数、可选项与默认值 | 返回值与异常 | 权限与线程 | 生命周期与副作用 | 版本 | Rhino 2.0 示例 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| <a id="api-symbol-Y2FsbDp6aXA"></a> `call:zip` | `zip(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：目标路径必须可读写，公共路径遵循 Android 存储策略；线程：压缩与解压同步且可能耗时 | 生命周期：归档对象持有路径和选项，底层资源按使用场景管理；副作用：创建、覆盖或解压文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof zip);` |
| <a id="api-symbol-bW9kdWxlOnppcA"></a> `module:zip` | `zip` 模块入口 · 实现合同  | 入口：全局或父模块属性；无构造参数 | 返回：模块对象；初始化或目标成员异常原样传播 | 权限：目标路径必须可读写，公共路径遵循 Android 存储策略；线程：压缩与解压同步且可能耗时 | 生命周期：归档对象持有路径和选项，底层资源按使用场景管理；副作用：创建、覆盖或解压文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof zip);` |
| <a id="api-symbol-emlwLm9wZW4"></a> `zip.open` | `zip.open(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：目标路径必须可读写，公共路径遵循 Android 存储策略；线程：压缩与解压同步且可能耗时 | 生命周期：归档对象持有路径和选项，底层资源按使用场景管理；副作用：创建、覆盖或解压文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof zip.open);` |
| <a id="api-symbol-emlwLnJlc3VsdC5hZGRGaWxl"></a> `zip.result.addFile` | `archive.addFile(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：目标路径必须可读写，公共路径遵循 Android 存储策略；线程：压缩与解压同步且可能耗时 | 生命周期：归档对象持有路径和选项，底层资源按使用场景管理；副作用：创建、覆盖或解压文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof archive.addFile);` |
| <a id="api-symbol-emlwLnJlc3VsdC5hZGRGaWxlcw"></a> `zip.result.addFiles` | `archive.addFiles(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：目标路径必须可读写，公共路径遵循 Android 存储策略；线程：压缩与解压同步且可能耗时 | 生命周期：归档对象持有路径和选项，底层资源按使用场景管理；副作用：创建、覆盖或解压文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof archive.addFiles);` |
| <a id="api-symbol-emlwLnJlc3VsdC5hZGRGb2xkZXI"></a> `zip.result.addFolder` | `archive.addFolder(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：目标路径必须可读写，公共路径遵循 Android 存储策略；线程：压缩与解压同步且可能耗时 | 生命周期：归档对象持有路径和选项，底层资源按使用场景管理；副作用：创建、覆盖或解压文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof archive.addFolder);` |
| <a id="api-symbol-emlwLnJlc3VsdC5leHRyYWN0QWxs"></a> `zip.result.extractAll` | `archive.extractAll(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：目标路径必须可读写，公共路径遵循 Android 存储策略；线程：压缩与解压同步且可能耗时 | 生命周期：归档对象持有路径和选项，底层资源按使用场景管理；副作用：创建、覆盖或解压文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof archive.extractAll);` |
| <a id="api-symbol-emlwLnJlc3VsdC5leHRyYWN0RmlsZQ"></a> `zip.result.extractFile` | `archive.extractFile(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：目标路径必须可读写，公共路径遵循 Android 存储策略；线程：压缩与解压同步且可能耗时 | 生命周期：归档对象持有路径和选项，底层资源按使用场景管理；副作用：创建、覆盖或解压文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof archive.extractFile);` |
| <a id="api-symbol-emlwLnJlc3VsdC5nZXRGaWxlSGVhZGVy"></a> `zip.result.getFileHeader` | `archive.getFileHeader(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：目标路径必须可读写，公共路径遵循 Android 存储策略；线程：压缩与解压同步且可能耗时 | 生命周期：归档对象持有路径和选项，底层资源按使用场景管理；副作用：创建、覆盖或解压文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof archive.getFileHeader);` |
| <a id="api-symbol-emlwLnJlc3VsdC5nZXRGaWxlSGVhZGVycw"></a> `zip.result.getFileHeaders` | `archive.getFileHeaders(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：目标路径必须可读写，公共路径遵循 Android 存储策略；线程：压缩与解压同步且可能耗时 | 生命周期：归档对象持有路径和选项，底层资源按使用场景管理；副作用：创建、覆盖或解压文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof archive.getFileHeaders);` |
| <a id="api-symbol-emlwLnJlc3VsdC5nZXRQYXRo"></a> `zip.result.getPath` | `archive.getPath(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：目标路径必须可读写，公共路径遵循 Android 存储策略；线程：压缩与解压同步且可能耗时 | 生命周期：归档对象持有路径和选项，底层资源按使用场景管理；副作用：创建、覆盖或解压文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof archive.getPath);` |
| <a id="api-symbol-emlwLnJlc3VsdC5nZXRaaXBGaWxl"></a> `zip.result.getZipFile` | `archive.getZipFile(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：目标路径必须可读写，公共路径遵循 Android 存储策略；线程：压缩与解压同步且可能耗时 | 生命周期：归档对象持有路径和选项，底层资源按使用场景管理；副作用：创建、覆盖或解压文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof archive.getZipFile);` |
| <a id="api-symbol-emlwLnJlc3VsdC5pc0VuY3J5cHRlZA"></a> `zip.result.isEncrypted` | `archive.isEncrypted(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：目标路径必须可读写，公共路径遵循 Android 存储策略；线程：压缩与解压同步且可能耗时 | 生命周期：归档对象持有路径和选项，底层资源按使用场景管理；副作用：创建、覆盖或解压文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof archive.isEncrypted);` |
| <a id="api-symbol-emlwLnJlc3VsdC5pc1ZhbGlkWmlwRmlsZQ"></a> `zip.result.isValidZipFile` | `archive.isValidZipFile(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：目标路径必须可读写，公共路径遵循 Android 存储策略；线程：压缩与解压同步且可能耗时 | 生命周期：归档对象持有路径和选项，底层资源按使用场景管理；副作用：创建、覆盖或解压文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof archive.isValidZipFile);` |
| <a id="api-symbol-emlwLnJlc3VsdC5uYW1l"></a> `zip.result.name` | `archive.name` · 实现合同  | 属性访问；无调用参数 | 返回：属性值；参数校验、状态或底层异常原样传播 | 权限：目标路径必须可读写，公共路径遵循 Android 存储策略；线程：压缩与解压同步且可能耗时 | 生命周期：归档对象持有路径和选项，底层资源按使用场景管理；副作用：创建、覆盖或解压文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(archive.name);` |
| <a id="api-symbol-emlwLnJlc3VsdC5vcHRpb25z"></a> `zip.result.options` | `archive.options` · 实现合同  | 属性访问；无调用参数 | 返回：UnzipParameters；参数校验、状态或底层异常原样传播 | 权限：目标路径必须可读写，公共路径遵循 Android 存储策略；线程：压缩与解压同步且可能耗时 | 生命周期：归档对象持有路径和选项，底层资源按使用场景管理；副作用：创建、覆盖或解压文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(archive.options);` |
| <a id="api-symbol-emlwLnJlc3VsdC5wYXRo"></a> `zip.result.path` | `archive.path` · 实现合同  | 属性访问；无调用参数 | 返回：属性值；参数校验、状态或底层异常原样传播 | 权限：目标路径必须可读写，公共路径遵循 Android 存储策略；线程：压缩与解压同步且可能耗时 | 生命周期：归档对象持有路径和选项，底层资源按使用场景管理；副作用：创建、覆盖或解压文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(archive.path);` |
| <a id="api-symbol-emlwLnJlc3VsdC5yZW1vdmVGaWxl"></a> `zip.result.removeFile` | `archive.removeFile(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：目标路径必须可读写，公共路径遵循 Android 存储策略；线程：压缩与解压同步且可能耗时 | 生命周期：归档对象持有路径和选项，底层资源按使用场景管理；副作用：创建、覆盖或解压文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof archive.removeFile);` |
| <a id="api-symbol-emlwLnJlc3VsdC5zZXRQYXNzd29yZA"></a> `zip.result.setPassword` | `archive.setPassword(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：目标路径必须可读写，公共路径遵循 Android 存储策略；线程：压缩与解压同步且可能耗时 | 生命周期：归档对象持有路径和选项，底层资源按使用场景管理；副作用：创建、覆盖或解压文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof archive.setPassword);` |
| <a id="api-symbol-emlwLnJlc3VsdC50b1N0cmluZw"></a> `zip.result.toString` | `archive.toString()` · 实现合同  | 参数：无参数；可选项与默认值见本页说明或页面约束 | 返回：String；参数校验、状态或底层异常原样传播 | 权限：目标路径必须可读写，公共路径遵循 Android 存储策略；线程：压缩与解压同步且可能耗时 | 生命周期：归档对象持有路径和选项，底层资源按使用场景管理；副作用：创建、覆盖或解压文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof archive.toString);` |
| <a id="api-symbol-emlwLnJlc3VsdC51bnppcFBhcmFtZXRlcnM"></a> `zip.result.unzipParameters` | `archive.unzipParameters` · 实现合同  | 属性访问；无调用参数 | 返回：UnzipParameters；参数校验、状态或底层异常原样传播 | 权限：目标路径必须可读写，公共路径遵循 Android 存储策略；线程：压缩与解压同步且可能耗时 | 生命周期：归档对象持有路径和选项，底层资源按使用场景管理；副作用：创建、覆盖或解压文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(archive.unzipParameters);` |
| <a id="api-symbol-emlwLnJlc3VsdC56aXBGaWxl"></a> `zip.result.zipFile` | `archive.zipFile` · 实现合同  | 属性访问；无调用参数 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：目标路径必须可读写，公共路径遵循 Android 存储策略；线程：压缩与解压同步且可能耗时 | 生命周期：归档对象持有路径和选项，底层资源按使用场景管理；副作用：创建、覆盖或解压文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(archive.zipFile);` |
| <a id="api-symbol-emlwLnJlc3VsdC56aXBQYXJhbWV0ZXJz"></a> `zip.result.zipParameters` | `archive.zipParameters` · 实现合同  | 属性访问；无调用参数 | 返回：属性值；参数校验、状态或底层异常原样传播 | 权限：目标路径必须可读写，公共路径遵循 Android 存储策略；线程：压缩与解压同步且可能耗时 | 生命周期：归档对象持有路径和选项，底层资源按使用场景管理；副作用：创建、覆盖或解压文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(archive.zipParameters);` |
| <a id="api-symbol-emlwLnVuemlw"></a> `zip.unzip` | `zip.unzip(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：目标路径必须可读写，公共路径遵循 Android 存储策略；线程：压缩与解压同步且可能耗时 | 生命周期：归档对象持有路径和选项，底层资源按使用场景管理；副作用：创建、覆盖或解压文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof zip.unzip);` |
| <a id="api-symbol-emlwLnppcERpcg"></a> `zip.zipDir` | `zip.zipDir(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：目标路径必须可读写，公共路径遵循 Android 存储策略；线程：压缩与解压同步且可能耗时 | 生命周期：归档对象持有路径和选项，底层资源按使用场景管理；副作用：创建、覆盖或解压文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof zip.zipDir);` |
| <a id="api-symbol-emlwLnppcEZpbGU"></a> `zip.zipFile` | `zip.zipFile(...args)` · 实现合同  | 参数：2 至 3 个参数；可选项与默认值见本页说明或页面约束 | 返回：ZipNativeObject；参数校验、状态或底层异常原样传播 | 权限：目标路径必须可读写，公共路径遵循 Android 存储策略；线程：压缩与解压同步且可能耗时 | 生命周期：归档对象持有路径和选项，底层资源按使用场景管理；副作用：创建、覆盖或解压文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof zip.zipFile);` |
| <a id="api-symbol-emlwLnppcEZpbGVz"></a> `zip.zipFiles` | `zip.zipFiles(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：目标路径必须可读写，公共路径遵循 Android 存储策略；线程：压缩与解压同步且可能耗时 | 生命周期：归档对象持有路径和选项，底层资源按使用场景管理；副作用：创建、覆盖或解压文件 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof zip.zipFiles);` |

### Rhino 2.0 表格读取示例

```js
console.log('Rhino 2.0 contract table: zip');
```

<!-- api-contracts:end -->
