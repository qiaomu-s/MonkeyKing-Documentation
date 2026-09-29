import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('pinned MonkeyKing API manifest', () => {
  test('retains inherited EventEmitter surfaces for runtime prototypes', () => {
    const manifest = JSON.parse(
      readFileSync(resolve(process.cwd(), 'api-surface/manifest.json'), 'utf8'),
    ) as {
      schemaVersion: number
      symbols: Array<{ id: string }>
    }
    const symbolIds = new Set(manifest.symbols.map(({ id }) => id))

    expect(manifest).toMatchObject({ schemaVersion: 3 })
    expect(manifest).not.toHaveProperty('productVersion')
    // The current Android DM surface no longer exposes the two PC-only
    // password entry points; keep the assertion tied to the checked-in
    // source-backed manifest.
    expect(manifest.symbols).toHaveLength(4_612)
    expect(manifest).not.toHaveProperty('source')
    expect(symbolIds.has('global:__engine__')).toBe(false)
    for (const id of [
      'events.on',
      'events.emit',
      'sensors.on',
      'sensors.emit',
      'webSocket.instance.addListener',
      'webSocket.instance.emit',
      'webSocket.instance.eventNames',
    ]) {
      expect(symbolIds.has(id), `Missing inherited symbol ${id}`).toBe(true)
    }
  })
})
