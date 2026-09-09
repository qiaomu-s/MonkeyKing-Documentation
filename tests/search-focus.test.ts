import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const focusModulePath = resolve(
  process.cwd(),
  'docs/.vitepress/theme/search-focus.ts',
)

async function loadFocusModule() {
  if (!existsSync(focusModulePath)) return undefined
  return import('../docs/.vitepress/theme/search-focus')
}

function createLifecycleHarness() {
  let searchOpen = false
  let notify = () => {}
  let observationStops = 0
  const deferred: Array<() => void> = []
  const restoreFocus = vi.fn()

  return {
    lifecycle: {
      isSearchOpen: () => searchOpen,
      observeChanges(callback: () => void) {
        notify = callback
        return () => {
          observationStops += 1
        }
      },
      defer: (callback: () => void) => deferred.push(callback),
      restoreFocus,
    },
    setSearchOpen(value: boolean) {
      searchOpen = value
      notify()
    },
    flushDeferred() {
      deferred.splice(0).forEach((callback) => callback())
    },
    get observationStops() {
      return observationStops
    },
    restoreFocus,
  }
}

describe('home API search focus lifecycle', () => {
  test('restores focus once only after an observed search dialog closes', async () => {
    const focusModule = await loadFocusModule()
    expect(
      focusModule,
      'docs/.vitepress/theme/search-focus.ts must exist',
    ).toBeDefined()
    if (!focusModule) return

    const harness = createLifecycleHarness()
    focusModule.watchForSearchDismissal(harness.lifecycle)

    harness.setSearchOpen(false)
    expect(harness.restoreFocus).not.toHaveBeenCalled()
    harness.setSearchOpen(true)
    expect(harness.restoreFocus).not.toHaveBeenCalled()
    harness.setSearchOpen(false)
    expect(harness.observationStops).toBe(1)
    expect(harness.restoreFocus).not.toHaveBeenCalled()

    harness.flushDeferred()
    expect(harness.restoreFocus).toHaveBeenCalledTimes(1)
    harness.setSearchOpen(false)
    harness.flushDeferred()
    expect(harness.restoreFocus).toHaveBeenCalledTimes(1)
  })

  test('does not restore focus when lifecycle observation is cancelled', async () => {
    const focusModule = await loadFocusModule()
    expect(
      focusModule,
      'docs/.vitepress/theme/search-focus.ts must exist',
    ).toBeDefined()
    if (!focusModule) return

    const harness = createLifecycleHarness()
    const cancel = focusModule.watchForSearchDismissal(harness.lifecycle)
    cancel()
    harness.setSearchOpen(true)
    harness.setSearchOpen(false)
    harness.flushDeferred()

    expect(harness.observationStops).toBe(1)
    expect(harness.restoreFocus).not.toHaveBeenCalled()
  })
})
