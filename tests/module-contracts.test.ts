import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createMarkdownRenderer } from 'vitepress'

function markdown(path: string): string {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

describe('Monkey King 6.7.0 source-backed module contracts', () => {
  test('documents the four public util prototype aliases and null object semantics', () => {
    const source = markdown('docs/api/utilities/util.md')

    for (const signature of [
      'util.class(value)',
      'util.getClass(value)',
      'util.className(value)',
      'util.getClassName(value)',
    ]) {
      expect(source).toContain(signature)
    }

    expect(source).toContain('java.lang.Class')
    expect(source).toMatch(/value.*(?:null|空值).*抛出/s)
    expect(source).toContain('console.log(util.isObject(null)); // false')
    expect(source).not.toContain('`null` 也符合 `typeof` 的对象语义')
  })

  test('documents every MIME method overload and inherited public field', () => {
    const source = markdown('docs/api/utilities/mime.md')
    const signatures = [
      'mime.addKnownMimeType(mimeType)',
      'mime.addKnownMimeType(mimeTypeString)',
      'mime.getKnownMimeTypes()',
      'mime.registerMimeDetector(className)',
      'mime.getExtension(file)',
      'mime.getExtension(fileName)',
      'mime.getFirstMimeType(mimeTypes)',
      'mime.getType(mimeType)',
      'mime.getMimeQuality(mimeType)',
      'mime.getMimeDetector(name)',
      'mime.getMimeTypes(bytes)',
      'mime.getMimeTypes(bytes, unknownMimeType)',
      'mime.getMimeTypes(file)',
      'mime.getMimeTypes(file, unknownMimeType)',
      'mime.getMimeTypes(inputStream)',
      'mime.getMimeTypes(inputStream, unknownMimeType)',
      'mime.getMimeTypes(fileName)',
      'mime.getMimeTypes(fileName, unknownMimeType)',
      'mime.getMimeTypes(url)',
      'mime.getMimeTypes(url, unknownMimeType)',
      'mime.getNativeOrder()',
      'mime.getPreferredMimeType(accept, canProvide)',
      'mime.getMostSpecificMimeType(mimeTypes)',
      'mime.getSubtype(mimeType)',
      'mime.isMimeTypeKnown(mimeType)',
      'mime.isMimeTypeKnown(mimeTypeString)',
      'mime.isTextMimeType(mimeType)',
      'mime.unregisterMimeDetector(detector)',
      'mime.unregisterMimeDetector(name)',
      'mime.getQuality(mimeType)',
      'mime.getInputStreamForURL(url)',
    ]

    for (const signature of signatures) expect(source).toContain(signature)
    expect(source).toContain('mime.DIRECTORY_MIME_TYPE')
    expect(source).toContain('mime.UNKNOWN_MIME_TYPE')
    expect(source).toContain('https://developer.android.com/reference/android/webkit/MimeTypeMap')
    expect(source).toContain('https://docs.oracle.com/en/java/javase/21/docs/api/')
    expect(source).toContain('mime-util/2.1.3')
  })

  test('keeps the 2,540-member MIME constant appendix deterministic and indexable', () => {
    const source = markdown('docs/api/utilities/mime.md')
    const rows = [...source.matchAll(
      /^\| <a id="(mime-constant-[a-z0-9-]+)"><\/a> \| `mime\.([A-Z][A-Z0-9_]*)` \| `([^`]+)` \|$/gm,
    )]

    expect(rows).toHaveLength(2540)
    expect(new Set(rows.map((row) => row[1])).size).toBe(rows.length)
    expect(new Set(rows.map((row) => row[2])).size).toBe(rows.length)

    for (const [, anchor, name] of rows) {
      expect(anchor).toBe(
        `mime-constant-${name.toLowerCase().replaceAll('_', '-')}`,
      )
    }

    const manifest = rows.map((row) => `${row[2]}=${row[3]}\n`).join('')
    expect(sha256(manifest)).toBe(
      'f801cc55e6762c00b6fa0e2dc9a9b0a3902aa32ac46a8948f7145102f70eff5a',
    )
  })

  test('renders the complete MIME constant appendix as one readable table', async () => {
    const source = markdown('docs/api/utilities/mime.md')
    const startMarker = '<!-- mime-constant-manifest:start -->'
    const endMarker = '<!-- mime-constant-manifest:end -->'
    const start = source.indexOf(startMarker)
    const end = source.indexOf(endMarker)

    expect(start).toBeGreaterThanOrEqual(0)
    expect(end).toBeGreaterThan(start)

    const appendix = source.slice(start + startMarker.length, end)
    const renderer = await createMarkdownRenderer(process.cwd())
    const rendered = renderer.render(appendix)
    const tables = [...rendered.matchAll(/<table\b/g)]
    const tbody = rendered.match(/<tbody>([\s\S]*?)<\/tbody>/)

    expect(tables).toHaveLength(1)
    expect(rendered).toContain('<th>稳定锚点</th>')
    expect(rendered).toContain('<th>公开成员</th>')
    expect(rendered).toContain('<th>常量值</th>')
    expect(tbody).not.toBeNull()
    expect([...(tbody?.[1] ?? '').matchAll(/<tr>/g)]).toHaveLength(2540)
    expect([...rendered.matchAll(/<a id="mime-constant-[a-z0-9-]+"><\/a>/g)])
      .toHaveLength(2540)
  })

  test('states the required second argument and 2-to-3 arity for Zip one-shot methods', () => {
    const source = markdown('docs/api/utilities/zip.md')

    for (const method of ['zipFile', 'zipDir', 'zipFiles', 'unzip']) {
      expect(source).toMatch(
        new RegExp(`zip\\.${method}\\([^\\n]+\\)[\\s\\S]{0,800}2 至 3 个参数`),
      )
      expect(source).toMatch(
        new RegExp(`zip\\.${method}\\([^\\n]+\\)[\\s\\S]{0,800}一参调用.*抛出`),
      )
    }

    expect(source).toContain('zip.zipFile(filePath, destination, options?)')
    expect(source).toContain('zip.zipDir(directoryPath, destination, options?)')
    expect(source).toContain('zip.zipFiles(filePaths, destination, options?)')
    expect(source).toContain('zip.unzip(zipPath, destination, options?)')
    expect(source).not.toMatch(/zip\.(?:zipFile|zipDir|zipFiles|unzip)\([^\n]*destination\?/)
  })

  test('records ZipNativeObject arity, external types, and resource effects', () => {
    const source = markdown('docs/api/utilities/zip.md')

    for (const signature of [
      'archive.addFile(filePath, options?) — 1 至 2 个参数',
      'archive.addFiles(filePaths, options?) — 1 至 2 个参数',
      'archive.addFolder(directoryPath, options?) — 1 至 2 个参数',
      'archive.extractAll(destination, options?) — 1 至 2 个参数',
      'archive.extractFile(entryPath, destination, options?, newFileName?) — 2 至 4 个参数',
      'archive.setPassword(password) — 1 个参数',
      'archive.getFileHeader(entryName) — 1 个参数',
      'archive.getFileHeaders() — 0 个参数',
      'archive.isEncrypted() — 0 个参数',
      'archive.removeFile(entryName) — 1 个参数',
      'archive.isValidZipFile() — 0 个参数',
      'archive.getPath() — 0 个参数',
      'archive.getZipFile() — 0 个参数',
    ]) {
      expect(source).toContain(signature)
    }

    expect(source).toContain('/net/lingala/zip4j/ZipFile.html')
    expect(source).toContain('/net/lingala/zip4j/model/FileHeader.html')
    expect(source).toMatch(/getZipFile\(\).*底层资源.*调用方/s)
  })

  test('documents Pinyin constants as enum objects and rejects ordinary JS numbers', () => {
    const source = markdown('docs/api/utilities/pinyin.md')

    expect(source).toContain('PinyinStyle 枚举对象')
    expect(source).toContain('PinyinMode 枚举对象')
    expect(source).toContain("style: 'TONE2'")
    expect(source).toContain("mode: 'SURNAME'")
    expect(source).toMatch(/普通 JavaScript 数字.*(?:0|1).*(?:不|不能).*合法/s)
    expect(source).not.toContain('风格常量、对应整数或枚举名称字符串')
    expect(source).not.toContain('模式常量、对应整数或枚举名称字符串')
  })

  test('records the fixed-source Pinyin stub contracts without inventing behavior', () => {
    const source = markdown('docs/api/utilities/pinyin.md')

    expect(source).toMatch(/pinyin\.compare\(left, right\?\)[\s\S]{0,500}1 至 2 个参数/)
    expect(source).toMatch(/pinyin\.compare\(left, right\?\)[\s\S]{0,500}空字符串/)
    expect(source).toMatch(/pinyin\.compact\(value, options\?\)[\s\S]{0,500}1 至 2 个参数/)
    expect(source).toMatch(/pinyin\.compact\(value, options\?\)[\s\S]{0,500}空字符串/)
  })

  test('marks inherited SQLiteOpenHelper members as external API', () => {
    const source = markdown('docs/api/system/sqlite.md')

    expect(source).toContain('External: SQLiteOpenHelper')
    expect(source).toContain(
      'https://developer.android.com/reference/android/database/sqlite/SQLiteOpenHelper',
    )
    for (const member of [
      'getDatabaseName()',
      'getReadableDatabase()',
      'getWritableDatabase()',
      'setLookasideConfig(',
      'setOpenParams(',
      'setWriteAheadLoggingEnabled(',
    ]) {
      expect(source).toContain(member)
    }
  })

  test('distinguishes Database wrappers and delegated Cursor external API', () => {
    const source = markdown('docs/api/system/sqlite.md')

    expect(source).toContain('项目包装成员契约')
    expect(source).toContain('External: Cursor 委托成员')
    expect(source).toContain('SQLiteDatabase.CONFLICT_')
    expect(source).toContain('transaction(callback, exclusive = true)')
    expect(source).toMatch(/callback.*异常.*error.*不再向调用点抛出/s)
    expect(source).toMatch(/cursor\.all\(close = true\).*默认.*关闭/s)
  })

  test('covers every project-owned public member of the twelve new module pages', () => {
    const requiredMembers: Readonly<Record<string, readonly string[]>> = {
      'docs/api/utilities/util.md': [
        'util.class(', 'util.getClass(', 'util.className(', 'util.getClassName(',
        'util.isArray(', 'util.isBoolean(', 'util.isNull(',
        'util.isNullOrUndefined(', 'util.isNumber(', 'util.isString(',
        'util.isSymbol(', 'util.isUndefined(', 'util.isRegExp(',
        'util.isObject(', 'util.isDate(', 'util.isError(', 'util.isFunction(',
        'util.isBigInt(', 'util.isJavaObject(', 'util.isJavaArray(',
        'util.isInteger(', 'util.isPrimitive(', 'util.isReference(',
        'util.isEmptyObject(', 'util.unwrapJavaObject(', 'util.extend(',
        'util.format(', 'util.deprecate(', 'util.debuglog(', 'util.log(',
        'util.checkStringArgument(', 'util.assureStringStartsWith(',
        'util.assureStringEndsWith(', 'util.assureStringSurroundsWith(',
        'util.ensureType(', 'util.ensureStringType(', 'util.ensureNumberType(',
        'util.ensureUndefinedType(', 'util.ensureBooleanType(',
        'util.ensureSymbolType(', 'util.ensureBigIntType(',
        'util.ensureObjectType(', 'util.ensureFunctionType(',
        'util.ensureNonNullObjectType(', 'util.ensureArrayType(',
        'util.toRegular(', 'util.toRegularAndCall(', 'util.toRegularAndApply(',
        'util.dpToPx(', 'util.spToPx(', 'util.pxToDp(', 'util.pxToSp(',
        'util.inspect(', 'util.java.instanceof(', 'util.java.array(',
        'util.java.toJsArray(', 'util.java.objectToMap(',
        'util.java.mapToObject(', 'util.morseCode(',
        'util.morseCode.getCode(', 'util.morseCode.getPattern(',
        'util.morseCode.vibrate(', 'util.version.sdkInt',
        'util.versionCodes.search(', 'util.versionCodes.searchAll(',
        'util.versionCodes.summary(', 'util.versionCodes.toString(',
      ],
      'docs/api/utilities/converter.md': [
        'cvt.bytes.UNITS', 'cvt.bytes.AUTO', 'cvt.bytes.IEC_DIV',
        'cvt.bytes.SI_DIV', 'cvt.bytes(', 'cvt.bytes.strict(',
        'cvt.bytes.loose(',
      ],
      'docs/api/utilities/formatter.md': [
        'fmt.bytes.UNITS', 'fmt.bytes.AUTO', 'fmt.bytes.IEC_DIV',
        'fmt.bytes.SI_DIV', 'fmt.bytes(', 'fmt.bytes.strict(',
        'fmt.bytes.loose(',
      ],
      'docs/api/utilities/jsox.md': [
        'jsox(', 'jsox.extend(', 'jsox.extendAll(',
      ],
      'docs/api/utilities/zip.md': [
        'zip(', 'zip.open(', 'zip.zipFile(', 'zip.zipDir(', 'zip.zipFiles(',
        'zip.unzip(', 'archive.addFile(', 'archive.addFiles(',
        'archive.addFolder(', 'archive.extractAll(', 'archive.extractFile(',
        'archive.setPassword(', 'archive.getFileHeader(',
        'archive.getFileHeaders(', 'archive.isEncrypted(',
        'archive.removeFile(', 'archive.isValidZipFile(', 'archive.getPath(',
        'archive.getZipFile(',
      ],
      'docs/api/utilities/nanoid.md': ['nanoid('],
      'docs/api/utilities/pinyin.md': [
        'pinyin(', 'pinyin.convert(', 'pinyin.simple(',
        'pinyin.fromCodePoint(', 'pinyin.fromPhrase(', 'pinyin.compare(',
        'pinyin.compact(',
      ],
      'docs/api/utilities/pinyin4j.md': [
        'pinyin4j(', 'pinyin4j.of(', 'pinyin4j.as(',
      ],
      'docs/api/system/sysprops.md': [
        'sysprops.get(', 'sysprops.getInt(', 'sysprops.getBoolean(',
        'sysprops.getAll(',
      ],
      'docs/api/system/sqlite.md': [
        'sqlite(', 'sqlite.open(', 'db.insert(', 'db.insertOrThrow(',
        'db.insertWithOnConflict(', 'db.replace(', 'db.replaceOrThrow(',
        'db.update(', 'db.updateWithOnConflict(', 'db.delete(', 'db.query(',
        'db.queryWithFactory(', 'db.rawQuery(', 'db.rawQueryWithFactory(',
        'db.execSQL(', 'db.compileStatement(', 'db.validateSql(',
        'db.beginTransaction(', 'db.transaction(', 'db.close(',
        'cursor.get(', 'cursor.getByColumn(', 'cursor.pick(', 'cursor.next(',
        'cursor.all(', 'cursor.single(',
      ],
      'docs/api/media/mediainfo.md': [
        'mediainfo(', 'mediainfo.read(', 'info.general(', 'info.video(',
        'info.audio(', 'info.text(', 'info.other(', 'info.image(',
        'info.menu(', 'info.max(', 'info.toString(',
      ],
    }

    for (const [path, members] of Object.entries(requiredMembers)) {
      const source = markdown(path)
      expect(source, path).toMatch(/(?:≤\s*)?v\d+\.\d+\.\d+/)
      expect(source, path).toMatch(/```js[\s\S]+```/)
      for (const member of members) expect(source, `${path}: ${member}`).toContain(member)
    }
  })

  test('labels a Rhino 2.0 example and all contract dimensions on every new page', () => {
    const pages = [
      'docs/api/utilities/util.md',
      'docs/api/utilities/converter.md',
      'docs/api/utilities/formatter.md',
      'docs/api/utilities/jsox.md',
      'docs/api/utilities/mime.md',
      'docs/api/utilities/zip.md',
      'docs/api/utilities/nanoid.md',
      'docs/api/utilities/pinyin.md',
      'docs/api/utilities/pinyin4j.md',
      'docs/api/system/sysprops.md',
      'docs/api/system/sqlite.md',
      'docs/api/media/mediainfo.md',
    ]

    for (const page of pages) {
      const source = markdown(page)
      expect(source, page).toContain('Rhino 2.0')
      expect(source, page).toMatch(/```js[\s\S]+```/)
      expect(source, page).toMatch(/参数/)
      expect(source, page).toMatch(/返回/)
      expect(source, page).toMatch(/异常/)
      expect(source, page).toMatch(/权限/)
      expect(source, page).toMatch(/同步|线程/)
      expect(source, page).toMatch(/生命周期/)
      expect(source, page).toMatch(/副作用/)
    }
  })

  test('derives catalog cardinality checks instead of hard-coding 113 or 42', () => {
    const source = markdown('scripts/content/catalog.ts')

    expect(source).not.toMatch(/EXPECTED_CONTENT_ENTRY_COUNT\s*=\s*113/)
    expect(source).not.toMatch(/EXPECTED_LEGACY_ALL_ENTRY_COUNT\s*=\s*42/)
    expect(source).toContain('contentDefinitions.length')
    expect(source).toContain('legacyAllEntryIdDefinitions.length')
  })

  test('publishes the corrected contracts in the committed legacy JSON outputs', () => {
    const util = markdown('json/util.json')
    const mime = markdown('json/mime.json')
    const zip = markdown('json/zip.json')
    const pinyin = markdown('json/pinyin.json')
    const sqlite = markdown('json/sqlite.json')

    for (const member of [
      'util.class(value)',
      'util.getClass(value)',
      'util.className(value)',
      'util.getClassName(value)',
    ]) {
      expect(util).toContain(member)
    }
    expect(util).toContain('util.isObject(null)')

    expect(mime).toContain('mime.registerMimeDetector(className)')
    expect(mime).toContain('mime.getMimeTypes(inputStream, unknownMimeType)')
    expect(mime).toContain('mime.APPLICATION_ATOM_XML')
    expect(mime).toContain('mime.X_WORLD_X_VRML')

    for (const signature of [
      'zip.zipFile(filePath, destination, options?)',
      'zip.zipDir(directoryPath, destination, options?)',
      'zip.zipFiles(filePaths, destination, options?)',
      'zip.unzip(zipPath, destination, options?)',
    ]) {
      expect(zip).toContain(signature)
    }

    expect(pinyin).toContain('PinyinStyle 枚举对象')
    expect(pinyin).toContain('普通 JavaScript 数字')
    expect(sqlite).toContain('External: SQLiteOpenHelper')
  })
})
