<template>
  <div class="introduce">
    <div><span>🎊</span> Hello,我是</div>
    <div class="title">一个大不liu</div>
    <div>欢迎来到我的个人博客</div>
    <div class="typeWriter">
      <div class="text" :style="setStyle">{{ info }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, ref} from "vue";

const list = ref([
  '前端开发',
  '热衷接触新技术',
  '技术栈：Vue，pinia，Typescript，Sass，electron',
])
const info = ref('')
const i = ref(0)
info.value = list.value[i.value]
setInterval(() => {
  if (i.value >= list.value.length - 1) {
    i.value = 0
  } else {
    i.value++
  }
  info.value = list.value[i.value]
}, 3 * 1000)
const setStyle = computed(() => {
  return {'--characters--': info.value.length}
})
</script>

<style scoped lang="scss">
.introduce {
  font-size: 24px;
  line-height: 30px;

  .title {
    font-weight: 900;
    font-size: 44px;
    line-height: 50px;
    background-image: linear-gradient(to right, #e4afcb 0%, #b8cbb8 0%, #b8cbb8 0%, #e2c58b 30%, #c2ce9c 64%, #7edbdc 100%);
    -webkit-text-fill-color: transparent;
    -webkit-background-clip: text;
  }

  .typeWriter {
    display: flex;
    font-size: 18px;

    &:after {
      content: ' |';
      animation: blink 1s infinite;
      animation-timing-function: step-end;
    }

    .text {
      max-width: 0;
      animation: typing 3s steps(var(--characters--)) infinite;
      white-space: nowrap;
      overflow: hidden;
    }

    @keyframes typing {
      75%,
      100% {
        max-width: calc(var(--characters--) * 1em);
      }
    }
    @keyframes blink {
      0%,
      75%,
      100% {
        opacity: 1;
      }
      25% {
        opacity: 0;
      }
    }
  }

}

</style>
