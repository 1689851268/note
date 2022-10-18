# 类

## 类的使用

```ts
class Person {
    name: string = "superman"; // 定义实例属性
    static age: number = 21; // 定义类属性 ( 静态属性 )
    // 属性需要在定义时就初始化

    // 定义实例方法
    sayName() {
        console.log("使用实例方法", this); // this 指向当前实例
    }

    // 定义类方法 ( 静态方法 )
    static sayHello() {
        console.log("使用类方法", this); // this 指向当前类
    }
}

const per = new Person();

console.log("访问实例属性", per.name); // 访问实例属性 superman
console.log("访问类属性", Person.age); // 访问类属性 21

per.sayName(); // 调用实例方法    使用实例方法 Person { name: 'superman' }
Person.sayHello(); // 调用类方法    [class Person] { age: 21 }
```

> #### 类表达式

```ts
// 创建匿名类，并赋值给变量
const MyClass = class {
    name = "superman";
};

const myClass = new MyClass();
console.log(myClass); // MyClass { name: 'superman' }
```

> #### `this` 指向

```ts
class Person {
    name = "Person";
    getName() {
        return this.name;
    }
}
const person = new Person();
console.log(person.getName()); // Person

const superman = {
    name: "superman",
    getName: person.getName,
};
console.log(superman.getName()); // superman
```

如果在类中使用箭头函数：

```ts
class Person {
    name = "Person";
    getName = () => this.name;
}
const person = new Person();
console.log(person.getName()); // Person

const superman = {
    name: "superman",
    getName: person.getName,
};
console.log(superman.getName()); // Person
```

## 只读属性

- 可以通过 `readonly` 设置属性只读

```ts
class Person {
    readonly name: string = "superman"; // 定义只读实例属性
    static readonly age: number = 21; // 定义只读类属性 ( static 和 readonly 的位置不能调换 )
}

const per = new Person();

console.log(per.name); // superman
console.log(Person.age); // 21

// per.name = "superwoman" // 直接飘红
// Person.age++ // 直接飘红
```

## 构造函数

- 构造函数 `constructor` 会在创建实例对象 `new Xxx()` 时执行
- 构造函数的 `this` 指向当前实例

```ts
class Person {
    // 在类中 定义属性
    readonly name: string;
    age: number;

    // 构造函数
    constructor(name: string = "小明", age: number = 21) {
        // 在构造函数中 初始化属性
        this.name = name;
        this.age = age;
    }
}

const per1 = new Person();
const per2 = new Person("小王", 32);

console.log("per1", per1); // per1 Person { name: '小明', age: 21 }
console.log("per2", per2); // per2 Person { name: '小王', age: 32 }
```

## 参数属性

正常情况下，类的编写：

```ts
class Person {
    name: string;
    age: number;
    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
    }
}
```

使用 [参数属性]：（即上例的语法糖，与上例等效）

```ts
class Person {
    constructor(public name: string, public age: number) {}
}
```

## 类的继承

```ts
class Person {
  constructor(public name: string = "小明") {}
  showClass() {
    console.log("person");
  }
  showName() {
    console.log("showName", this.name);
  }
}

// 子类会拥有父类所有的方法和属性 (可以理解为，将父类中的方法属性都复制到子类中了)
class Student extends Person {
  // 如果子类中写的方法和父类中的方法同名，会覆盖父类中的方法
  showClass() {
    console.log(this.name); // 获取子类继承自父类的属性
    this.showName(); // 调用子类继承自父类的方法
  }
}

const per = new Person();
console.log("per", per); // per Person { name: '小明' }
per.showClass(); // person

const stu = new Student("小王");
console.log("stu", stu); // stu Student { name: '小王' }
stu.showClass(); // student    showName 小王
```

- 约束为 [派生类的变量]，除了可以被赋值为 [派生类的实例]，还可以被赋值为 [基类的实例]：
  被约束为子类的变量，可以接收父类实例；反之则不行

```ts
class Person {
    sayHello() {
        console.log("person");
    }
}

class Student extends Person {
    sayHello() {
        console.log("student");
    }
}

let student: Student = new Person(); // 该变量的类型被约束为 Student，但也可以被赋值为 Person 的实例
student.sayHello(); // person
```

