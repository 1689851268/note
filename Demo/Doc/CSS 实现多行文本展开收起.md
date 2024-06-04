# 位于右下角的“展开收起”按钮

1. 多行文本截断

```html
<div class="text">
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit quis
    laborum culpa, placeat sapiente soluta necessitatibus nobis, ipsum harum
    illo quaerat accusantium dolores. Minima fuga nisi dignissimos reprehenderit
    ut amet.
</div>
```

```css
.text {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
}
```

2. 右下角环绕效果

提到文本环绕效果，一般能想到 浮动 float ，没错千万不要以为浮动已经是过去式了，具体的场景还是很有用的；比如下面放一个按钮，然后设置浮动

```html
<div class="text">
    <button class="btn">展开</button>
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit quis
    laborum culpa, placeat sapiente soluta necessitatibus nobis, ipsum harum
    illo quaerat accusantium dolores. Minima fuga nisi dignissimos reprehenderit
    ut amet.
</div>
```

```css
.btn {
    float: right;
}
```

如果有多个浮动元素会怎么样呢？这里用伪元素来 ::before 代替

```css
.text::before {
    content: "";
    float: right;
    width: 10px;
    height: 50px; /* 先随便设置一个高度 */
    background: red;
}
```

现在按钮到了伪元素的左侧，如何移到下面呢？很简单，清除一下浮动 `clear: both` 就可以了

```css
.btn {
    float: right;
    clear: both;
}
```

可以看到，现在文本是完全环绕在右侧的两个浮动元素了，只要把红色背景的伪元素宽度设置为 0（或者不设置宽度，默认就是 0），就实现了右下角环绕的效果

```css
.text::before {
    content: "";
    float: right;
    height: 50px; /* 先随便设置一个高度 */
}
```

3. 动态高度

这里可以利用 flex 布局。大概的方法就是在 flex 布局的子项中，可以通过百分比来计算变化高度。然后用 calc 计算，用整个容器高度减去按钮的高度即可。

因此，这里需要给 `.text` 包裹一层，然后设置 `display: flex`

```html
<div class="wrap">
    <div class="text">
        <button class="btn">展开</button>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit
        quis laborum culpa, placeat sapiente soluta necessitatibus nobis, ipsum
        harum illo quaerat accusantium dolores. Minima fuga nisi dignissimos
        reprehenderit ut amet.
    </div>
</div>
```

```css
.wrap {
    display: flex;
}

.text::before {
    content: "";
    float: right;
    height: calc(100% - 24px);
}
```

除此之外，动态高度也可以采用负的 margin 来实现（性能会比 calc 略好一点）

```css
.text::before {
    content: "";
    float: right;
    height: 100%;
    margin-bottom: -24px;
}
```

4. 其他浏览器的兼容处理

safari 和 firefox 下使用 `display: -webkit-box` 会有问题，原本的文本好像变成了一整块，浮动元素也无法产生环绕效果，去掉之后浮动就正常了。

可以添加一个行高 `line-height`，如果需要设置成 3 行，那高度就设置成 `line-height * 3`

```css
.text {
    line-height: 1.5;
    max-height: 4.5em;
    overflow: hidden;
}
```

为了方便更好的控制行数，这里可以把常用的行数通过属性选择器独立出来（通常不会太多），如下

```css
[line-clamp="1"] {
    max-height: 1.5em;
}

[line-clamp="2"] {
    max-height: 3em;
}

[line-clamp="3"] {
    max-height: 4.5em;
}
```

```html
<!-- 3 行 -->
<div class="text" line-clamp="3">...</div>

<!-- 5 行 -->
<div class="text" line-clamp="5">...</div>
```

可以看到基本上正常了，除了没有省略号，现在加上省略号吧，跟在展开按钮之前就可以了，可以用伪元素实现

```css
.btn {
    float: right;
    clear: both;
    position: relative;
}

.btn::before {
    content: "...";
    position: absolute;
    left: -10px;
    color: #333;
    transform: translateX(-100%);
}
```

<br><br>

# “展开” 和 “收起” 两种状态

提到 CSS 状态切换，大家都能想到 input type="checkbox" 吧。这里我们也需要用到这个特性，首先加一个 input ，然后把之前的 button 换成 label ，并且通过 for 属性关联起来

