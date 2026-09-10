import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('pinned MonkeyKing API manifest', () => {
  test('retains inherited EventEmitter surfaces for runtime prototypes', () => {
    const manifest = JSON.parse(
      readFileSync(resolve(process.cwd(), 'api-surface/manifest.json'), 'utf8'),
    ) as {
      source: { repository: string }
      symbols: Array<{ id: string }>
    }
    const symbolIds = new Set(manifest.symbols.map(({ id }) => id))

    expect(manifest.source.repository).toBe('qiaomu-s/AutoJs6')
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