> #### 关于静态属性/方法

- 在子类中，可通过 [子类] 访问父类的静态属性/方法，因为静态属性/方法也会被继承
- 当然，也可以通过 [父类] 访问

```ts
class Person {
    static age = 21;
    static showAge() {
        return Person.age;
    }
}

class Student extends Person {
    show() {
        console.log(Person.age); // 通过 [父类] 访问
        console.log(Student.showAge()); // 通过 [子类] 访问
    }
}

const student = new Student();
student.show(); // 21    21
```

## super 关键字

用于访问 [父类实例] 的属性/方法

```ts
class Person {
    constructor(public name: string = "小明") {}
    showClass() {
        console.log("person");
    }
}

class Student extends Person {
    constructor(name: string = "大明", public age: number = 21) {
        super(name); // 在子类的 constructor 函数中，[必须] 调用父类的 constructor 函数
    }
    // 重写方法
    showClass(): void {
        console.log("student");
        super.showClass(); // 在子类的方法中，[可] 调用父类的重名方法
    }
}

const per = new Person();
console.log("per", per); // per Person { name: '小明' }
per.showClass(); // person

const stu = new Student();
console.log("stu", stu); // stu Student { name: '大明', age: 21 }
stu.showClass(); // student    person
```

> #### 类的初始化顺序：

初始化基类的字段 → 运行基类的构造函数 → 初始化派生类的字段 → 运行派生类的构造函数

```ts
class Person {
    constructor(public name: string = "person") {
        console.log(this.name);
    }
}

class Student extends Person {
    constructor(public name: string = "student") { // 覆盖父类的同名属性
        super(); // super() 必须写在派生类的构造函数的最前面
        console.log(this.name);
    }
}

let student: Student = new Student(); // person    student
```

> #### 关于继承内置类型：

- ES6 及以上 可正常运行
- ES6 以下 会出错，需要设置原型链

```ts
class MsgError extends Error {
    constructor(msg: string) {
        super(msg);
    }
    showMsg() {
        console.log("showMsg → ", this.message); // 获取继承自父类的属性
    }
}
const msgError = new MsgError("myError");
msgError.showMsg(); // showMsg →  myError
console.log(msgError instanceof Error); // true
```

## 抽象类 & 抽象方法

- 关于抽象类：一些属性的命名已被内置，开发者命名时 需避开（eg：`name`、`length`...）

```ts
// 抽象类：仅供继承使用，不能用于创建实例
abstract class Person {
    constructor(public name: string = "superman") {}
    // 抽象方法：仅供重写使用，只需定义函数、并声明返回值的类型，无需编写函数体
    // 子类中必须重写 [抽象方法]
    abstract sayHello(): void;
    // 抽象方法只能出现在抽象类中
}

class Student extends Person {
    constructor(name: string = "superStudent", public age: number = 21) {
        super(name);
    }
    // 重写方法
    sayHello() {
        // super.sayHello(); // 此时 无法在子类方法中调用父类方法
        console.log("student");
    }
}

const stu = new Student();

console.log("stu", stu); // stu Student { name: 'superStudent', age: 21 }
stu.sayHello(); // student
```

- 对于 [抽象方法]，[实现函数] 的参数类型需要兼容 [定义函数] 的参数类型

```ts
abstract class Person {
    abstract sayHello(s: string): void; // [实现函数] 的参数类型为 string
}

class Student extends Person {
    sayHello(s: number | string) { // [定义函数] 的参数类型为 number | string
        console.log("s", s);
    }
}
```

## 属性的封装

1. `public` - 公共属性/方法，可以在任何地方访问(修改)（默认）
2. `protect` - 受保护的属性/方法，可以在当前类及其子类中访问(修改)
3. `private` - 私有属性/方法，只可以在当前类中访问(修改)

```ts
class Person {
    name: string; // public 属性
    private $_age: number; // private 属性 - 我们约定 private 属性以 $_ 开头
    constructor(name: string = "superman", age: number = 21) {
        this.name = name;
        this.$_age = age;
    }
}

const per = new Person();
console.log("name", per.name); // name superman
// console.log("age", per.$_age); // 直接飘红
```

