# SQLite - 数据库

`sqlite` 打开 Android SQLite 数据库，并返回对 `SQLiteDatabase` 的脚本友好封装。运行时同时注册 `sqlite` 与 `$sqlite`，两者引用同一个模块对象。

版本：**v6.6.0**

本页所有 `js` 代码块均为 Monkey King **Rhino 2.0** 示例。

相关 Android 类型：[SQLiteDatabase](https://developer.android.com/reference/android/database/sqlite/SQLiteDatabase)、[SQLiteOpenHelper](https://developer.android.com/reference/android/database/sqlite/SQLiteOpenHelper)、[SQLiteStatement](https://developer.android.com/reference/android/database/sqlite/SQLiteStatement)、[SQLiteTransactionListener](https://developer.android.com/reference/android/database/sqlite/SQLiteTransactionListener)、[Cursor](https://developer.android.com/reference/android/database/Cursor)、[CancellationSignal](https://developer.android.com/reference/android/os/CancellationSignal) 和 [ContentValues](https://developer.android.com/reference/android/content/ContentValues)。

## sqlite

### sqlite(path, options?, callback?)

等价于 `sqlite.open(path, options, callback)`。

```js
let db = sqlite(files.path('./example.db'));
db.execSQL('CREATE TABLE IF NOT EXISTS note (id INTEGER PRIMARY KEY, body TEXT)');
db.insert('note', { body: 'hello' });

let rows = db.rawQuery('SELECT id, body FROM note', []).all();
console.log(JSON.stringify(rows));

db.close();
```

## sqlite.open(path, options?, callback?)

- `path` {string} - 数据库文件路径；相对路径按 `files` 模块规则解析
- `options` {Object} - 打开选项
- `callback` {DatabaseCallback} - 生命周期回调
- 返回 {Database}

选项：

| 选项 | 默认值 | 说明 |
| --- | --- | --- |
| `version` | `1` | 数据库版本，传给 `SQLiteOpenHelper` |
| `readOnly` | `false` | 为真时使用 Android 的 `getReadableDatabase()`；为假时使用 `getWritableDatabase()` |

`readOnly` 名称用于兼容脚本接口。Android 的 `getReadableDatabase()` 在条件允许时仍可能返回可写数据库，因此它不是强制只读沙箱。

空路径、非普通对象的 `options`、无法转换为 `DatabaseCallback` 的 `callback` 都会抛出参数错误。打开数据库和生命周期回调都在当前线程同步执行。

### DatabaseCallback

回调对象可实现以下方法：

- `onCreate(database)`：首次创建数据库时调用。
- `onOpen(database)`：每次打开后调用。
- `onUpgrade(database, oldVersion, newVersion)`：版本增加时调用。
- `onCorruption(sqliteDatabase)`：Android 报告数据库损坏时调用；参数是底层 `SQLiteDatabase`。

```js
let db = sqlite.open('./cache.db', { version: 2 }, {
    onCreate(database) {
        database.execSQL('CREATE TABLE cache (key TEXT PRIMARY KEY, value TEXT)');
    },
    onOpen(database) {
        console.log(database.getPath());
    },
    onUpgrade(database, oldVersion, newVersion) {
        console.log(oldVersion + ' -> ' + newVersion);
    },
    onCorruption(nativeDatabase) {
        console.error('database corrupted: ' + nativeDatabase.getPath());
    },
});
```

## Database

`Database` 继承 `SQLiteOpenHelper` 并实现 `Closeable`。创建后会登记到脚本运行时的 closeable manager；脚本结束时运行时可统一清理，主动使用完毕仍建议调用 `db.close()`。

### 写入值转换

`insert`、`replace`、`update` 系列方法把 JavaScript 对象转换为 `ContentValues`。支持：

- `null` 与 `undefined`，写入 SQL `NULL`
- 整数与浮点数
- `boolean`
- `string`
- Java `byte[]`

其他值类型会抛出 `Unsupported data type for key`。表名、条件与 SQL 文本不会自动转义，应使用参数绑定并避免拼接不可信输入。

### 项目包装成员契约

下列 `Database` 成员由 Monkey King 在 **v6.6.0** 中包装底层 `SQLiteDatabase`，不是 `SQLiteOpenHelper` 的直接继承成员。除 `transaction` 对回调异常的特殊处理外，Android 参数校验、数据库状态和 SQL 异常会同步传播。数据库文件需要应用对目标路径具有读写权限；所有方法都在调用线程执行，返回的 `CursorWrapper` 必须按下文规则关闭。

| 成员族 | 参数与合法值 | 返回、异常与副作用 |
| --- | --- | --- |
| `insert` / `insertOrThrow` / `insertWithOnConflict` / `replace` / `replaceOrThrow` | `table`、`nullColumnHack` 为 `string` 或 `null`；`values` 为可转换的 JS 对象；`conflictAlgorithm` 使用 Android `SQLiteDatabase.CONFLICT_` 常量：`NONE`、`ROLLBACK`、`ABORT`、`FAIL`、`IGNORE` 或 `REPLACE`。 | 返回 row ID `number`；非 Throw 版本可返回 Android 失败值，Throw 版本和非法数据会抛出。修改数据库。 |
| `update` / `updateWithOnConflict` | `table: string`、`values: Object`、`whereClause` 为 `string` 或 `null`、`whereArgs` 为 `string[]` 或 `null`，冲突版本另收上述算法整数。 | 返回受影响行数；修改数据库。绑定值只替换 `?`，表名和 SQL 片段不会转义。 |
| `delete` | `table: string`、`whereClause` 为 `string` 或 `null`、`whereArgs` 为 `string[]` 或 `null`。 | 返回受影响行数；修改数据库。 |
| `query` / `queryWithFactory` | `columns`、`selectionArgs` 为 `string[]` 或 `null`；`selection`、`groupBy`、`having`、`orderBy`、`limit` 为 `string` 或 `null`；高级重载接受 Android `CursorFactory`、`CancellationSignal` 与 `distinct: boolean`。 | 返回 `CursorWrapper`；同步执行查询，取消或 SQL 错误传播。调用方关闭游标。 |
| `rawQuery` / `rawQueryWithFactory` | `sql: string`、`selectionArgs` 为 `string[]` 或 `null`；高级重载接受 `CursorFactory`、`editTable` 为 `string` 或 `null`、`CancellationSignal`。 | 返回 `CursorWrapper`；同步执行查询并读取数据库，SQL 与取消异常传播。 |
| `execSQL` | `sql: string`；可选 `bindArgs: Object[]`。 | 返回 `undefined`；同步执行非查询 SQL 并可能修改 schema 或数据。 |
| `compileStatement` / `validateSql` | SQL 字符串；`validateSql` 另收可空 `CancellationSignal`。 | 分别返回 Android `SQLiteStatement` 或 `undefined`；语法、状态与取消异常传播。返回语句的生命周期按 Android API 管理。 |
| 事务基础成员 | 无参方法，或 `listener: SQLiteTransactionListener`、`sleepAfterYieldDelay: number`。 | `inTransaction` / `yieldIfContendedSafely` 返回 `boolean`，其余返回 `undefined`；会改变当前连接的事务状态。必须配对结束事务。 |
| `transaction(callback, exclusive = true)` | `callback(transaction)` 必填；`exclusive: boolean` 默认 `true`。 | 同步返回 `EventEmitter` 并发出 `begin`、`commit`/`rollback`、`end`。callback 抛出的异常会作为 `error` 事件发出，不再向调用点抛出；事务随后回滚并结束。 |
| 配置、状态与引用成员 | 数值配置必须满足 Android `SQLiteDatabase` 的合法范围；`setLocale` 接受 `java.util.Locale`。 | getter 返回底层值；setter 会立即改变连接配置。`acquireReference` / `releaseReference` 必须配对，错误释放会传播底层异常。 |
| `getTypeAdapter()` | 无参数。 | 返回 Monkey King 当前 `TypeAdapter`，主要供高级互操作；不转移所有权。 |
| `close()` | 无参数。 | 关闭底层数据库并从脚本运行时清理列表移除；之后继续使用会传播已关闭异常。 |

### CRUD

| 方法 | 返回值 | 说明 |
| --- | --- | --- |
| `db.insert(table, values)` | `number` | 插入一行，`nullColumnHack` 使用 `null` |
| `db.insert(table, nullColumnHack, values)` | `number` | 插入一行，返回 row ID 或 Android 的失败值 |
| `db.insertOrThrow(table, nullColumnHack, values)` | `number` | 插入失败时抛出异常 |
| `db.insertWithOnConflict(table, nullColumnHack, values, conflictAlgorithm)` | `number` | 指定冲突算法插入 |
| `db.replace(table, nullColumnHack, values)` | `number` | 替换一行 |
| `db.replaceOrThrow(table, nullColumnHack, values)` | `number` | 替换失败时抛出异常 |
| `db.update(table, values, whereClause, whereArgs)` | `number` | 返回受影响行数 |
| `db.updateWithOnConflict(table, values, whereClause, whereArgs, conflictAlgorithm)` | `number` | 指定冲突算法更新 |
| `db.delete(table, whereClause, whereArgs)` | `number` | 返回删除行数 |

### 查询

所有查询方法都把 Android `Cursor` 包装为 `CursorWrapper`：

- `db.query(table, columns, selection, selectionArgs, groupBy, having, orderBy)`
- `db.query(table, columns, selection, selectionArgs, groupBy, having, orderBy, limit)`
- `db.query(distinct, table, columns, selection, selectionArgs, groupBy, having, orderBy, limit)`
- `db.query(distinct, table, columns, selection, selectionArgs, groupBy, having, orderBy, limit, cancellationSignal)`
- `db.queryWithFactory(cursorFactory, distinct, table, columns, selection, selectionArgs, groupBy, having, orderBy, limit)`
- `db.queryWithFactory(cursorFactory, distinct, table, columns, selection, selectionArgs, groupBy, having, orderBy, limit, cancellationSignal)`
- `db.rawQuery(sql, selectionArgs)`
- `db.rawQuery(sql, selectionArgs, cancellationSignal)`
- `db.rawQueryWithFactory(cursorFactory, sql, selectionArgs, editTable)`
- `db.rawQueryWithFactory(cursorFactory, sql, selectionArgs, editTable, cancellationSignal)`

`cursorFactory`、`cancellationSignal` 等高级参数直接使用 Android 类型。

### SQL 与语句

- `db.execSQL(sql)`
- `db.execSQL(sql, bindArgs)`
- `db.compileStatement(sql)`：返回 Android `SQLiteStatement`
- `db.validateSql(sql, cancellationSignal)`

### 事务

- `db.beginTransaction()`
- `db.beginTransactionNonExclusive()`
- `db.beginTransactionWithListener(listener)`
- `db.beginTransactionWithListenerNonExclusive(listener)`
- `db.setTransactionSuccessful()`
- `db.endTransaction()`
- `db.inTransaction()`
- `db.yieldIfContendedSafely()`
- `db.yieldIfContendedSafely(sleepAfterYieldDelay)`

监听器参数使用 Android `SQLiteTransactionListener`。

`db.transaction(callback, exclusive = true)` 是组合式事务辅助方法，返回 `EventEmitter`。它会依次发出 `begin`、`commit` 或 `rollback`、`end`；回调抛错时还会发出 `error`，并在结束时回滚未标记成功的事务。

```js
let events = db.transaction(function (transaction) {
    db.insert('note', { body: 'inside transaction' });
}, false);

events.on('error', function (error) {
    console.error(error);
});
```

### 配置与状态

- `db.enableWriteAheadLogging()` / `db.disableWriteAheadLogging()` / `db.isWriteAheadLoggingEnabled()`
- `db.setForeignKeyConstraintsEnabled(enable)`
- `db.getVersion()` / `db.setVersion(version)` / `db.needUpgrade(newVersion)`
- `db.getMaximumSize()` / `db.setMaximumSize(bytes)`
- `db.getPageSize()` / `db.setPageSize(bytes)`
- `db.setLocale(locale)`
- `db.setMaxSqlCacheSize(cacheSize)`
- `db.getPath()` / `db.getAttachedDbs()`
- `db.isDatabaseIntegrityOk()`
- `db.isDbLockedByCurrentThread()`
- `db.isOpen()` / `db.isReadOnly()`
- `db.acquireReference()` / `db.releaseReference()`
- `db.getTypeAdapter()`：返回当前脚本值适配器，主要用于高级互操作
- `db.close()`：关闭底层数据库并从运行时清理列表移除

### External: SQLiteOpenHelper 继承成员

`Database` 继承自 Android `SQLiteOpenHelper`。以下公共成员不是 Monkey King 新增包装，而是 **external API**；其可用性、API level、线程约束、异常和副作用以官方 [`SQLiteOpenHelper`](https://developer.android.com/reference/android/database/sqlite/SQLiteOpenHelper) 文档为准：

- `db.getDatabaseName()`
- `db.getReadableDatabase()`
- `db.getWritableDatabase()`
- `db.onConfigure(database)`
- `db.onDowngrade(database, oldVersion, newVersion)`
- `db.setLookasideConfig(slotSize, slotCount)`
- `db.setOpenParams(openParams)`
- `db.setWriteAheadLoggingEnabled(enabled)`

本类覆盖的 `close()`、`onCreate()`、`onOpen()`、`onUpgrade()` 已在本页生命周期与 `DatabaseCallback` 契约中说明，不按 external 成员处理。直接调用 `getReadableDatabase()` / `getWritableDatabase()` 仍会触发同步打开和回调；不要在 UI 线程做耗时迁移。

## CursorWrapper

`CursorWrapper` 委托实现 Android `Cursor` 的全部标准方法，并增加以下脚本辅助方法：

### External: Cursor 委托成员

除本页列出的六个脚本辅助方法外，`CursorWrapper` 的移动、列查询、计数、通知、extras、`close()` / `isClosed()` 等公共成员均直接委托给 **external** Android [`Cursor`](https://developer.android.com/reference/android/database/Cursor)。这些成员的参数、返回、API level、异常、线程和生命周期以官方文档为准；Monkey King 不改变其行为。

### cursor.get(index)

按列索引读取当前行。SQL `NULL` 返回 `null`，整数返回 `number`，浮点返回 `number`，文本返回 `string`，BLOB 返回 Java `byte[]`。

### cursor.getByColumn(name)

按列名读取当前行；列不存在时由 `getColumnIndexOrThrow` 抛出异常。

### cursor.pick()

把当前行转换为 JavaScript 对象，键为全部列名。此方法不会移动游标。

### cursor.next()

移动到下一行并返回 `pick()` 的对象；没有下一行时返回 `null`。此方法不会自动关闭游标。

### cursor.all(close = true)

从当前位置之后开始遍历剩余行，返回对象数组。默认遍历后关闭游标；传入假值可保持打开。

### cursor.single()

读取下一行并立即关闭游标；没有下一行时返回 `null`。

```js
let cursor = db.rawQuery('SELECT id, body FROM note ORDER BY id', []);
let first = cursor.next();
console.log(first && first.body);
cursor.close();
```

## 线程与生命周期

- 打开、查询和写入接口均为同步调用；不要在 UI 线程执行大型迁移或长查询。
- `CursorWrapper.next()` 与 `pick()` 不会自动关闭游标，调用方负责 `close()`。
- `all()` 默认关闭，`single()` 总会关闭。
- `Database.close()` 之后继续调用数据库方法会传播 Android 的已关闭状态异常。