```html
<div class="wrap">
    <input type="checkbox" id="exp" />
    <div class="text">
        <label class="btn" for="exp">展开</label>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit
        quis laborum culpa, placeat sapiente soluta necessitatibus nobis, ipsum
        harum illo quaerat accusantium dolores. Minima fuga nisi dignissimos
        reprehenderit ut amet. Lorem ipsum dolor, sit amet consectetur
        adipisicing elit. Rem consequatur voluptatem quam molestiae, repellat
        nisi obcaecati qui aliquid eveniet? Blanditiis vitae vero, sit ab
        tempora rerum illo velit sapiente neque.
    </div>
</div>
```

```css
#exp {
    display: none;
}
```

这样，在点击 label 的时候，实际上是点击了 input 元素，现在来添加两种状态，分别是只显示 3 行和不做行数限制

```css
#exp:checked + .text {
    -webkit-line-clamp: 999; /* 设置一个足够大的行数就可以了 */
}
```

兼容版本可以直接设置最大高度 max-height 为一个较大的值，或者直接设置为 none

```css
#exp:checked + .text {
    max-height: none;
}
```

<br>

这里还有一个小问题，“展开”按钮在点击后应该变成“收起”，如何修改呢？

有一个技巧，凡是碰到需要动态修改内容的，都可以使用伪类 content 生成技术，具体做法就是去除或者隐藏按钮里面的文字，采用伪元素生成

先去除按钮文字

```html
<label class="btn" for="exp"></label>
```

采用 content 生成：

```css
.btn::after {
    content: "展开";
}
```

添加 :checked 状态：

```css
#exp:checked + .text .btn::after {
    content: "收起";
}
```

兼容版本由于前面的省略号是模拟出来的，不能自动隐藏，所以需要额外来处理

```css
#exp:checked + .text .btn::before {
    display: none;
}
```

<br>

还有一点，如果给 max-height 设置一个合适的值，还能加上过渡动画

```css
.text {
    transition: max-height 0.5s;
}

#exp:checked + .text {
    max-height: 500px; /* 超出最大行高度一点点即可 */
}
```

<br><br>

# 文本行数的判断

上面的交互已经基本满足要求了，但是还是会有问题。比如当文本较少时，此时是没有发生截断，也就是没有省略号的，但是“展开”按钮却仍然位于右下角，如何隐藏呢？

通常 js 的解决方式很容易，比较一下元素的 scrollHeight 和 clientHeight 即可，然后添加相对应的类名。下面是伪代码

```js
if (scrollHeight > clientHeight) {
    // 添加展开按钮
} else {
    // 隐藏展开按钮
}
```

那么，CSS 如何实现这类判断呢？

可以肯定的是，CSS 是没有这类逻辑判断，大多数我们都需要从别的角度，采用 “障眼法” 来实现。比如在这个场景，当没有发生截断的时候，表示文本完全可见了，这时，如果在文本末尾添加一个元素（红色小方块），为了不影响原有布局，这里设置了绝对定位

```css
.text {
    position: relative;
}

.text::after {
    content: "";
    width: 10px;
    height: 10px;
    position: absolute;
    background: red;
}
```

可以看到，当省略号出现时，红色小方块必定消失，因为已经被挤下去了，这里把父级 overflow: hidden 暂时隐藏就能看到是什么原理了

然后，可以把刚才这个红色的小方块设置一个足够大的尺寸，比如 100% × 100%

```css
.text::after {
    content: "";
    width: 100%;
    height: 100%;
    position: absolute;
    background: red;
}
```

可以看到，红色的块块把右下角的都覆盖了，现在把背景改为白色（和父级同底色）

```css
.text::after {
    content: "";
    width: 100%;
    height: 100%;
    position: absolute;
    background: #fff;
}
```

现在展开以后，发现按钮不见（被刚才那个伪元素所覆盖，并且也点击不了），如果希望点击以后仍然可见呢？添加一下 :checked 状态即可，在展开时隐藏覆盖层

```css
#exp:checked + .text::after {
    visibility: hidden;
}
```

这样，就实现了在文字较少的情况下隐藏展开按钮的功能
