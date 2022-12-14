# Vue 初体验

1. CDN 在线引入 Vue：

```html
<!-- 开发版本，包含完整的警告和调试模式 -->
<script src="https://cdn.jsdelivr.net/npm/vue@2.7.10/dist/vue.js"></script>
<!-- 生产版本，删除了警告；速度更快、包体积更小 -->
<script src="https://cdn.jsdelivr.net/npm/vue@2.7.10"></script>
```

2. 创建 Vue 实例 vm，构造函数接收一个参数：**配置对象**；这里先介绍 [配置对象] 的其中 2 个配置项：`el`、`data`

   `el`：挂载元素（即能使用 Vue 语法的范围），`el` 的值是 CSS 选择器字符串；如果匹配多个元素，则只有第 1 个元素生效

   `data`：用于存放数据，`data` 里存放的数据会直接成为 Vue 实例的属性

```js
let vm = new Vue({
    el: '#app',
    data: { name: "superman" }
});
```

> #### `el` 的使用

```js
let vm = new Vue({ el: "#app" });
```

- 除了设置 `el` 配置项挂载，我们还可以使用 Vue 实例身上的 `$mount` 方法挂载

```js
let vm = new Vue();
vm.$mount('#app');
```

> #### `data` 的使用

- data 可以写成 Object 形式：

```js
let vm = new Vue({
    el: '#app',
    data: { name: "superman" }
});
```

- data 还可以写成 Function 形式：
- 如果在**组件**中使用，data 只能为 Function 形式；
  因为：组件可能被用来创建多个实例，如果 data 是 Object 形式的，则所有实例将共享引用同一个数据对象；
  如果提供 Function 形式的 data，每次创建实例，都会拿到初始数据的全新副本

```js
let vm = new Vue({
    el: '#app',
    data() {
        return { name: "superman" };
    }
});
```

- Vue 会把 data 的 property 具有响应性，即修改数据后 页面会重新渲染新数据
- Vue 实例创建之后，可以通过 `vm.$data` 访问原始数据对象；
  Vue 实例也代理了 data 对象上的 property，因此访问 `vm.a` 等价于 `vm.$data.a`；
  此外，data 会被 Vue 代理为 `_data`，因此 `vm.a`、`vm.$data.a`、`vm._data.a` 等效

> #### Vue 实例的属性

- Vue 实例有很多属性：
  带有 `$` 的，eg：`$el`、`$on`、`$watch`、`$mount`… 是 Vue 封装好给我们使用的
  没有 `$` 的，是 Vue 的基本设置，不要随意改动！
- 以 `_` / `$` 开头的 property 不会被 Vue 实例代理，因为它们可能和 Vue 内置的 porperty、API 方法冲突；
  ∴ 不能通过 `vm._property` 的方式访问这些 property，但可以通过 `vm.$data._property` 的方式访问

```js
let data = { name: "superman" } // 设置 data 属性值
let vm = new Vue({ data }); // 创建 Vue 实例 vm
vm.$mount("#app"); // 调用 $mount 挂载元素
console.log(vm._data.name === vm.name); // true
```

注意：`data` 代理为 `_data` 之前，Vue 会先对 `data` 内的数据进行加工 ( 添加 getter、setter )，使其成为响应性数据

> #### Vue3 创建 Vue 实例

```js
Vue.createApp({ // 通过 Vue.createApp 创建 Vue 实例
    setup() { // 编写 setup 函数
        let name = "superman"; // 在 setup 函数中定义数据
        return { name }; // 将需要在模版中使用的数据返回出来
    }
}).mount("#app"); // 调用 mount 方法挂载元素
```

- Vue3 兼容 Vue2 的语法，但不推荐混着使用：

```js
let vm = Vue.createApp({
    data() { // 编写 data 存放数据，Vue3 中 data 只能为工厂函数形式
        return { name: "superman" };
    },
}).mount("#app"); // 挂载元素
```

<br><br>

# Vue 的数据代理

1. data 中的数据会被代理为 Vue 实例的属性，使其更方便被访问

2. 同时，data 会被代理为 Vue 实例的 _data 属性，就是说 _data 和 data 指向的是同一个对象

3. data 中的数据代理使用的是 `Object.defineproperty()`；
   给每个属性都设置了 setter & getter，即 “数据劫持”；以保证数据的双向绑定

4. 因为 Vue 中的数据是双向绑定的，∴ 不管修改 [页面显示的数据] / [data 中的数据]，另一个数据都会跟着改变

- 在 methods 里面定义的方法，会直接成为 Vue 实例的方法

<br><br>

# MVVM 模型

- M - model：模型，对应 `data` 中的数据
- V - view：视图，模版
- VM - ViewModel：视图模型，Vue 实例对象

<img src="picture/01_Vue%20%E6%A6%82%E8%BF%B0/image-20220315143439694.png" alt="image-20220315143439694" style="zoom:50%;" />

> #### 优点：方便前端开发人员编写页面。使开发人员可以专注于数据、逻辑的处理，而不需要亲自操作 DOM
