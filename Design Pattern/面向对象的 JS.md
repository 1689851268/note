# 类型检测

-   静态类型语言: 变量的类型在编译时便已确定. eg: Java
-   动态类型语言: 变量的类型要到程序运行时 待变量被赋值后, 才会有某种类型. eg: JS

<br><br>

# 多态

多态: 在不同的对象上执行同一操作, 可以产生不同的执行结果.

多态的思想: 把 “做什么” 和 “谁去做” 分离开来.

多态最根本的作用: 把过程化的条件分支语句转化为对象的多态性, 从而消除这些条件分支语句.

demo: 假设我们需要开发一个地图功能, 使用的是谷歌地图. 我们可以这样实现:

```js
var googleMap = {
    show: function () {
        console.log("google");
    },
};
```

```js
var renderMap = function () {
    googleMap.show();
};
```

```js
renderMap();
```

如果某天 我们需要支持百度地图. 我们可以这样实现:

```js
var googleMap = {
    show: function () {
        console.log("google");
    },
};

var baiduMap = {
    show: function () {
        console.log("baidu");
    },
};
```

```js
var renderMap = function (type) {
    if (type === "google") {
        googleMap.show();
    } else if (type === "baidu") {
        baiduMap.show();
    }
};
```

```js
renderMap("google");
renderMap("baidu");
```

但是 这样写的话, 以后我们每支持多一种地图, 除了需要创建该地图对象外, 还需要改动一下 renderMap 函数内的条件分支语句. 我们可以再融入一些多态的思想:

```js
var googleMap = function () {
    this.show = function () {
        console.log("google");
    };
};

var baiduMap = function () {
    this.show = function () {
        console.log("baidu");
    };
};
```

```js
var renderMap = function (map) {
    if (map.show instanceof Function) {
        map.show();
    }
};
```

```js
renderMap(new googleMap());
renderMap(new baiduMap());
```

如此, 以后我们每支持多一种地图, 只需要创建该地图的构造函数即可.

<br><br>

# 封装

封装的目的: 将信息隐藏.

许多语言封装数据是由语法解析来实现的, 这些语言提供了 private、public、protected 等关键字来提供不同的访问权限.

但 JS 没有提供这些关键字, 只能通过**作用域**来实现封装特性, 且只能模拟出 public、private 这两种封装性.

```js
var myObject = (function () {
    var _name = "superman"; // private 属性
    return {
        getName: function () {
            return _name; // public 方法
        },
    };
})();

console.log(myObject.getName()); // superman
console.log(myObject._name); // undefined
```

在 ES6 中, 还可以通过 Symbol 创建私有属性.

<br><br>

# 原型模式

访问实例的属性时, 先查看该实例自己的属性; 若没有, 则查看其原型对象的属性; 若还是没有, 则查看其原型对象的原型对象的属性; 以此类推... 直至找到 `Object.prototype`.

```js
var Person = function () {
    this.name = "superman";
};

var per = new Person();
var clonePer = Object.create(per);

console.log(Object.getPrototypeOf(clonePer) === per); // true

console.log(per.name); // superman
console.log(clonePer.name); // superman
```

方法 `Object.create()` 可用于创建对象: `const res = Object.create(para)`
其中 `res` 为创建的对象; `para` 为 `res` 的原型对象, 若传入 `null` 则表示没有原型对象.

<br>