- 在类的外部，想要访问私有属性，需要设置专门的方法获取

```ts
class Person {
    constructor(private $_age: number = 21) {}

    // 访问私有属性 age
    getAge(): number {
        return this.$_age;
    }

    // 设置私有属性 age
    setAge(age: number): void {
        this.$_age = age > 0 ? age : 0;
    }
}

const per = new Person();
console.log("age", per.getAge()); // age 21
per.setAge(31);
console.log("age", per.getAge()); // age 31
```

- 可以跨实例访问私有属性：

```ts
class Person {
    constructor(private $_age: number = 21) {}
    showAge(otherPerson: Person) {
        console.log(otherPerson.$_age);
    }
}

const person1 = new Person();
const person2 = new Person(32);
person1.showAge(person2); // 32
```

- 可以使用 `#` 修饰属性/方法，与 `private` 等效：
  `#` 不能作为形参使用

```ts
class Person {
    #age = 21;
    showAge() {
        return this.#age;
    }
}

const person = new Person();
console.log(person.showAge());
// console.log(person.#age); // 直接飘红
```

## getter & setter

用于 [获取] / [修改] 属性，一般用于操作私有属性

- 如果属性存在 getter，而不存在 setter，则该属性是只读的

- 如果没有指定 setter 参数的类型，将从 getter 的返回类型中推断出来

  setter 参数的类型必须兼容 getter 的返回类型

- setter 和 getter 必须有相同的成员可见性

```ts
class Person {
    constructor(private $_age: number = 21) {}

    // getter - age 被访问时调用
    get age(): number {
        console.log("getter");
        return this.$_age;
    }

    // setter - age 被修改时调用 - 不能设置返回值类型!
    set age(age: number) {
        console.log("setter");
        this.$_age = age > 0 ? age : 0;
    }
}

const per = new Person();
console.log("age", per.age); // getter    age 21
per.age = 31; // setter
console.log("age", per.age); // getter    age 22
```

## 类型守卫

- 在父类中，可以通过关键字 **`is`** 约束 `this` 的指向
- 使用方法：`XXX(): this is XX { return true/false }`
  只要函数 `XXX` 返回 `true`，`this` 就指向 `XX`

```ts
class FileSystemObject {
    constructor(public path: string, private networked: boolean) {}

    isFileRep(): this is FileRep { // this 指向子类 FileRep
        return this instanceof FileRep;
    }

    isDirectory(): this is Directory { // this 指向子类 Directory
        return this instanceof Directory;
    }
}

class FileRep extends FileSystemObject { // FileRep 继承 FileSystemObject
    constructor(path: string, public content: string) {
        super(path, false);
    }
}

class Directory extends FileSystemObject { // Directory 继承 FileSystemObject
    constructor(public children: FileSystemObject[] = []) {
        super("", false);
    }
}

const fso: FileSystemObject = new FileRep("foo/bar.txt", "foo");

if (fso.isFileRep()) {
    console.log(fso.content); // foo
} else if (fso.isDirectory()) {
    console.log(fso.children);
}
```

## 索引签名

```ts
class MyClass {
    [s: string]: boolean | ((s: string) => boolean);
    // 约束了类的 [属性] & [方法] 的类型

    x = true;
    check(s: string) {
        return this[s] as boolean;
    }
}

const myClass = new MyClass();
console.log(myClass.check("x")); // true
```

## 类之间的关系

- 如果两个类的成员及其约束都一样，则这两个类可以相互替代使用

```ts
class Person {
    name: string = "person";
}

class Student {
    name: string = "student";
}

const person: Person = new Student();
```

- 对于被约束为 "小" 类的变量，可以接收 "大" 类的实例；反之则不行

```ts
class Person {
    name = "person";
}

class Student {
    name = "student";
    age = 21;
}

const student: Person = new Student();
// const person: Student = new Person(); // 直接飘红
```

# 接口

## 约束对象的类型

