# 容器查询

CSS 容器查询，顾名思义，就是可以动态查询到容器的尺寸，然后设置不同的样式。

比如有这样一个容器

```html
<div class="card">
    <h2>欢迎关注前端侦探</h2>
</div>
```

```css
.card {
    display: grid;
    place-content: center;
    width: 350px;
    height: 200px;
    background-color: #ffe8a3;
    border-radius: 8px;
    border: 1px dashed #9747ff;
}
```

现在这个容器宽度是 350px，现在希望在宽度小于 250px 时文字颜色变为绿色，要怎么做呢？

非常简单，只需要规定一下容器的类型，然后写一个查询语句就行了，关键实现如下

```css
.card {
    container-type: size;
}
@container (width < 250px) {
    .card h2 {
        color: #14ae5c;
    }
}
```

<br><br>

# 容器查询的局限

1. 容器查询不可更改容器本身样式

比如像这样，直接改颜色是不生效的：

```css
.card {
    container-type: size;
}
@container (width < 250px) {
    .card {
        color: #14ae5c;
    }
}
```

也无法通过 `:has` 去匹配父级：

```css
.card {
    container-type: size;
}
@container (width < 250px) {
    body:has(.card h2) {
        color: #14ae5c;
    }
}
```

<br>

2. 容器必须手动指明尺寸，不可以由内容撑开，也就是自适应内容尺寸

比如我们将上面的宽高去除

可以看到，在设置成容器查询类型后，「容器的宽高都变成了 0」，必须手动设置宽高

<br>
