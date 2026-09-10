const overridesModulePath = '../scripts/api/' + 'overrides'

describe('API extraction overrides', () => {
  test('keeps inherited MIME and Java runtime surfaces explicit and auditable', async () => {
    const { dynamicOverrides } = (await import(overridesModulePath)) as {
      dynamicOverrides: Array<Record<string, any>>
    }
    const mime = dynamicOverrides.find(
      (override) => override.id === 'mime-legacy-prototype',
    )
    const database = dynamicOverrides.find(
      (override) => override.id === 'sqlite-database-runtime-result',
    )
    const cursor = dynamicOverrides.find(
      (override) => override.id === 'sqlite-cursor-wrapper',
    )

    expect(mime?.members?.map(({ name }: { name: string }) => name)).toEqual(
      expect.arrayContaining([
        'registerMimeDetector',
        'getMimeDetector',
        'getMimeTypes',
        'unregisterMimeDetector',
      ]),
    )
    expect(
      mime?.members?.some(({ kind }: { kind: string }) => kind === 'dynamic'),
    ).toBe(false)
    expect(cursor?.members?.map(({ name }: { name: string }) => name)).toEqual(
      expect.arrayContaining([
        'close',
        'getColumnNames',
        'moveToNext',
        'setNotificationUris',
      ]),
    )
    expect(
      (cursor?.members ?? []).some(
        ({ kind }: { kind: string }) => kind === 'dynamic',
      ),
    ).toBe(false)
    expect(database).toMatchObject({ includePublicMembers: true })
    expect(
      (database?.members ?? []).some(
        ({ kind }: { kind: string }) => kind === 'dynamic',
      ),
    ).toBe(false)

    expect(
      dynamicOverrides.find(
        (override) => override.id === 'selector-reflected-global-methods',
      )?.source,
    ).toEqual({
      path: 'app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/selector/Selector.kt',
      line: 44,
    })
  })
})