```ts
interface MyInterface {
    name: string;
    age: number;
}
const obj: MyInterface = { name: "superman", age: 21 };
console.log("obj", obj); // obj {name: 'superman', age: 21}
```

我们来对比一下 [类型别名]

```ts
type MyType = { name: string; age: number };
const obj: MyType = { name: "superman", age: 21 };
console.log("obj", obj); // obj {name: 'superman', age: 21}
```

- `interface` 可以重复定义
- `type` 不能重复定义


```ts
interface MyInterface {
    name: string;
    age: number;
}
interface MyInterface {
    gender: string;
}
```

此时等同于：

```ts
interface MyInterface {
    name: string;
    age: number;
    gender: string;
}
```

- `interface` 可以通过 `extends` 扩展类型
   如果同时继承多个父级，父级之间用 `,` 隔开
- `type` 可以通过 `&` 扩展类型

```ts
interface Animal {
    name: string;
}
interface Terrestrial {
    move: string;
}
interface Cat extends Animal, Terrestrial {
    climbTree: boolean;
}
```

```ts
type Animal = { name: string };
type Terrestrial = { move: string };
type Cat = Animal & Terrestrial & { climbTree: boolean };
```

tips：[交叉类型 `&`] 可以作用于 `interface`

```ts
interface Animal {
    name: string;
}
interface Terrestrial {
    move: string;
}
type Cat = Animal & Terrestrial & { climbTree: boolean };
```

## 约束类的结构

- 使用 **`implements`** 实现 [接口]，进而约束类的结构

```ts
// 接口中 所有的属性都不能有实际的值
//        所有的方法都是抽象方法
interface MyInterface {
    name: string;
    sayHello(): void;
}
// 就是说 接口中有什么属性，继承该接口的类中 就需要定义什么属性
//        接口中有什么方法，继承该接口的类中 就需要实现什么方法

// 使用 implements 实现接口 （此时不能使用 super 关键字）
class MyClass implements MyInterface {
    // 定义接口的属性
    constructor(public name: string) {}
    // 实现接口的方法
    sayHello(): void {
        console.log("MyClass");
    }
}

const myClass = new MyClass("superman");
console.log("myClass", myClass); // myClass MyClass { name: 'superman' }
```

# 泛型

## 泛型的使用

如果类型不确定，可以使用泛型

> #### 配合 function 使用

```ts
function fun<T>(val: T): T {
    return val;
}

fun(1); // 直接调用 不指定泛型，TS 会自动判断类型
fun<string>("superman"); // 指定泛型
```

- 泛型可以同时指定多个


```ts
function fun<T, K>(val1: T, val2: K): T {
    console.log("val1", val1);
    console.log("val2", val2);
    return val1;
}

fun<string, number>("superman", 21);
```

- 注意：使用泛型时，需要注意兼容性：

```ts
function show<T>(arg: T): T {
    console.log(arg.length); // 直接飘红，因为 T 这个类型不一定有 length 属性
    return arg;
}
```

我们可以使用特定的写法，以保证传进来的类型一定有 `length` 属性，比如：

```ts
function show<T>(arg: T[]): T[] {
    console.log(arg.length);
    return arg;
}
```

> #### 配合 class 使用

```ts
class Person<T> {
    constructor(public name: T) {}
}

const per1 = new Person("superman"); // 直接调用 不指定泛型，TS 会自动识别
const per2 = new Person<string>("superwoman"); // 指定泛型
const per3: Person<string> = new Person("superwoman"); // 通过泛型约束变量
```

- **注意：[静态属性] / [静态方法] 不能使用泛型**

> #### 配合 interface 使用

```ts
interface Person<T> {
    feature: T;
}
let person1: Person<string> = { feature: "handsome" }; // 必须指定泛型
type personType = Person<string[]>; // 起别名
let person2: personType = { feature: ["handsome", "responsible"] };
```

> #### 配合 type 使用

```ts
type Person<T> = { feature: T };
type OrNull<T> = T | null;
type OneOrMany<T> = T | T[];
type OneOrManyOrNull<T> = OrNull<OneOrMany<T>>;

let person: Person<string> = { feature: "handsome" }; // 必须指定泛型
let orNull: OrNull<string> = "value";
let oneOrMany: OneOrMany<string> = ["value1", "value2"];
let oneOrManyOrNull: OneOrManyOrNull<string> = null;
```

