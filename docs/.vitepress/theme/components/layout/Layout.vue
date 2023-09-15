<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import Hero from "./Hero.vue";

const {Layout} = DefaultTheme
</script>


<template>
  <Layout>
    <template #home-hero-before>
      <Hero/>
    </template>
  </Layout>


</template>

