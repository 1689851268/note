# TS 简介

- TS 是 JS 的超集、是以 JS 为基础，构建出来的语言
  ∴ TS 可以在任何支持 JS 的平台中执行
- TS 不能被 JS 解析器直接执行，也就不能被浏览器直接执行
  ∴ 需要先编译为 JS
- TS 扩展了 JS，并添加了类型（JS 是弱类型语言、TS 是强类型语言）

# TS 初体验

1. 下载、安装 Node
2. `npm i -g typescript`
3. 创建、编写 .ts 文件（TS 支持 JS 语法，所以可以在 .ts 文件里面写 JS 代码）
4. 编译 .ts 文件 `tsc XXX.ts`
   要在 .ts 文件所在目录下编译
   编译成功后，即能生成对应的 .js 文件

- 如果同时打开 TS 文件及其编译出来的 JS 文件，会出现同名变量冲突的问题
  此时 我们可以执行  `tsc --init` 初始化 TS 配置文件，TS 配置文件创建成功后，就不会再飘红啦
- 可以使用 `tsc XXX.ts -w` 编译 TS 文件
  此时 编译器会监听该 TS 文件，有改动则自动重新编译

> #### (自动)编译多个 TS 文件

1. 初始化 tsconfig.json 文件
   1. 手动创建（即使什么都不配置，也能正常使用）
   2. 使用 `tsc --init` 自动创建、并默认配置
2. 创建 TS 配置文件后，即可使用 `tsc` 编译所有 TS 文件
   也能使用 `tsc -w` 编译、并监听所有 TS 文件，有改动则自动重新编译

> #### 错误编译

- 在编译时，即使 TS 抛出错误，还是会成功编译为 JS 文件；只要 JS 代码不报错，浏览器就还是能正常运行
- 可以执行 `tsc --noEmitOnError` 表示：如果编译 TS 时出错，则不生成对应的 JS 文件
  使用 `--noEmitOnError` 前，需要先初始化 tsconfig.json 文件

# 新增约束

> #### 对于 【变量】
>

1. 约束【变量】的 [类型]

```ts
let num: number; // 显式约束类型：先声明、后赋值
let str = "superman"; // 隐式约束类型：声明、并赋值（TS 会自动识别类型，并对变量进行约束）
```

- 以上 2 种写法，都会约束【变量】的 [类型]。如果变量值的类型不对，会直接飘红
- 如果不指定【变量】的 [类型]，默认为 `any` 类型

> #### 对于 [函数]

1. 约束【函数参数】的 [类型] & [个数]
2. 约束【函数返回值】的 [类型]

```ts
function sum(num1: number, num2: number): number {
    return num1 + num2;
}
let result = sum(100, 200); // 传参时，参数的 [类型] & [个数] 要对应
// 此时，变量 result 的类型也是 number
```

- 如果不指定【函数参数】的 [类型]，默认为 `any` 类型
- 如果不指定【函数返回值】的 [类型]，TS 会根据 `return` 语句 自动识别类型

# 约束的类型

| 类型     | 例子         | 描述                               |
| -------- | ------------ | ---------------------------------- |
| number   | `1`          | 数字                               |
| string   | `"superman"` | 字符串                             |
| boolean  | `true`       | 布尔值                             |
| 字面量   |              | 限制变量的值就是该字面量的值       |
| any      |              | 任意类型                           |
| unknown  |              | 类型安全的 any                     |
| void     | `return;`    | 没有值 / `undefined`               |
| never    |              | 没有值，不能是任何值               |
| array    | `[1, 2, 3]`  | 数组                               |
| tuple    | `[4, 5]`     | 元组 - TS 新增类型，固定长度的数组 |
| enum     | `enum{A, B}` | 枚举 - TS 新增类型                 |
| object   |              | 对象                               |
| Function |              | 函数                               |

## any & unknown

1. `any` 不安全。eg：该类型的变量可以直接赋值给任意其他类型的变量

```ts
let anyVal: any = "superman";
let numberVal: number;
numberVal = anyVal;
```

2. `unknown` 安全，因为对 `unknown` 值做任何使用都是不合法的。
   eg：该类型的变量不可以直接赋值给任意其他类型的变量。如果要赋值，需要进行判断

```ts
let unknownVal: unknown = "superman";
let numberVal: number = 0;
console.log("numberVal", numberVal); // numberVal 0

if (typeof unknownVal === "number") { // 如果不判断，会直接飘红
    numberVal = unknownVal;
}
console.log("numberVal", numberVal); // numberVal 0
```

- 这里可以使用 [**类型断言**]，表示你确定当前变量一定会是指定类型
  语法：写法1 - `变量 as 类型`、 写法2 - `<类型>变量`

```ts
let unknownVal: unknown = 100;
let numberVal: number = 0;
numberVal = unknownVal as number; // 此时，你得确保当前变量 unknownVal 一定会是 number 类型
numberVal = <number>unknownVal; // 因为，使用类型断言后 TS 不再判断，会直接将 unknownVal 赋值给 numberVal
```

## void & never

1. `void` 修饰的函数，没有返回值 / 返回 `undefined`

```ts
function fun1(): void {} // 没有返回值

function fun2(): void { // 返回 `undefined`
    return;
}

function fun3(): void { // 返回 `undefined`
    return undefined;
}
```

- 注意：TS 中 `void` 和 `undefined` 是不一样的。如果约束函数的返回值类型为 `undefined`：

