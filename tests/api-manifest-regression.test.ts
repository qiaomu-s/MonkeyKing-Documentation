import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('pinned MonkeyKing API manifest', () => {
  test('retains inherited EventEmitter surfaces for runtime prototypes', () => {
    const manifest = JSON.parse(
      readFileSync(resolve(process.cwd(), 'api-surface/manifest.json'), 'utf8'),
    ) as {
      schemaVersion: number
      productVersion: string
      symbols: Array<{ id: string }>
    }
    const symbolIds = new Set(manifest.symbols.map(({ id }) => id))

    expect(manifest).toMatchObject({ schemaVersion: 2, productVersion: '6.7.0' })
    expect(manifest.symbols).toHaveLength(4_499)
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
