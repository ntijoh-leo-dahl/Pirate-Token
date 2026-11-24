<template>
  <SkyBackground />
  <v-app>
    <v-main>
      <router-view v-slot="{ Component, route }">
        <component :is="Component" :key="route.name" />
      </router-view>
    </v-main>
  </v-app>
</template>

<script setup>
import SkyBackground from './components/SkyBackground.vue'
</script>
