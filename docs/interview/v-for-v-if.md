# v-for和v-if相关问题

### 优先级

在Vue2中v-for优先级更高，在Vue3中v-if的优先级更高,官方不推荐一起使用（[官网](https://cn.vuejs.org/guide/essentials/list.html#v-for-with-v-if)）
![图片](/Snipaste_2023-09-08_16-59-23.png)

在vue3中如果同时使用v-if和v-for可能会报错。如下例子：

``` js
<!--这会抛出一个错误，因为属性 todo 此时没有在该实例上定义-->
<li v-for="todo in todos" v-if="!todo.isComplete">
  {{ todo.name }}
</li>
```

### 处理方法
 - 在外层包一层template将v-for移到外层
   ``` js
    <template v-for="todo in todos">
        <li v-if="!todo.isComplete">
            {{ todo.name }}
        </li>
    </template>
    ```
 - 最佳实践（通过计算属性处理）
  ``` js
      <li v-for="tode in undones">
          {{ tode.name }}
      </li>
      <!--vue2中-->
      computed:{
          undones(){
            return this.todos.filter(todo=>!todo.isComplete)
          }
      }
      <!--vue3中-->
      const undones = computed(() => {
        return todos.value.filter(todo=>!todo.isComplete)
      })
  ```
