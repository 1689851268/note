interface Inter {
    length: number;
}

// T extends Inter 表示泛型 T 必须是 Inter 的实现类(子类)
function fun<T extends Inter>(val1: T): T {
    return val1;
}

// 必须是含有 length 属性的对象
fun({ length: 18 });
fun([1]);
fun("superman");
