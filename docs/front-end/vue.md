# vue
## 重置vue2组件的data数据
```js
//调用$options里的data方法
this.$options.data()
// 若data中有this.$route.query参数
this.$options.data.call(this)
```