## 泛型约束

- 泛型可以使用 `extends` 继承 [接口]，进而约束泛型的结构

```ts
interface Inter {
    length: number;
}

// T extends Inter 表示泛型 T 必须是 Inter 的实现类(子类)
function fun<T extends Inter>(val: T): T {
    console.log(val.length);
    return val;
}

// 参数必须是含有 length 属性的对象
fun({ length: 10 }); // T → { length: number }
fun([1, 2, 3, 4, 5]); // T → number[]
fun("superman"); // T → "superman"
fun<string>("superman"); // T → string
```

可以配合 `keyof` 等关键字约束泛型：

```ts
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

const person = { name: "superman", age: 21 };
console.log(getProperty(person, "name")); // superman
```

## 泛型类型

> #### 约束函数的类型

- 配合 [字面量] 使用：

```ts
function show<T>(arg: T): T {
    return arg;
}
let myShow: <T>(arg: T) => T = show;
```

- 配合 [调用签名] 使用：

```ts
function show<T>(arg: T): T {
    return arg;
}
let myShow: { <T>(arg: T): T } = show;
```

这样，就能把 [泛型类型] 抽出来啦

```ts
function show<T>(arg: T): T {
    return arg;
}

interface ShowType {
    <T>(arg: T): T;
}
let myShow: ShowType = show;

console.log(myShow(1000)); // 1000
console.log(myShow("superman")); // superman
```

- 配合 [接口] 约束：（上例的另一种写法）

```ts
function show<T>(arg: T): T {
    return arg;
}

interface ShowType<T> {
    (arg: T): T; // 这里也使用了调用签名
}
let myShowStr: ShowType<string> = show;
// 这种写法更为严谨，需要使用者自己传入泛型值

console.log(myShowStr("superman"));
// console.log(myShowStr(1000)); // 直接飘红
```

> #### 约束 Class 的类型

```ts
class BeeKeeper {
    mask: boolean = true;
}

class Animal {
    public legsNum: number = 4;
}

class Bee extends Animal {
    keeper: BeeKeeper = new BeeKeeper();
}

// 使用工厂函数
// 约束 [函数参数] 的类型为 "构造函数"
// 约束 [类] 必须继承自 Animal
function createAnimal<T extends Animal>(ctor: new () => T): T {
    return new ctor();
}

console.log(createAnimal(Bee)); // Bee { legsNum: 4, keeper: BeeKeeper { mask: true } }
// console.log(createAnimal(ZooKeeper)); // 直接飘红
```

# 开发编写流程

> #### ① 编写接口

把 interface 的编写单独放到一个文件中并导出：

```ts
/* type.ts */
interface IHobby {
    name: string;
    level: number;
}

interface IItem {
    name: string;
    age: number;
    hobbies: IHobby[];
}

export type { IItem, IHobby }; // 注意这里导出的是类型
```

上例也可以写成：

```ts
/* type.ts */
export type IHobby = {
    name: string;
    level: number;
};

export type IItem = {
    name: string;
    age: number;
    hobbies: IHobby[];
};
```

> #### ② 编写类

将类型导入一个专门用于创建类的文件，创建对应的 class 并导出：

```ts
import type { IItem, IHobby } from "./type"; // 导入类型

// 创建对应的类
export class Item implements IItem {
    name: string;
    age: number;
    hobbies: IHobby[];
    constructor(name: string = "", age: number = 0, hobbies: IHobby[] = []) {
        this.name = name;
        this.age = age;
        this.hobbies = hobbies;
    }
}
```

> #### ③ 编写逻辑代码

在文件中导入需要的类并使用：

```html
<template>
    <h1>{{ obj1 }}</h1>
    <h1>{{ obj2 }}</h1>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Item } from "../utils/class"; // 导入需要的 class

// 使用 class
const obj1 = ref(new Item("superman", 21, [{ name: "coding", level: 1 }]));
const obj2 = ref(new Item());
</script>
```

