# Zip - 压缩与解压

`zip` 基于 [Zip4j](https://github.com/srikanth-lingala/zip4j) 同步创建、修改和解压 ZIP 文件。运行时同时注册 `zip` 与 `$zip`，两者引用同一个模块对象。

版本：**v6.7.0**

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

## zip.zipFile(filePath, destination?, options?)

把一个文件加入 ZIP 并返回 `ZipNativeObject`。第二个参数若为对象，则按 `options` 处理并使用源文件去除扩展名后的名称生成 `.zip` 目标；否则第二个参数是目标 ZIP 路径。

```js
let result = zip.zipFile('./report.txt', './report.zip', {
    compressionLevel: 'NORMAL',
});
console.log(result.getPath());
```

## zip.zipDir(directoryPath, destination?, options?)

把整个目录创建为 ZIP 并返回 `ZipNativeObject`。参数重载和默认目标名与 `zip.zipFile` 相同。该实现调用 Zip4j 的目录压缩接口，分卷压缩关闭。

## zip.zipFiles(filePaths, destination?, options?)

把可迭代的多个路径加入一个 ZIP 并返回 `ZipNativeObject`。

- `filePaths` 必须是可迭代对象，且每个源路径必须存在。
- 只有一个源路径且省略目标时，目标名取该项目名称并改为 `.zip`。
- 多个源路径位于同一父目录时，默认使用父目录名。
- 无法确定统一名称时，生成 `yyyyMMdd-HHmmss-XXXX.zip` 形式的名称。

非可迭代参数、缺失源文件或无效路径会抛出错误。

## zip.unzip(zipPath, destination?, options?)

解压整个 ZIP 并返回 `ZipNativeObject`。第二个参数若为对象，则作为 `options`，目标路径按空字符串交给 `files.nonNullPath` 解析；通常建议显式提供目标目录。

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
- `isExtractSymbolicLinks`：当前固定源码会读取该值，但没有写回 `UnzipParameters`，因此不会改变底层参数。
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
