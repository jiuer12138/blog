<template>
  <div class="container">
    <div class="item" v-for="(item,i) in list" :key="item.url" @click="goWeb(item.url)">
      <div>
        <img :src="item.src" v-if="loadImgSuccess(item.src,i)" @error="handleImgError(i)">
        <!-- 没有图片url或者图片加载出错的情况 -->
        <div class="avatarClass" v-else>{{ noLogo(item.title) }}</div>
      </div>
      <div>
        <div class="title"><a :href="item.url" target="_blank">{{ item.title }}</a></div>
        <div class="description" :title="item.description">{{ item.description }}</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">

import {ref, computed} from 'vue'

const props = defineProps({
  list: {
    type: Array,
    default: () => []
  }
})
const goWeb = (url: string) => {
  window.open(url)
}
const imgFlags = ref(Array(props.list?.length).fill(true))

const handleImgError = (i: number) => {
  imgFlags.value[i] = false
}

const loadImgSuccess = computed(() => {
  return (src: string, i: number) => {
    return !!src && imgFlags.value[i]
  }
})

const noLogo = computed(() => {
  return (title: string) => {
    return title.slice(0, 1)
  }
})

</script>

<style scoped lang="scss">
.container {
  width: 100%;
  display: grid;
  grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));
  grid-gap: 10px;

  .item {
    display: flex;
    border: 1px solid #eee;
    border-radius: 5px;
    padding: 15px;
    cursor: pointer;

    img {
      width: 40px;
      height: 40px;
      margin-right: 5px;
      object-fit: contain;
    }

    .avatarClass {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #333333;
      color: #ffffff;
      text-align: center;
      line-height: 40px;
      font-size: 20px;
      font-weight: 600;
      margin-right: 5px;
    }

    .title {
      font-weight: 600;

      a {
        text-decoration: none;
      }
    }

    .description {
      font-size: 12px;
      max-width: 140px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
