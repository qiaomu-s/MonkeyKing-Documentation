<script setup lang="ts">
function openSearch(): void {
  window.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
      metaKey: true,
      bubbles: true,
    }),
  )
}
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
