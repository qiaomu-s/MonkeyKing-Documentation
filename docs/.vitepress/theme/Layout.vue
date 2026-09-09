<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import HomeApiSearch from './components/HomeApiSearch.vue'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #home-features-before>
      <HomeApiSearch />
    </template>
  </Layout>
</template>