```ts
// function fun1(): undefined {} // 没有返回值，直接飘红

function fun2(): undefined { // 返回 `undefined`
    return;
}

function fun3(): undefined { // 返回 `undefined`
    return undefined;
}
```

2. `never` 修饰的函数，没有返回值（一般在有报错的情况下使用）
   任何类型都不可以分配给 `never`，除了 `never` 本身

```ts
function fun(): never {
    throw new Error("error");
}
```

## array & tuple

1. array 类型的写法：写法1 - `XXX[]`、 写法2 - `Array<XXX>` (泛型写法)

```ts
let array1: number[]; // 元素为 number 类型
let array2: Array<string>; // 元素为 string 类型
```

2. tuple 类型的写法：`[XXX, XXX]` (其实就是固定长度的数组)

```ts
let tuple1: [string, number]; // 表示第 1 元素为 string 类型、 第 2 元素为 number 类型的数组
```

## enum

1. 当只有指定的几个值时，可以使用枚举类型

```ts
enum Gender { male, female }; // 创建枚举
let obj = { name: "superman", gender: Gender.male }; // 使用枚举
// 此时 obj 的类型被约束为 { name: string; gender: Gender }
```

- 此时，数据库中存储的是数值 0 1，但使用时 需通过 `Gender.male` 的方式使用，既节省了存储空间，又使代码语义化

2. 可以给枚举类型设置默认值

```ts
enum direction1 { left, right, up, down }
console.log(direction1.down); // 3

enum direction2 { left = 2, right, up, down }
console.log(direction2.down); // 5
```

## object

- `object` 用于约束类型为引用类型

```ts
let obj: object;
obj = {};
obj = function () {};
```

- JS 中 万物皆对象，使用 `object` 其实并没有很好地起到约束类型的作用
- 推荐使用 [字面量] 约束类型为特定的 [对象类型]

## Function

- 全局性的 `Function` 类型描述了诸如 `bind`、`call`、`apply` 等函数值的属性
- `Function` 类型的值总是可以被调用，这些调用的返回值为 `any` 类型

```ts
function fun(fn: Function) {
    return fn();
}

let result = fun(() => "superman"); // result 为 any 类型
console.log("result", result); // result superman
```

- TS 中不建议使用 any 类型的值
- 推荐使用 [箭头函数] 约束类型为特定的 [函数类型]

# 联合类型

- 用 `|` 连接多个类型 - 表示满足其中一个条件

```ts
let gender: "male" | "famale"; // 约束 gender 只能为 "male" 或 "famale"
let age: string | number; // 约束 age 只能为 string 或 number 类型
```

- 使用联合类型时，需要注意接收的数据具体是什么类型的，才能执行具体的操作


```ts
function showName(name: string | number) {
    if (typeof name === "number") console.log(name);
    else console.log(name.toLocaleUpperCase());
}
showName("superman");
```

- 注意："大" 类型的变量不能直接赋值给 "小" 类型的变量

```ts
let identity = "user"; // 此时 identity 的类型被约束为 string
function showIdentity(id: "user" | "root" | "superRoot"): void {
    console.log("id", id);
}

// showIdentity(identity);
// 直接飘红，因为类型 `string` 比 `"user" | "root" | "superRoot"` "大"
// 需要约束其类型比 `"user" | "root" | "superRoot"` "小"，才能正常使用
```

- 此时可以使用 **[类型断言]**

```ts
let identity = "user";
function showIdentity(id: "user" | "root" | "superRoot"): void {
    console.log("id", id);
}

showIdentity(<"user" | "root">identity); // 表示你确保 identity 只会是 "user" / "root"
showIdentity(identity as "user" | "root");
```

- 此外，还能在定义变量时使用 **`as const`** 约束变量类型为当前 **[字面量]**

```ts
let identity = "user" as const; // 此时 identity 的类型被约束为 "user"
function showName(id: "user" | "root" | "superRoot"): void {
    console.log("id", id);
}

showName(identity); // 可以直接使用，因为类型 `"user"` 比 `"user" | "root" | "superRoot"` "小"
```

- 与 [联合类型 `|`] 相对的，还有 [交叉类型 `&`]：用于连接多个条件 - 表示满足所有条件

```ts
let obj1: { name: string, age: number } // 与 obj2 等效
let obj2: { name: string } & { age: number } // 与 obj1 等效
```

# 类型的别名

如果类型很长，可以给类型起别名：`type XX = XXX`

> #### demo1：对于 [联合类型]

```ts
let num1: 1 | 2 | 3 | 4 | 5 = 1;
let num2: 1 | 2 | 3 | 4 | 5 = 2;
```

```ts
type MyType = 1 | 2 | 3 | 4 | 5;
let num1: MyType = 1;
let num2: MyType = 2;
```

> #### demo2：对于 [对象类型]

```ts
const obj1: { name: string; age: number } = { name: "superman", age: 21 };
const obj2: { name: string; age: number } = { name: "monster", age: 20 };
```

```ts
type ObjType = { name: string; age: number };
const obj1: ObjType = { name: "superman", age: 21 };
const obj2: ObjType = { name: "monster", age: 20 };
```

> #### demo3：对于 [函数类型]

```ts
let sum: (num1: number, num2: number) => number = (num1, num2) => num1 + num2;
let sub: (num1: number, num2: number) => number = (num1, num2) => num1 - num2;
```

```ts
type FunType = (num1: number, num2: number) => number;
let sum: FunType = (num1, num2) => num1 + num2;
let sub: FunType = (num1, num2) => num1 - num2;
```
