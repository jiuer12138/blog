# 基础面试题

## v-for和v-if相关问题

### 优先级

在Vue2中v-for优先级更高，在Vue3中v-if的优先级更高,官方不推荐一起使用（[官网](https://cn.vuejs.org/guide/essentials/list.html#v-for-with-v-if)）
![图片](/Snipaste_2023-09-08_16-59-23.png)

在vue3中如果同时使用v-if和v-for可能会报错。如下例子：

```html
<!--这会抛出一个错误，因为属性 todo 此时没有在该实例上定义-->
<li v-for="todo in todos" v-if="!todo.isComplete">
    {{ todo.name }}
</li>
```

### 处理方法

- 在外层包一层template将v-for移到外层

```html

<template v-for="todo in todos">
    <li v-if="!todo.isComplete">
        {{ todo.name }}
    </li>
</template>
 ```

- 最佳实践（通过计算属性处理）

```js
<li v-for="todo in undones">
    {{todo.name}}
</li>
<!--vue2中-->
computed:{
    undones()
    {
        return this.todos.filter(todo => !todo.isComplete)
    }
}
<!--vue3中-->
const undones = computed(() => {
    return todos.value.filter(todo => !todo.isComplete)
})
```

## 如何判断对象为空

### JSON.stringify

```js
        const obj = {}
console.log(JSON.stringify(obj)) // "{}"
```

注意： 当属性值中有如果存在 undefined、任意的函数以及 symbol 值，在序列化过程中会被忽略（出现在非数组对象的属性值中时）或者被转换成
null（出现在数组中时）。

```js
const obj = {
    a: undefined,
    b: function () {
    },
    c: Symbol(),
    d: [
        undefined,
        function () {
        },
        Symbol(),
    ]
}
console.log(JSON.stringify(obj)); //"{"d":[null,null,null]}"
```

### for in 配合 hasOwnProperty

```js
const obj = {}
Object.prototype.a = 1

function isEmptyObj(obj) {
    let flag = true
    for (let o in obj) {
        // hasOwnProperty 判断对象自身是否有该属性
        if (obj.hasOwnProperty(o)) {
            flag = false
            break
        }
    }
    return flag
}

console.log(isEmptyObj(obj)) // true
```

### Object.keys

判断是否有key，但是会有取不到不可枚举属性的key值的问题

```js
 const obj = {}
Object.prototype.a = 1
console.log(Object.keys(obj).length === 0) // true
```

### Object.getOwnPropertyNames 和 Object.getOwnPropertySymbols
getOwnPropertyNames获取对象自身所有（除去symbol值）属性名，getOwnPropertySymbols获取symbol值为属性名的数组

```js
const a = Symbol()
    const obj = {
        [a]: 1,
        b: 123,
    }
    console.log(Object.getOwnPropertyNames(obj)); // ['b']
    console.log(Object.getOwnPropertySymbols(obj));// [Symbol()]
```
### 最佳实践（Reflect.ownKeys）
改方法返回目标对象自身的属性组成的数组，等同于 
```js
Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target))
```
