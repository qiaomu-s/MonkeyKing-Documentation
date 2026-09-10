import {
  contentEntries,
  contentEntriesBySection,
  contentSectionOrder,
  contentSections,
  legacyAllEntryIds,
} from '../scripts/content/catalog'
import type {
  ContentEntry,
  ContentEntryId,
  ContentSectionId,
} from '../scripts/content/catalog'

function assertReadonlyEntry(entry: ContentEntry): void {
  // @ts-expect-error ContentEntry fields are readonly.
  entry.id = 'changed'
  // @ts-expect-error The nested JSON-name collection is readonly.
  entry.jsonNames.push('changed')
  // @ts-expect-error The backwards-compatible JSON-name collection is readonly.
  entry.legacyJsonNames.push('changed')
  // @ts-expect-error Legacy-all membership is readonly.
  entry.includeInLegacyAll = false
}

describe('content catalog type contract', () => {
  test('derives closed section and entry id unions', () => {
    const sectionId: ContentSectionId = contentSections[0].id
    const entryId: ContentEntryId = contentEntries[0].id
    const legacySource: string | undefined = contentEntries[0].legacySource

    // @ts-expect-error Arbitrary sections are not catalog section ids.
    const unknownSection: ContentSectionId = 'unknown'
    // @ts-expect-error Arbitrary ids are not catalog entry ids.
    const unknownEntry: ContentEntryId = 'unknown.entry'

    expect(sectionId).toBe('guide')
    expect(entryId).toBe('guide.overview')
    expect(legacySource).toBe('api/overview.md')
    expect(unknownSection).toBe('unknown')
    expect(unknownEntry).toBe('unknown.entry')
    expect(assertReadonlyEntry).toBeTypeOf('function')
  })

  test('types ordered exports and the section lookup with their derived unions', () => {
    expectTypeOf(contentSectionOrder).toEqualTypeOf<
      readonly ContentSectionId[]
    >()
    expectTypeOf(legacyAllEntryIds).toMatchTypeOf<
      readonly ContentEntryId[]
    >()
    expectTypeOf(contentEntriesBySection).toEqualTypeOf<
      Readonly<Record<ContentSectionId, readonly ContentEntry[]>>
    >()
  })
})
