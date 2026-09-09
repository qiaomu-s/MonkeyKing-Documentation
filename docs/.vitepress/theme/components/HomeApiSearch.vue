<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { watchForSearchDismissal } from '../search-focus'

const searchTrigger = ref<HTMLButtonElement | null>(null)
let stopWatchingSearch = () => {}

function isSearchOpen(): boolean {
  return document.querySelector('.VPLocalSearchBox') !== null
}

function observeSearchChanges(callback: () => void): () => void {
  const observer = new MutationObserver(callback)
  observer.observe(document.body, { childList: true, subtree: true })

  const openTimeout = window.setTimeout(() => {
    if (!isSearchOpen()) stopWatchingSearch()
  }, 10_000)

  return () => {
    window.clearTimeout(openTimeout)
    observer.disconnect()
  }
}

function deferFocusRestore(callback: () => void): void {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(callback)
  })
}

function openSearch(): void {
  const trigger = searchTrigger.value
  if (!trigger) return

  stopWatchingSearch()
  stopWatchingSearch = watchForSearchDismissal({
    isSearchOpen,
    observeChanges: observeSearchChanges,
    defer: deferFocusRestore,
    restoreFocus: () => {
      if (!isSearchOpen() && trigger.isConnected) {
        trigger.focus({ preventScroll: true })
      }
    },
  })

  window.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
      metaKey: true,
      bubbles: true,
    }),
  )
}

onBeforeUnmount(() => stopWatchingSearch())
</script>

<template>
  <section
    class="mk-home-search"
    aria-labelledby="monkeyking-api-search-title"
  >
    <div class="mk-home-search__copy">
      <p class="mk-home-search__eyebrow">API 搜索</p>
      <h2 id="monkeyking-api-search-title">直接搜索需要的能力</h2>
      <p id="monkeyking-api-search-description">
        搜索函数、类型、参数或示例，快速定位到对应文档章节。
      </p>
    </div>

    <button
      ref="searchTrigger"
      class="mk-home-search__button"
      type="button"
      aria-describedby="monkeyking-api-search-description"
      aria-keyshortcuts="Control+K Meta+K"
      @click="openSearch"
    >
      <span>搜索 API</span>
      <kbd aria-hidden="true">⌘ / Ctrl K</kbd>
    </button>
  </section>
</template>
