# `for … in`

-   可遍历 key 值
-   可遍历所有的可枚举属性，包括原型
-   遍历的顺序可能不是内部实际的顺序
    适用于遍历 Object

<br>

## 遍历对象

```js
let obj = {
    name: 'superman',
    age: 18,
    height: 180,
};
for (let key in obj) {
    console.log(key, obj[key]);
    // name superman
    // age 18
    // height 180
}
```

<br>

## 遍历数组

```js
let arr = ['a', 'b', 'c'];
for (let key in arr) {
    console.log(key, arr[key]);
    // 0 a
    // 1 b
    // 2 c
}
```

<br>

## 关键字 in

-   `in` 关键字也可以用于判断该 key 值是否存在于对象 / 数组中

```js
let obj = {
    name: 'superman',
    age: 18,
};
console.log('age' in obj); // true
```

```js
let arr = ['a', 'b', 'c'];
console.log(3 in arr); // false
```

<br><br>

# `for … of`

-   可遍历 value 值
-   只遍历可迭代对象自己的 value，不会遍历其原型对象上的 value
-   适用于遍历 Array、String、Map、Set 等可迭代对象；
    不能遍历 Object，因为 Object 不是可迭代对象 (没有迭代器 Iterator)

```js
for (let element of [2, 4, 6, 8]) {
    console.log(element); // 2 4 6 8
}
```

数据结构只要设置了 `Symbol.iterator` 属性，就被视为具有 iterator 接口，就可以用 `for … of` 遍历其成员；
就是说，`for … of` 内部调用的是数据结构的 `Symbol.iterator` 方法

<br>

## 遍历对象

`for … of` 不能直接遍历对象，但可以通过以下 3 个方法遍历：

1. **`Object.keys(obj)`**：以数组的形式，返回对象的**属性**
2. **`Object.values(obj)`**：以数组的形式，返回对象的**属性值**
3. **`Object.entries(obj)`**：以数组的形式，返回对象的**键值对**（键值对也是数组的形式）

这 3 个方法挂在构造函数 Object 身上，需要通过 `Object.方法名(obj)` 调用
[数组] 也有这 3 个方法，不过数组是挂在其原型对象身上，所以数组可以直接通过 `实例.方法名()` 调用

```js
const obj = {
    name: 'superman',
    showName() {
        console.log(this.name, this.age);
    },
};
console.log(Object.keys(obj)); // [ 'name', 'showName' ]
console.log(Object.values(obj)); // [ 'superman', [Function: showName] ]
console.log(Object.entries(obj)); // [ [ 'name', 'superman' ], [ 'showName', [Function: showName] ] ]
```

-   **即可配合 `for … of` 遍历对象的属性**

```js
for (const key of Object.keys(obj)) {
    console.log(key); // name    showName
}

for (const val of Object.values(obj)) {
    console.log(val); // superman    [Function: showName]
}

for (const item of Object.entries(obj)) {
    console.log(item); // [ 'name', 'superman' ]    [ 'showName', [Function: showName] ]
}
```

<br>

## 遍历数组

-   `arr.keys()`：获取数组的下标
-   `arr.values()`：获取数组的元素
-   `arr.entries()`：获取数组的键值对（下标，元素）

它们都返回一个迭代器对象，可以用 `for … of` 进行遍历

```js
let arr = ['apple', 'banana', 'orange'];

for (let index of arr.keys()) {
    // 通过 keys 获取下标
    console.log(index); // 0 1 2
}

for (let val of arr.values()) {
    // 通过 values 获取值
    console.log(val); // apple banana orange
}

for (let item of arr.entries()) {
    // 通过 entries 获取键值对
    console.log(item); // [0, "apple"] [1, "banana"] [2, "orange"]
}
```

可以直接使用 `for…of` 遍历数组，与使用 `for…of` 遍历 `arr.values()` 等效

```js
for (let val of arr) {
    // 直接获取值
    console.log(val); // apple banana orange
}
```
