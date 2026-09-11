# 用户界面 (UI)

---

本页前半部分保留布局与控件属性教程，后半部分给出按 Monkey King 6.7.0 源码提交 `bafa2986212d27b6b59f1324f89548b72a810966` 核对的运行时 API 合同。

---

ui模块提供了编写用户界面的支持.

    给Android开发者或者高阶用户的提醒, Monkey King的UI系统来自于Android, 所有属性和方法都能在Android源码中找到. 如果某些代码或属性没有出现在Monkey King的文档中, 可以参考Android的文档.
    View: https://developer.android.google.cn/reference/android/view/View?hl=cn
    Widget: https://developer.android.google.cn/reference/android/widget/package-summary?hl=cn

带有ui的脚本的最前面必须使用`"ui";`指定ui模式, 否则脚本将不会以ui模式运行. 正确示范:

```
"ui";

//脚本的其他代码
```

字符串"ui"的前面可以有注释、空行和空格**[v4.1.0新增]**, 但是不能有其他代码.

界面是由视图(View)组成的. View分成两种, 控件(Widget)和布局(Layout). 控件(Widget)用来具体显示文字、图片、网页等, 比如文本控件(text)用来显示文字, 按钮控件(button)则可以显示一个按钮并提供点击效果, 图片控件(img)则用来显示来自网络或者文件的图片, 除此之外还有输入框控件(input)、进度条控件(progressbar)、单选复选框控件(checkbox)等；布局(Layout)则是装着一个或多个控件的"容器", 用于控制在他里面的控件的位置, 比如垂直布局(vertical)会把他里面的控件从上往下依次显示(即纵向排列), 水平布局(horizontal)则会把他里面的控件从左往右依次显示(即横向排列), 以及帧布局(frame), 他会把他里面的控件直接在左上角显示, 如果有多个控件, 后面的控件会重叠在前面的控件上.

我们使用xml来编写界面, 并通过`ui.layout()`函数指定界面的布局xml. 举个例子：

```
"ui";
$ui.layout(
    <vertical>
        <button text="第一个按钮"/>
        <button text="第二个按钮"/>
    </vertical>
);
```

在这个例子中, 第3~6行的部分就是xml, 指定了界面的具体内容. 代码的第3行的标签`<vertical> ... </vertical>`表示垂直布局, 布局的标签通常以`<...>`开始, 以`</...>`结束, 两个标签之间的内容就是布局里面的内容, 例如`<frame> ... </frame>`. 在这个例子中第4, 5行的内容就是垂直布局(vertical)里面的内容. 代码的第4行是一个按钮控件(button), 控件的标签通常以`<...`开始, 以`/>`结束, 他们之间是控件的具体属性, 例如`<text ... />`. 在这个例子中`text="第一个按钮"`的部分就是按钮控件(button)的属性, 这个属性指定了这个按钮控件的文本内容(text)为"第一个按钮".

代码的第5行和第4行一样, 也是一个按钮控件, 只不过他的文本内容为"第二个按钮". 这两个控件在垂直布局中, 因此会纵向排列, 效果如图：

![ex1](/images/ex1.png)

如果我们把这个例子的垂直布局(vertical)改成水平布局(horizontal), 也即：

```
"ui";
ui.layout(
    <horizontal>
        <button text="第一个按钮"/>
        <button text="第二个按钮"/>
    </horizontal>
);
```

则这两个按钮会横向排列, 效果如图：

![ex1-horizontal](/images/ex1-horizontal.png)

一个控件可以指定多个属性(甚至可以不指定任何属性), 用空格隔开即可；布局同样也可以指定属性, 例如:

```
"ui";
ui.layout(
    <vertical bg="#ff0000">
        <button text="第一个按钮" textSize="20sp"/>
        <button text="第二个按钮"/>
    </vertical>
);
```

第三行`bg="#ff0000"`指定了垂直布局的背景色(bg)为"#ff0000", 这是一个RGB颜色, 表示红色(有关RGB的相关知识参见[RGB颜色对照表](http://tool.oschina.net/commons?type=3)). 第四行的`textSize="20sp"`则指定了按钮控件的字体大小(textSize)为"20sp", sp是一个字体单位, 暂时不用深入理会. 上述代码的效果如图：

![ex-properties](/images/ex-properties.png)

一个界面便由一些布局和控件组成. 为了便于文档阅读, 我们再说明一下以下术语：

* 子视图, 子控件: 布局里面的控件是这个布局的子控件/子视图. 实际上布局里面不仅仅只能有控件, 还可以是嵌套的布局. 因此用子视图(Child View)更准确一些. 在上面的例子中, 按钮便是垂直布局的子控件.
* 父视图, 父布局：直接包含一个控件的布局是这个控件的父布局/父视图(Parent View). 在上面的例子中, 垂直布局便是按钮的父布局.

# 视图: View

控件和布局都属于视图(View). 在这个章节中将介绍所有控件和布局的共有的属性和函数. 例如属性背景, 宽高等(所有控件和布局都能设置背景和宽高), 函数`click()`设置视图(View)被点击时执行的动作.

## attr(name, value)

* `name` {string} 属性名称
* `value` {string} 属性的值

设置属性的值. 属性指定是View在xml中的属性. 例如可以通过语句`attr("text", "文本")`来设置文本控件的文本值.

```javascript
"ui";

$ui.layout(
    <frame>
        <text id="example" text="Hello"/>
    </frame>
);

// 5秒后执行
$ui.post(() => {
    // 修改文本
    $ui.example.attr("text", "Hello, Monkey King UI");
    // 修改背景
    $ui.example.attr("bg", "#ff00ff");
    // 修改高度
    $ui.example.attr("h", "500dp");
}, 5000);
```

**注意：**并不是所有属性都能在js代码设置, 有一些属性只能在布局创建时设置, 例如style属性；还有一些属性虽然能在代码中设置, 但是还没支持；对于这些情况, 在Auto.js Pro 8.1.0+会抛出异常, 其他版本则不会抛出异常.

## attr(name)

* `name` {string} 属性名称
* 返回 {string}

获取属性的值.

```javascript
"ui";

$ui.layout(
    <frame>
        <text id="example" text="1"/>
    </frame>
);

plusOne();

function plusOne() {
    // 获取文本
    let text = $ui.example.attr("text");
    // 解析为数字
    let num = parseInt(text);
    // 数字加1
    num++;
    // 设置文本
    $ui.example.attr("text", String(num));
    // 1秒后继续
    $ui.post(plusOne, 1000);
}

```

## w

View的宽度, 是属性`width`的缩写形式. 可以设置的值为`*`, `auto`和具体数值. 其中`*`表示宽度**尽量**填满父布局, 而`auto`表示宽度将根据View的内容自动调整(自适应宽度). 例如：

```
"ui";
ui.layout(
    <horizontal>
        <button w="auto" text="自适应宽度"/>
        <button w="*" text="填满父布局"/>
    </horizontal>
);
```

在这个例子中, 第一个按钮为自适应宽度, 第二个按钮为填满父布局, 显示效果为：

![ex-w](/images/ex-w.png)

如果不设置该属性, 则不同的控件和布局有不同的默认宽度, 大多数为`auto`.

宽度属性也可以指定一个具体数值. 例如`w="20"`, `w="20px"`等. 不加单位的情况下默认单位为dp, 其他单位包括px(像素), mm(毫米), in(英寸). 有关尺寸单位的更多内容, 参见[尺寸的单位: Dimension](#尺寸的单位-dimension).

```
"ui";
ui.layout(
    <horizontal>
        <button w="200" text="宽度200dp"/>
        <button w="100" text="宽度100dp"/>
    </horizontal>
);
```

## h

View的高度, 是属性`height`的缩写形式. 可以设置的值为`*`, `auto`和具体数值. 其中`*`表示宽度**尽量**填满父布局, 而`auto`表示宽度将根据View的内容自动调整(自适应宽度).

如果不设置该属性, 则不同的控件和布局有不同的默认高度, 大多数为`auto`.

宽度属性也可以指定一个具体数值. 例如`h="20"`, `h="20px"`等. 不加单位的情况下默认单位为dp, 其他单位包括px(像素), mm(毫米), in(英寸). 有关尺寸单位的更多内容, 参见[尺寸的单位: Dimension](#尺寸的单位-dimension).

## id

View的id, 用来区分一个界面下的不同控件和布局, 一个界面的id在同一个界面下通常是唯一的, 也就是一般不存在两个View有相同的id. id属性也是连接xml布局和JavaScript代码的桥梁, 在代码中可以通过一个View的id来获取到这个View, 并对他进行操作(设置点击动作、设置属性、获取属性等). 例如：

```
"ui";
ui.layout(
    <frame>
        <button id="ok" text="确定"/>
    </frame>
);
//通过ui.ok获取到按钮控件
toast(ui.ok.getText());
```

这个例子中有一个按钮控件"确定", id属性为"ok", 那么我们可以在代码中使用`ui.ok`来获取他, 再通过`getText()`函数获取到这个按钮控件的文本内容.
另外这个例子中使用帧布局(frame)是因为, 我们只有一个控件, 因此用于最简单的布局帧布局.

## gravity

View的"重力". 用于决定View的内容相对于View的位置, 可以设置的值为:

* `left` 靠左
* `right` 靠右
* `top` 靠顶部
* `bottom` 靠底部
* `center` 居中
* `center_vertical` 垂直居中
* `center_horizontal` 水平居中

例如对于一个按钮控件, `gravity="right"`会使其中的文本内容靠右显示. 例如：

```
"ui";
ui.layout(
    <frame>
        <button gravity="right" w="*" h="auto" text="靠右的文字"/>
    </frame>
);
```

显示效果为:

![ex-gravity](/images/ex-gravity.png)

这些属性是可以组合的, 例如`gravity="right|bottom"`的View他的内容会在右下角.

## layout_gravity

View在布局中的"重力", 用于决定View本身在他的**父布局**的位置, 可以设置的值和gravity属性相同. 注意把这个属性和gravity属性区分开来.

```
"ui";
ui.layout(
    <frame w="*" h="*">
        <button layout_gravity="center" w="auto" h="auto" text="居中的按钮"/>
        <button layout_gravity="right|bottom" w="auto" h="auto" text="右下角的按钮"/>
    </frame>
);
```

在这个例子中, 我们让帧布局(frame)的大小占满整个屏幕, 通过给第一个按钮设置属性`layout_gravity="center"`来使得按钮在帧布局中居中, 通过给第二个按钮设置属性`layout_gravity="right|bottom"`使得他在帧布局中位于右下角. 效果如图：

![ex-layout-gravity](/images/ex-layout-gravity.png)

要注意的是, layout_gravity的属性不一定总是生效的, 具体取决于布局的类别. 例如不能让水平布局中的第一个子控件靠底部显示(否则和水平布局本身相违背).

## margin

margin为View和其他View的间距, 即外边距. margin属性包括四个值:

* `marginLeft` 左外边距
* `marginRight` 右外边距
* `marginTop` 上外边距
* `marginBottom` 下外边距

而margin属性本身的值可以有三种格式:

* `margin="marginAll"` 指定各个外边距都是该值. 例如`margin="10"`表示左右上下边距都是10dp.
* `margin="marginLeft marginTop marginRight marginBottom"` 分别指定各个外边距. 例如`margin="10 20 30 40"`表示左边距为10dp, 上边距为20dp, 右边距为30dp, 下边距为40dp
* `margin="marginHorizontal marginVertical"` 指定水平外边距和垂直外边距. 例如`margin="10 20"`表示左右边距为10dp, 上下边距为20dp.

用一个例子来具体理解外边距的含义：

```
"ui";
ui.layout(
    <horizontal>
        <button margin="30" text="距离四周30"/>
        <button text="普通的按钮"/>
    </horizontal>
);
```

第一个按钮的margin属性指定了他的边距为30dp, 也就是他与水平布局以及第二个按钮的间距都是30dp, 其显示效果如图:

![ex1-margin](/images/ex1-margin.png)

如果把`margin="30"`改成`margin="10 40"`那么第一个按钮的左右间距为10dp, 上下间距为40dp, 效果如图:

![ex2-margin](/images/ex2-margin.png)

有关margin属性的单位, 参见[尺寸的单位: Dimension](#尺寸的单位-dimension).

## marginLeft

View的左外边距. 如果该属性和margin属性指定的值冲突, 则在后面的属性生效, 前面的属性无效, 例如`margin="20" marginLeft="10"`的左外边距为10dp, 其他外边距为20dp.

```
"ui";
ui.layout(
    <horizontal>
        <button marginLeft="50" text="距离左边50"/>
        <button text="普通的按钮"/>
    </horizontal>
);
```

第一个按钮指定了左外边距为50dp, 则他和他的父布局水平布局(horizontal)的左边的间距为50dp, 效果如图：

![ex-marginLeft](/images/ex-marginLeft.png)

## marginRight

View的右外边距. 如果该属性和margin属性指定的值冲突, 则在后面的属性生效, 前面的属性无效.

## marginTop

View的上外边距. 如果该属性和margin属性指定的值冲突, 则在后面的属性生效, 前面的属性无效.

## marginBottom

View的下外边距. 如果该属性和margin属性指定的值冲突, 则在后面的属性生效, 前面的属性无效.

## padding

View和他的自身内容的间距, 也就是内边距. 注意和margin属性区分开来, margin属性是View之间的间距, 而padding是View和他自身内容的间距. 举个例子, 一个文本控件的padding也即文本控件的边缘和他的文本内容的间距, paddingLeft即文本控件的左边和他的文本内容的间距.

paddding属性的值同样有三种格式：

* `padding="paddingAll"` 指定各个内边距都是该值. 例如`padding="10"`表示左右上下内边距都是10dp.
* `padding="paddingLeft paddingTop paddingRight paddingBottom"` 分别指定各个内边距. 例如`padding="10 20 30 40"`表示左内边距为10dp, 上内边距为20dp, 右内边距为30dp, 下内边距为40dp
* `padding="paddingHorizontal paddingVertical"` 指定水平内边距和垂直内边距. 例如`padding="10 20"`表示左右内边距为10dp, 上下内边距为20dp.

用一个例子来具体理解内边距的含义：

```
"ui";
ui.layout(
    <frame w="*" h="*" gravity="center">
        <text padding="10 20 30 40" bg="#ff0000" w="auto" h="auto" text="HelloWorld"/>
    </frame>
);
```

这个例子是一个居中的按钮(通过父布局的`gravity="center"`属性设置), 背景色为红色(`bg="#ff0000"`), 文本内容为"HelloWorld", 左边距为10dp, 上边距为20dp, 下边距为30dp, 右边距为40dp, 其显示效果如图：

![ex-padding](/images/ex-padding.png)

## paddingLeft

View的左内边距. 如果该属性和padding属性指定的值冲突, 则在后面的属性生效, 前面的属性无效.

## paddingRight

View的右内边距. 如果该属性和padding属性指定的值冲突, 则在后面的属性生效, 前面的属性无效.

## paddingTop

View的上内边距. 如果该属性和padding属性指定的值冲突, 则在后面的属性生效, 前面的属性无效.

## paddingBottom

View的下内边距. 如果该属性和padding属性指定的值冲突, 则在后面的属性生效, 前面的属性无效.

## bg

View的背景. 其值可以是一个链接或路径指向的图片, 或者RGB格式的颜色, 或者其他背景. 具体参见[Drawables](#drawables).

例如, `bg="#00ff00"`设置背景为绿色, `bg="file:///sdcard/1.png"`设置背景为图片"1.png", `bg="?attr/selectableItemBackground"`设置背景为点击时出现的波纹效果(可能需要同时设置`clickable="true"`才生效).

## alpha

View的透明度, 其值是一个0~1之间的小数, 0表示完全透明, 1表示完全不透明. 例如`alpha="0.5"`表示半透明.

## foreground

View的前景. 前景即在一个View的内容上显示的内容, 可能会覆盖掉View本身的内容. 其值和属性bg的值类似.

## minHeight

View的最小高度. 该值不总是生效的, 取决于其父布局是否有足够的空间容纳.

例：`<text height="auto" minHeight="50"/>`

有关该属性的单位, 参见[尺寸的单位: Dimension](#尺寸的单位-dimension).

## minWidth

View的最小宽度. 该值不总是生效的, 取决于其父布局是否有足够的空间容纳.

例：`<input width="auto" minWidth="50"/>`

有关该属性的单位, 参见[尺寸的单位: Dimension](#尺寸的单位-dimension).

## visibility

View的可见性, 该属性可以决定View是否显示出来. 其值可以为：

* `gone` 不可见.
* `visible` 可见. 默认情况下View都是可见的.
* `invisible` 不可见, 但仍然占用位置.

## rotation

View的旋转角度. 通过该属性可以让这个View顺时针旋转一定的角度. 例如`rotation="90"`可以让他顺时针旋转90度.

如果要设置旋转中心, 可以通过`transformPivotX`, `transformPivotY`属性设置. 默认的旋转中心为View的中心.

## transformPivotX

View的变换中心坐标x. 用于View的旋转、放缩等变换的中心坐标. 例如`transformPivotX="10"`.

该坐标的坐标系以View的左上角为原点. 也就是x值为变换中心到View的左边的距离.

有关该属性的单位, 参见[尺寸的单位: Dimension](#尺寸的单位-dimension).

## transformPivotY

View的变换中心坐标y. 用于View的旋转、放缩等变换的中心坐标. 例如`transformPivotY="10"`.

该坐标的坐标系以View的左上角为原点. 也就是y值为变换中心到View的上边的距离.

有关该属性的单位, 参见[尺寸的单位: Dimension](#尺寸的单位-dimension).

## style

设置View的样式. 不同控件有不同的可选的内置样式. 具体参见各个控件的说明.

需要注意的是, style属性只支持安卓5.1及其以上.

# 文本控件: text

文本控件用于显示文本, 可以控制文本的字体大小, 字体颜色, 字体等.

以下介绍该控件的主要属性和方法, 如果要查看他的所有属性和方法, 请阅读[TextView](http://www.zhdoc.net/android/reference/android/widget/TextView.html).

## text

设置文本的内容. 例如`text="一段文本"`.

## textColor

设置字体的颜色, 可以是RGB格式的颜色(例如#ff00ff), 或者颜色名称(例如red, green等), 具体参见[颜色](#颜色).

示例, 红色字体：`<text text="红色字体" textColor="red"/>`

## textSize

设置字体的大小, 单位一般是sp. 按照Material Design的规范, 正文字体大小为14sp, 标题字体大小为18sp, 次标题为16sp.

示例, 超大字体: `<text text="超大字体" textSize="40sp"/>`

## textStyle

设置字体的样式, 比如斜体、粗体等. 可选的值为：

* bold 加粗字体
* italic 斜体
* normal 正常字体

可以用或("|")把他们组合起来, 比如粗斜体为"bold|italic".

例如, 粗体：`<text textStyle="bold" textSize="18sp" text="这是粗体"/>`

## lines

设置文本控件的行数. 即使文本内容没有达到设置的行数, 控件也会留出相应的宽度来显示空白行；如果文本内容超出了设置的行数, 则超出的部分不会显示.

另外在xml中是不能设置多行文本的, 要在代码中设置. 例如:

```
"ui";
ui.layout(
    <vertical>
        <text id="myText" line="3">
    </vertical>
)
//通过\n换行
ui.myText.setText("第一行\n第二行\n第三行\n第四行");
```

## maxLines

设置文本控件的最大行数.

## typeface

设置字体. 可选的值为：

* `normal` 正常字体
* `sans` 衬线字体
* `serif` 非衬线字体
* `monospace` 等宽字体

示例, 等宽字体: `<text text="等宽字体" typeface="monospace"/>`

## ellipsize

设置文本的省略号位置. 文本的省略号会在文本内容超出文本控件时显示. 可选的值为：

* `end`   在文本末尾显示省略号
* `marquee`   跑马灯效果, 文本将滚动显示
* `middle`    在文本中间显示省略号
* `none`    不显示省略号
* `start`    在文本开头显示省略号

`none` 在映射层对应 Android 的 `null`。当前属性应用逻辑只会在映射结果非空时调用
`TextView.setEllipsize`，因此对已经设置过省略方式的可复用 `TextView`，再次设置
`ellipsize="none"` 不会主动清除旧值；新创建且尚未设置省略方式的控件没有这个区别。

## ems

当设置该属性后,TextView显示的字符长度（单位是em）,超出的部分将不显示, 或者根据ellipsize属性的设置显示省略号.

例如, 限制文本最长为5em: `<text ems="5" ellipsize="end" text="很长很长很长很长很长很长很长的文本"/>`

## autoLink

控制是否自动找到url和电子邮件地址等链接, 并转换为可点击的链接. 默认值为“none”.

设置该值可以让文本中的链接、电话等变成可点击状态.

可选的值为以下的值以其通过或("|")的组合：

* `all`    匹配所有连接、邮件、地址、电话
* `email`    匹配电子邮件地址
* `map`    匹配地图地址
* `none`    不匹配 (默认)
* `phone`    匹配电话号码
* `web`    匹配URL地址

示例：`<text autoLink="web|phone" text="百度: http://www.baidu.com 电信电话: 10000"/>`

# 按钮控件: button

按钮控件是一个特殊的文本控件, 因此所有文本控件的函数的属性都适用于按钮控件.

除此之外, 按钮控件有一些内置的样式, 通过`style`属性设置, 包括：

* Widget.AppCompat.Button.Colored 带颜色的按钮
* Widget.AppCompat.Button.Borderless 无边框按钮
* Widget.AppCompat.Button.Borderless.Colored 带颜色的无边框按钮

这些样式的具体效果参见"示例/界面控件/按钮控件.js".

例如：`<button style="Widget.AppCompat.Button.Colored" text="漂亮的按钮"/>`

# 输入框控件: input

输入框控件也是一个特殊的文本控件, 因此所有文本控件的函数的属性和函数都适用于按钮控件. 输入框控件有自己的属性和函数, 要查看所有这些内容, 阅读[EditText](http://www.zhdoc.net/android/reference/android/widget/EditText.html).

对于一个输入框控件, 我们可以通过text属性设置他的内容, 通过lines属性指定输入框的行数；在代码中通过`getText()`函数获取输入的内容. 例如：

```
"ui";
ui.layout(
    <vertical padding="16">
        <text textSize="16sp" textColor="black" text="请输入姓名"/>
        <input id="name" text="小明"/>
        <button id="ok" text="确定"/>
    </vertical>
);
//指定确定按钮点击时要执行的动作
ui.ok.click(function(){
    //通过getText()获取输入的内容
    var name = ui.name.getText();
    toast(name + "您好!");
});
```

效果如下：

除此之外, 输入框控件有另外一些主要属性(虽然这些属性对于文本控件也是可用的但一般只用于输入框控件)：

## hint

输入提示. 这个提示会在输入框为空的时候显示出来.

示例代码如下：

```
"ui";
ui.layout(
    <vertical>
        <input hint="请输入姓名"/>
    </vertical>
)
```

## textColorHint

指定输入提示的字体颜色.

## textSizeHint

指定输入提示的字体大小.

## inputType

指定输入框可以输入的文本类型. 可选的值为以下值及其用"|"的组合:

* `date`    用于输入日期.
* `datetime`    用于输入日期和时间.
* `none`    没有内容类型. 此输入框不可编辑.
* `number`    仅可输入数字.
* `numberDecimal`    可以与number和它的其他选项组合, 以允许输入十进制数(包括小数).
* `numberPassword`    仅可输入数字密码.
* `numberSigned`    可以与number和它的其他选项组合, 以允许输入有符号的数.
* `phone`    用于输入一个电话号码.
* `text`    只是普通文本.
* `textAutoComplete`    可以与text和它的其他选项结合, 以指定此字段将做自己的自动完成, 并适当地与输入法交互.
* `textAutoCorrect`    可以与text和它的其他选项结合, 以请求自动文本输入纠错.
* `textCapCharacters`    可以与text和它的其他选项结合, 以请求大写所有字符.
* `textCapSentences`    可以与text和它的其他选项结合, 以请求大写每个句子里面的第一个字符.
* `textCapWords`    可以与text和它的其他选项结合, 以请求大写每个单词里面的第一个字符.
* `textEmailAddress`    用于输入一个电子邮件地址.
* `textEmailSubject`    用于输入电子邮件的主题.
* `textImeMultiLine`    可以与text和它的其他选项结合, 以指示虽然常规文本视图不应为多行, 但如果可以, 则IME应提供多行支持.
* `textLongMessage`    用于输入长消息的内容.
* `textMultiLine`    可以与text和它的其他选项结合, 以便在该字段中允许多行文本. 如果未设置此标志, 则文本字段将被限制为单行.
* `textNoSuggestions`    可以与text及它的其他选项结合, 以指示输入法不应显示任何基于字典的单词建议.
* `textPassword`    用于输入密码.
* `textPersonName`    用于输入人名.
* `textPhonetic`    用于输入拼音发音的文本, 如联系人条目中的拼音名称字段.
* `textPostalAddress`    用于输入邮寄地址.
* `textShortMessage`    用于输入短的消息内容.
* `textUri`    用于输入一个URI.
* `textVisiblePassword`    用于输入可见的密码.
* `textWebEditText`    用于输入在web表单中的文本.
* `textWebEmailAddress`    用于在web表单里输入一个电子邮件地址.
* `textWebPassword`    用于在web表单里输入一个密码.
* `time`    用于输入时间.

例如, 想指定一个输入框的输入类型为小数数字, 为: `<input inputType="number|numberDecimal"/>`

## password

指定输入框输入框是否为密码输入框. 默认为`false`.

例如：`<input password="true"/>`

## numeric

指定输入框输入框是否为数字输入框. 默认为`false`.

例如：`<input numeric="true"/>`

## phoneNumber

指定输入框输入框是否为电话号码输入框. 默认为`false`.

例如：`<input phoneNumber="true"/>`

## digits

指定输入框可以输入的字符. 例如, 要指定输入框只能输入"1234567890+-", 为`<input digits="1234567890+-"/>`.

## singleLine

指定输入框是否为单行输入框. 默认为`false`. 您也可以通过`lines="1"`来指定单行输入框.

例如：`<input singleLine="true"/>`

# 图片控件: img

图片控件用于显示来自网络、本地或者内嵌数据的图片, 并可以指定图片以圆角矩形、圆形等显示. 但是不能用于显示gif动态图.

这里只介绍他的主要方法和属性, 如果要查看他的所有方法和属性, 阅读[ImageView](http://www.zhdoc.net/android/reference/android/widget/ImageView.html).

## src

使用一个Uri指定图片的来源. 可以是图片的地址(http://....), 本地路径(file://....)或者base64数据("data:image/png;base64,...").

如果使用图片地址或本地路径, Monkey King会自动使用适当的缓存来储存这些图片, 减少下次加载的时间.

例如, 显示百度的logo:

```
"ui";
ui.layout(
    <frame>
        <img src="https://www.baidu.com/img/bd_logo1.png"/>
    </frame>
);
```

再例如, 显示文件/sdcard/1.png的图片为 `<img src="file:///sdcard/1.png"/>`.
再例如, 使base64显示一张钱包小图片为：

```
"ui";
ui.layout(
    <frame>
        <img w="40" h="40" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAEu0lEQVRoge3bW4iVVRQH8N+ZnDKxvJUGCSWUlXYle/ChiKAkIiu7UXQjonwNIopM8cHoAhkRGQXdfIiE0Ep8KalQoptRTiFFZiRlOo6TPuSk4zk97G9w5vidc77LPjNi84f1MN+391rrf9a+rL32N4xiFMcUjouo5zyciYPYH0FnBadiNiZiD2oR9JbGRdgiOFPDIXRhCWYU0Dcj6duV6BrQuyWxNaLowBcOO1Uv+7EKc4WINUIlabMq6dNI35eJzRHDWOzS2MEB6cd6XI/OQf07k2frkzat9HQnNkcUG7R2dECq2I53EtmePMvaf+MwcWqKu+RzuqhUcfcwcWqKTvmiXFQ2GDodRhQz0aN9ZHsSG0cVrkGf+GT7MG8YeeTCHeKS7sOdMR1stjcWxY2YH0nXh1gdSdf/E+2I8KVYigkl9ewVUsxNpT1qMzaKN4ejJxrtyEt7IuraE1EX2jOkp+JBnFxSzz68KuTqoyiK2BHuxDO4NpK+j/GoOAWF6BiH98Q/SHyCycPIIxMm4FPZCPTj30SynIFr+A7ThotMK4wXopA1Ym9gSiKv5Oj3bdKnFMpuS514E1fm6NMnbF098s3NS4QS0Ik5+hyBsoSXYkGO9jvxy6C/t+IPIYJZcBWW57AXFfMNrSo2kqqw2l4hvSzcIRTw1sm24FVxb5s4NcR0/JXBuUNYJttI6sDjsi1kvTgrGpsMjq3O4FQNa+SbNhWsyKj7I4wpzSYDbpFtKB/EOSn9ZwpRfx5Xp7yfhN0Z9FdxXxxKjTEe2zI4U8NnKf3PNrT2VcWTKe1eyGjjT+Eapm14IqMjNTyd0n9JSrsDwhmaEN2H8GMOO8viUjyMSfJVJh9O0bGoQdt1eFm2oVwve7UpC1ssX568KEXH6fghp54s8lRkrk7CjpxOrGqg6wQ8IKSKWXPpVtIt8ly+v4ATf2t+yqlgDl5SbCjXy8JIXFXweQEHqngxo43JeEw54l+JVLKaJeypRZzoFxavrIWG6cKPW2SO9+PCMkQHsLiA8fpIv5/DmUn4qaCtpWWIEiLzdUHj9XJA2H5uFRbBZriuoI1NSpatpio+nJtFvFvYd2c1sDsGvxfQ3a/knrwgMtm0qD8rPSprCuq8uRmhVqvanBbvm+EQfsNKIcnvTmnTiUdwQcq73oJ2L2v2stXx6vyCRr8RDuk/C8OMUK24J6VtBaekPG81zxuh0TTJhC7FhtUOHF+n61whGalvu8uRWVJFvgPEYOkqQzhLVSPPXLoYa4Xh3Stcls1NaTdb8Xx7ZxnCvSUIfy/kzWno0Pyzx3dL2C0695Hto7NGUhXy5Lzp3kLZKiqNpNTl2+YShgdIvyXbVck44TB/oKTNzWUIv13S+IDsFmpY84QvZAcwTbh4e04o18SwtbIM4dsiOTFYVgzSv7wN+m9vRqjV/PrA0JuCox1bhYNKQ7Qi3CcU1fpiedRG9AkLXhRfbxCnKlET0s21ifwaSWcPbopBdDDOwGtClTD2vCsq+/C68K8HmVDk7DhFyIsvFzKnGThN+689+oU9dptwQb5B+LB8dx4lMb7xqAhkJwo/xljhFFSfSdUc3mPrcbwj15P+pP0/QiR7hYSkGsHnUYziWMF/mXV4JVcZ8G0AAAAASUVORK5CYII="/>
    </frame>
);
```

## tint

图片着色, 其值是一个颜色名称或RGB颜色值. 使用该属性会将图片中的非透明区域都涂上同一颜色. 可以用于改变图片的颜色.

例如, 对于上面的base64的图片: `<img w="40" h="40" tint="red" src="data:image/png;base64,..."/>`, 则钱包图标颜色会变成红色.

## scaleType

控制图片根据图片控件的宽高放缩时的模式. 可选的值为：

* `center`    在控件中居中显示图像, 但不执行缩放.
* `centerCrop`    保持图像的长宽比缩放图片, 使图像的尺寸 (宽度和高度) 等于或大于控件的相应尺寸 (不包括内边距padding)并且使图像在控件中居中显示.
* `centerInside`    保持图像的长宽比缩放图片, 使图像的尺寸 (宽度和高度) 小于视图的相应尺寸 (不包括内边距padding)并且图像在控件中居中显示.
* `fitCenter`    保持图像的长宽比缩放图片, 使图片的宽**或**高和控件的宽高相同并使图片在控件中居中显示
* `fitEnd`    保持图像的长宽比缩放图片, 使图片的宽**或**高和控件的宽高相同并使图片在控件中靠右下角显示
* `fitStart`    保持图像的长宽比缩放图片, 使图片的宽**或**高和控件的宽高相同并使图片在控件靠左上角显示
* `fitXY`    使图片和宽高和控件的宽高完全匹配, 但图片的长宽比可能不能保持一致
* `matrix`    绘制时使用图像矩阵进行缩放. 需要在代码中使用`setImageMatrix(Matrix)`函数才能生效.

默认的scaleType为`fitCenter`；除此之外最常用的是`fitXY`,  他能使图片放缩到控件一样的大小, 但图片可能会变形.

## radius

图片控件的半径. 如果设置为控件宽高的一半并且控件的宽高相同则图片将剪切为圆形显示；否则图片为圆角矩形显示, 半径即为四个圆角的半径, 也可以通过`radiusTopLeft`, `radiusTopRight`, `radiusBottomLeft`, `radiusBottomRight`等属性分别设置四个圆角的半径.

例如, 圆角矩形的Auto.js图标：`<img w="100" h="100" radius="20" bg="white" src="http://www.autojs.org/assets/uploads/profile/3-profileavatar.png" />`

有关该属性的单位, 参见[尺寸的单位: Dimension](#尺寸的单位-dimension).

## radiusTopLeft

图片控件的左上角圆角的半径. 有关该属性的单位, 参见[尺寸的单位: Dimension](#尺寸的单位-dimension).

## radiusTopRight

图片控件的右上角圆角的半径. 有关该属性的单位, 参见[尺寸的单位: Dimension](#尺寸的单位-dimension).

## radiusBottomLeft

图片控件的左下角圆角的半径. 有关该属性的单位, 参见[尺寸的单位: Dimension](#尺寸的单位-dimension).

## radiusBottomRight

图片控件的右下角圆角的半径. 有关该属性的单位, 参见[尺寸的单位: Dimension](#尺寸的单位-dimension).

## borderWidth

图片控件的边框宽度. 用于在图片外面显示一个边框, 边框会随着图片控件的外形(圆角等)改变而相应变化.
例如, 圆角矩形带灰色边框的Auto.js图标：`<img w="100" h="100" radius="20" borderWidth="5" borderColor="gray" bg="white" src="http://www.autojs.org/assets/uploads/profile/3-profileavatar.png" />`

## borderColor

图片控件的边框颜色.

## circle

指定该图片控件的图片是否剪切为圆形显示. 如果为`true`, 则图片控件会使其宽高保持一致(如果宽高不一致, 则保持高度等于宽度)并使圆形的半径为宽度的一半.

例如, 圆形的Auto.js图标：`<img w="100" h="100" circle="true" bg="white" src="http://www.autojs.org/assets/uploads/profile/3-profileavatar.png" />`

# 垂直布局: vertical

垂直布局是一种比较简单的布局, 会把在它里面的控件按照垂直方向依次摆放, 如下图所示：

垂直布局:

—————

| 控件1 |

| 控件2 |

| 控件3 |

| 其他控件 |

——————

## layout_weight

垂直布局中的控件可以通过`layout_weight`属性来控制控件高度占垂直布局高度的比例. 如果为一个控件指定`layout_weight`, 则这个控件的高度=垂直布局剩余高度 * layout_weight / weightSum；如果不指定weightSum, 则weightSum为所有子控件的layout_weight之和. 所谓"剩余高度", 指的是垂直布局中减去没有指定layout_weight的控件的剩余高度.
例如:

```
"ui";
ui.layout(
    <vertical h="100dp">
        <text layout_weight="1" text="控件1" bg="#ff0000"/>
        <text layout_weight="1" text="控件2" bg="#00ff00"/>
        <text layout_weight="1" text="控件3" bg="#0000ff"/>
    </vertical>
);
```

在这个布局中, 三个控件的layout_weight都是1, 也就是他们的高度都会占垂直布局高度的1/3, 都是33.3dp.
再例如：

```
"ui";
ui.layout(
    <vertical h="100dp">
        <text layout_weight="1" text="控件1" bg="#ff0000"/>
        <text layout_weight="2" text="控件2" bg="#00ff00"/>
        <text layout_weight="1" text="控件3" bg="#0000ff"/>
    </vertical>
);
```

在这个布局中, 第一个控件高度为1/4, 第二个控件为2/4, 第三个控件为1/4.
再例如：

```
"ui";
ui.layout(
    <vertical h="100dp" weightSum="5">
        <text layout_weight="1" text="控件1" bg="#ff0000"/>
        <text layout_weight="2" text="控件2" bg="#00ff00"/>
        <text layout_weight="1" text="控件3" bg="#0000ff"/>
    </vertical>
);
```

在这个布局中, 因为指定了weightSum为5, 因此第一个控件高度为1/5, 第二个控件为2/5, 第三个控件为1/5.
再例如：

```
"ui";
ui.layout(
    <vertical h="100dp">
        <text h="40dp" text="控件1" bg="#ff0000"/>
        <text layout_weight="2" text="控件2" bg="#00ff00"/>
        <text layout_weight="1" text="控件3" bg="#0000ff"/>
    </vertical>
);
```

在这个布局中, 第一个控件并没有指定layout_weight, 而是指定高度为40dp, 因此不加入比例计算, 此时布局剩余高度为60dp. 第二个控件高度为剩余高度的2/3, 也就是40dp, 第三个控件高度为剩余高度的1/3, 也就是20dp.

垂直布局的layout_weight属性还可以用于控制他的子控件高度占满剩余空间, 例如：

```
"ui";
ui.layout(
    <vertical h="100dp">
        <text h="40dp" text="控件1" bg="#ff0000"/>
        <text h="40dp" text="控件2" bg="#00ff00"/>
        <text layout_weight="1" text="控件3" bg="#0000ff"/>
    </vertical>
);
```

在这个布局中, 第三个控件的高度会占满除去控件1和控件2的剩余空间.

# 水平布局: horizontal

水平布局是一种比较简单的布局, 会把在它里面的控件按照水平方向依次摆放, 如下图所示：
水平布局:
————————————————————————————

| 控件1 | 控件2 | 控件3 | ... |

————————————————————————————

## layout_weight

水平布局中也可以使用layout_weight属性来控制子控件的**宽度**占父布局的比例. 和垂直布局中类似, 不再赘述.

# 线性布局: linear

实际上, 垂直布局和水平布局都属于线性布局. 线性布局有一个orientation的属性, 用于指定布局的方向, 可选的值为`vertical`和`horizontal`.

例如`<linear orientation="vertical"></linear>`相当于`<vertical></vertical>`.

线性布局的默认方向是横向的, 因此, 一个没有指定orientation属性的线性布局就是横向布局.

# 帧布局: frame

帧布局

# 相对布局: relative

# 勾选框控件: checkbox

# 选择框控件: radio

# 选择框布局: radiogroup

# 开关控件: Switch

开关控件用于表示一个选项是否被选中.

## checked

表示开关是否被选中. 可选的值为：

* `true` 打开开关
* `false` 关闭开关

## text

对开关进行描述的文字.

# 进度条控件: progressbar

# 拖动条控件: seekbar

# 下来菜单控件: spinner

# 时间选择控件: timepicker

# 日期选择控件: datepicker

# 浮动按钮控件: fab

# 标题栏控件: toolbar

# 卡片: card

卡片控件是一个拥有圆角、阴影的控件.

## cardBackgroundColor

卡片的背景颜色.

## cardCornerRadius

卡片的圆角半径.

## cardElevation

设置卡片在z轴上的高度, 来控制阴影的大小.

## contentPadding

设置卡片的内边距. 该属性包括四个值：

* `contentPaddingLeft` 左内边距
* `contentPaddingRight` 右内边距
* `contentPaddingTop` 上内边距
* `contentPaddingBottom` 下内边距

## foreground

使用`foreground="?selectableItemBackground"`属性可以为卡片添加点击效果.

# 抽屉布局: drawer

# 列表: list

# Tab: tab

# ui

## ui.layout(xml)

* `xml` {XML} | {string} 布局XML或者XML字符串

将布局XML渲染为视图（View）对象,  并设置为当前视图.

## ui.layoutFile(xmlFile)

* `xml` {string} 布局XML文件的路径

此函数和`ui.layout`相似, 只不过允许传入一个xml文件路径来渲染布局.

## ui.inflate(xml[, parent = null, attachToParent = false])

* `xml` {string} | {XML} 布局XML或者XML字符串
* `parent` {View} 父视图
* `attachToParent` {boolean} 是否渲染的View加到父视图中, 默认为false
* 返回 {View}

将布局XML渲染为视图（View）对象. 如果该View将作为某个View的子View, 我们建议传入`parent`参数, 这样在渲染时依赖于父视图的一些布局属性能够正确应用.

此函数用于动态创建、显示View.

```javascript
"ui";

$ui.layout(
    <linear id="container">
    </linear>
);

// 动态创建3个文本控件, 并加到container容器中
// 这里仅为实例, 实际上并不推荐这种做法, 如果要展示列表,
// 使用list组件；动态创建十几个、几十个View会让界面卡顿
for (let i = 0; i < 3; i++) {
    let textView = $ui.inflate(
        <text textColor="#000000" textSize="14sp"/>
    , $ui.container);
    textView.attr("text", "文本控件" + i);
    $ui.container.addView(textView);
}
```

# ui.registerWidget(name, widget)

* `name` {string} 组件名称
* `widget` {Function} 组件

注册一个自定义组件. 参考示例->界面控件->自定义控件.

# ui.isUiThread()

* 返回 {boolean}

返回当前线程是否是UI线程.

```javascript
"ui";

log($ui.isUiThread()); // => true

$threads.start(function () {
    log($ui.isUiThread()); // => false
});

```

## ui.findView(id)

* `id` {string} View的ID
* 返回 {View}

在当前视图中根据ID查找相应的视图对象并返回. 如果当前未设置视图或找不到此ID的视图时返回`null`.

一般我们都是通过`ui.xxx`来获取id为xxx的控件, 如果xxx是一个ui已经有的属性, 就可以通过`$ui.findView()`来获取这个控件.

## ui.finish()

结束当前活动并销毁界面.

## ui.setContentView(view)

* `view` {View}

将视图对象设置为当前视图.

## ui.post(callback[, delay = 0])

* `callback` {Function} 回调函数
* `delay` {number} 延迟, 单位毫秒

将`callback`加到UI线程的消息循环中, 并延迟delay毫秒后执行（不能准确保证一定在delay毫秒后执行）.

此函数可以用于UI线程中延时执行动作（sleep不能在UI线程中使用）, 也可以用于子线程中更新UI.

```javascript
"ui";

ui.layout(
    <frame>
        <text id="result"/>
    </frame>
);

ui.result.attr("text", "计算中");
// 在子线程中计算1+ ... + 10000000
threads.start({
    let sum = 0;
    for (let i = 0; i < 1000000; i++) {
        sum += i;
    }
    // 由于不能在子线程操作UI, 所以要抛到UI线程执行
    ui.post(() => {
        ui.result.attr("text", String(sum));
    });
});
```

## ui.run(callback)

* `callback` {Function} 回调函数
* 返回 callback的执行结果

将`callback`在UI线程中执行. 如果当前已经在UI线程中, 则直接执行`callback`；否则将`callback`抛到UI线程中执行（加到UI线程的消息循环的末尾）, **并等待callback执行结束(阻塞当前线程)**.

## ui.statusBarColor(color)

* color {string} | {number} 颜色

设置当前界面的状态栏颜色.

```javascript
"ui";
ui.statusBarColor("#000000");
```

## ui.useAndroidLayout([enabled])

切换原生 Android XML 与 Monkey King 简写布局的解析方式。省略参数或传 `null` 时恢复自动判断；传 `true` 强制使用原生布局。完整合同见本页后面的运行时 API 参考。

```javascript
"ui";
ui.useAndroidLayout(true);
```

# 尺寸的单位: Dimension

# Drawables

# 颜色

# 运行时 API 参考

以下合同描述 Monkey King 6.7.0 固定提交中的 Rhino 运行时对象。尺寸返回值均为像素；需要 Activity 的成员只能在 UI 脚本已创建界面后使用。

<a id="api-symbol-bW9kdWxlOnVp"></a>
## [@] ui

**`6.7.0`**

- **入口 / 别名**：`ui`、`$ui`
- <ins>**returns**</ins> { `UI` } - 绑定了布局、线程调度、窗口外观、控件查找及动态属性代理的对象
- **权限**：模块本身不申请权限；具体 View、窗口或资源操作要求有效的 UI Activity
- **线程 / 生命周期 / 副作用**：对象与当前脚本运行时绑定；初始化时把脚本顶层作用域设为布局表达式的默认绑定上下文

```js
"ui";
console.log(ui === $ui); // true
console.log(ui.getClassName()); // UI
```

<a id="api-symbol-ZHluYW1pYzp1aS5wcm94eS1wcm9wZXJ0aWVz"></a>
### [dynamic] ui 动态代理属性

**`6.7.0`**

对任意脚本属性 `ui[key]` 赋非 nullish 值时，运行时把它保存到代理的 `mProperties`；赋 `null` 或 `undefined` 时删除该键。读取一个没有保存值的键时，如果 `ui.view` 已设置，运行时会把键当作布局 ID 调用 `ui.findById(key)`。因此可用键集合取决于脚本赋值和当前布局，而不是一张固定属性表。

显式安装在 `ui` 上的方法与 getter 优先于代理查找。布局切换后，同一个键可能解析到不同 View；找不到 ID 时返回 nullish 值。

```js
ui.sessionName = 'demo';
console.log(ui.sessionName); // demo
ui.sessionName = null; // 删除动态键

ui.layout('<text id="title" text="Monkey King"/>');
console.log(ui.title === ui.findById('title')); // true
```

<a id="api-symbol-dWkuaXNBbmRyb2lkTGF5b3V0"></a>
<a id="api-symbol-dWkud2lkZ2V0cw"></a>
<a id="api-symbol-dWkudmlldw"></a>
<a id="api-symbol-dWkuYmluZGluZ0NvbnRleHQ"></a>
<a id="api-symbol-dWkucmVzb3VyY2VQYXJzZXI"></a>
<a id="api-symbol-dWkubGF5b3V0SW5mbGF0ZXI"></a>
### [p] ui 核心状态属性

**`6.7.0`**

| 属性 | 类型 | 合同 |
| --- | --- | --- |
| `ui.isAndroidLayout` | `boolean \| null` | `true` 强制原生 Android XML，`false` 强制 Monkey King 简写语法，`null` 自动判断；通常通过 `useAndroidLayout()` 修改。 |
| `ui.widgets` | `Object` | 延迟创建的自定义控件构造器注册表；`registerWidget()` 会在此对象上定义名称。 |
| `ui.view` | `android.view.View \| null` | 当前内容 View；只允许写入 View 或 null，否则抛出类型错误。 |
| `ui.bindingContext` | `any` | `{{ expression }}` 动态属性求值上下文；写 nullish 值会移除绑定。 |
| `ui.resourceParser` | `ResourceParser` | 解析布局资源；图片路径会先经当前脚本的 `files.path()` 解析。 |
| `ui.layoutInflater` | `DynamicLayoutInflater` | 当前运行时的动态布局解析器；初始化时绑定脚本上下文与资源解析器。 |

```js
console.log(ui.isAndroidLayout, ui.view);
console.log(ui.widgets === ui.__widgets__); // true
ui.bindingContext = { title: 'Monkey King' };
```

<a id="api-symbol-dWkuZ2V0Q2xhc3NOYW1l"></a>
<a id="api-symbol-dWkuZ2V0"></a>
<a id="api-symbol-dWkucHV0"></a>
<a id="api-symbol-dWkucmVjeWNsZQ"></a>
<a id="api-symbol-dWkuZ2V0RGVmYXVsdFZhbHVl"></a>
<a id="api-symbol-dWkuZ2V0V2l0aG91dFByb3h5"></a>
### [m] ui 底层 Rhino 对象方法

**`6.7.0`**

| 方法 | 返回值 | 合同 |
| --- | --- | --- |
| `ui.getClassName()` | `string` | 固定返回 `UI`。 |
| `ui.get(key, start)` | `any` | Rhino 属性读取钩子；优先处理 `view` 和内部属性，再进入代理读取。 |
| `ui.put(key, start, value)` | `void` | Rhino 属性写入钩子；校验 `view`，更新内部属性，或进入动态代理写入。 |
| `ui.recycle()` | `void` | 清除 `layoutInflater.privateContext`，释放该解析器持有的私有 Context。 |
| `ui.getDefaultValue(typeHint?)` | `string` | Rhino 原始值转换钩子，返回对象的字符串形式。 |
| `ui.getWithoutProxy(name, start)` | `any` | 绕过动态 getter，仅读取 NativeObject 自身属性；缺失时返回 Rhino 的 `NOT_FOUND`。 |

这些成员主要供 Rhino 桥接层使用；普通脚本通常应使用属性语法。

```js
console.log(ui.getClassName()); // UI
ui.runtimeTag = 'example'; // 经 put/proxy 写入
console.log(ui.runtimeTag); // 经 get/proxy 读取
```

<a id="api-symbol-dWkuUg"></a>
<a id="api-symbol-dWkuX193aWRnZXRzX18"></a>
<a id="api-symbol-dWkucm9vdA"></a>
<a id="api-symbol-dWkuZW1pdHRlcg"></a>
<a id="api-symbol-dWkuc3RhdHVzQmFySGVpZ2h0"></a>
<a id="api-symbol-dWkudmlzaWJsZVN0YXR1c0JhckhlaWdodA"></a>
<a id="api-symbol-dWkubmF2aWdhdGlvbkJhckhlaWdodA"></a>
<a id="api-symbol-dWkudmlzaWJsZU5hdmlnYXRpb25CYXJIZWlnaHQ"></a>
### [p] ui 运行时 getter

**`6.7.0`**

| Getter | 类型 | 合同 |
| --- | --- | --- |
| `ui.R` | `Object` | 当前 Monkey King 运行时暴露的 Android 资源入口。 |
| `ui.__widgets__` | `Object` | `ui.widgets` 的公开 getter；返回同一份自定义控件注册表。 |
| `ui.root` | `android.view.View \| null` | UI Activity 的 `android.R.id.content` 根 View；非 UI Activity 时为 null。 |
| `ui.emitter` | `EventEmitter \| null` | 当前 `ScriptExecuteActivity` 的事件发射器。 |
| `ui.statusBarHeight` | `number` | 当前 Activity（无时用全局 Context）的状态栏高度，忽略可见性。 |
| `ui.visibleStatusBarHeight` | `number` | 同上，但状态栏不可见时按可见性计算。 |
| `ui.navigationBarHeight` | `number` | 导航栏高度，忽略可见性。 |
| `ui.visibleNavigationBarHeight` | `number` | 导航栏当前可见高度。 |

```js
console.log(ui.R, ui.__widgets__);
console.log(ui.statusBarHeight, ui.visibleStatusBarHeight);
console.log(ui.navigationBarHeight, ui.visibleNavigationBarHeight);
```

<a id="api-symbol-dWkucnVu"></a>
<a id="api-symbol-dWkuaXNVaVRocmVhZA"></a>
<a id="api-symbol-dWkucG9zdA"></a>
### [m] UI 线程调度

**`6.7.0`**

| 方法 | 参数与返回值 | 合同 |
| --- | --- | --- |
| `ui.run(action)` | `Function -> any` | 必须传 1 个函数。已在 UI 线程时立即执行，否则投递到 UI Handler、阻塞当前线程并返回结果；回调异常会重新抛出。 |
| `ui.isUiThread()` | `() -> boolean` | 必须为 0 个参数；也安装为全局 `isUiThread()`。 |
| `ui.post(action[, delay])` | `(Function, number?) -> boolean` | 接受 1..2 个参数；立即或延迟投递，返回 Handler 是否接受任务，并维持当前脚本 Looper 的等待状态直到回调结束。 |

```js
ui.post(() => {
    console.log(ui.isUiThread()); // true
}, 0);
```

<a id="api-symbol-dWkuX19pbmZsYXRlX18"></a>
<a id="api-symbol-dWkuaW5mbGF0ZQ"></a>
<a id="api-symbol-dWkudXNlQW5kcm9pZExheW91dA"></a>
<a id="api-symbol-dWkubGF5b3V0"></a>
<a id="api-symbol-dWkubGF5b3V0RmlsZQ"></a>
<a id="api-symbol-dWkucmVnaXN0ZXJXaWRnZXQ"></a>
<a id="api-symbol-dWkuc2V0Q29udGVudFZpZXc"></a>
### [m] 布局解析与内容 View

**`6.7.0`**

| 方法 | 返回值 | 合同 |
| --- | --- | --- |
| `ui.__inflate__(ctx, xml[, parent[, attach]])` | `android.view.View` | 内部入口，要求 2..4 个参数；`ctx` 必须为 `InflateContext`，`parent` 必须为 `ViewGroup` 或 null。 |
| `ui.inflate(xml[, parent[, attach]])` | `NativeView` | 接受 1..3 个参数；解析 XML/XML 字符串/DOM 并包装原生 View，父项必须为 `ViewGroup` 或 null。 |
| `ui.useAndroidLayout([enabled])` | `undefined` | 最多 1 个参数；省略或传 null 设为自动判断，显式传 `undefined` 设为 true，其他值转为 boolean。 |
| `ui.layout(xml)` | `undefined` | 必须传 1 个布局；在 UI Activity 的 decor ViewGroup 中解析，并设为当前内容 View。 |
| `ui.layoutFile(path)` | `undefined` | 必须传 1 个路径；先用 `files.read()` 读取，再委托给 `layout()`。 |
| `ui.registerWidget(name, widget)` | `undefined` | 必须传非空名称和构造函数，并写入 `ui.widgets` 注册表。 |
| `ui.setContentView(view)` | `undefined` | 必须传原生 View；在 UI 线程设置 Activity 内容，同时更新 `ui.view`。 |

```js
"ui";
ui.useAndroidLayout(false);
const content = ui.inflate('<vertical><text id="title" text="Hello"/></vertical>');
ui.setContentView(content);
```

<a id="api-symbol-dWkuc3RhdHVzQmFyQ29sb3I"></a>
<a id="api-symbol-dWkuc3RhdHVzQmFySWNvbkxpZ2h0"></a>
<a id="api-symbol-dWkuc3RhdHVzQmFySWNvbkxpZ2h0Qnk"></a>
<a id="api-symbol-dWkuYmFja2dyb3VuZENvbG9y"></a>
<a id="api-symbol-dWkubmF2aWdhdGlvbkJhckNvbG9y"></a>
<a id="api-symbol-dWkubmF2aWdhdGlvbkJhckljb25MaWdodA"></a>
<a id="api-symbol-dWkubmF2aWdhdGlvbkJhckljb25MaWdodEJ5"></a>
### [m] 窗口与系统栏外观

**`6.7.0`**

| 方法 | 参数 | 合同 |
| --- | --- | --- |
| `ui.statusBarColor(color)` | 1 个颜色值 | 在 UI 线程设置状态栏背景色。 |
| `ui.statusBarIconLight([isLight])` | 0..1 个 boolean | 默认 true；设置状态栏图标明暗模式。 |
| `ui.statusBarIconLightBy(refColor)` | 1 个颜色值 | 按参考色是否为暗色计算图标明暗模式。 |
| `ui.backgroundColor(color)` | 1 个颜色值 | 把颜色 alpha 强制为 1 后设置 Activity 窗口背景。 |
| `ui.navigationBarColor(color)` | 1 个颜色值 | 设置导航栏背景色。 |
| `ui.navigationBarIconLight([isLight])` | 0..1 个 boolean | 默认 true；Android 8.0 以下抛出版本要求异常。 |
| `ui.navigationBarIconLightBy(refColor)` | 1 个颜色值 | 按参考色计算导航栏图标模式；Android 8.0 以下抛出。 |

所有方法返回 `undefined`，并要求有效的 `ScriptExecuteActivity`。

```js
ui.statusBarColor('#202124');
ui.statusBarIconLightBy('#202124');
ui.navigationBarColor('#202124');
ui.navigationBarIconLightBy('#202124');
```

<a id="api-symbol-dWkuZmluZEJ5SWQ"></a>
<a id="api-symbol-dWkuZmluZEJ5U3RyaW5nSWQ"></a>
<a id="api-symbol-dWkuZmluZFZpZXc"></a>
<a id="api-symbol-dWkuZmluaXNo"></a>
<a id="api-symbol-dWkua2VlcFNjcmVlbk9u"></a>
### [m] View 查找与 Activity 生命周期

**`6.7.0`**

| 方法 | 返回值 | 合同 |
| --- | --- | --- |
| `ui.findById(id)` | `NativeView \| null` | 必须传 1 个 ID，在 `ui.view` 下按字符串 ID 查找；尚未设置内容或未找到时返回 null。 |
| `ui.findByStringId(view, id)` | `NativeView \| null` | 必须传 2 个参数；首参必须为原生 View，并从该子树开始查找。 |
| `ui.findView(id)` | `NativeView \| null` | `findById(id)` 的同语义公开入口。 |
| `ui.finish()` | `undefined` | 必须为 0 个参数；在 UI 线程结束当前 `ScriptExecuteActivity`。 |
| `ui.keepScreenOn()` | `undefined` | 必须为 0 个参数；给当前窗口添加 `FLAG_KEEP_SCREEN_ON`。 |

```js
ui.layout('<text id="title" text="loading"/>');
const title = ui.findView('title');
if (title) title.attr('text', 'ready');
ui.keepScreenOn();
```

<a id="api-symbol-dWkuZ2V0U3RhdHVzQmFySGVpZ2h0"></a>
<a id="api-symbol-dWkuZ2V0VmlzaWJsZVN0YXR1c0JhckhlaWdodA"></a>
<a id="api-symbol-dWkuZ2V0TmF2aWdhdGlvbkJhckhlaWdodA"></a>
<a id="api-symbol-dWkuZ2V0VmlzaWJsZU5hdmlnYXRpb25CYXJIZWlnaHQ"></a>
### [m] 系统栏高度函数

**`6.7.0`**

四个函数均接受 0..1 个 options 对象并返回像素整数。`withComputed` 与 `withDimen` 默认 true；普通函数的 `ignoreVisibility` 默认 true，可见高度函数则固定为 false。

| 方法 | 可见性规则 |
| --- | --- |
| `ui.getStatusBarHeight(options?)` | 读取 `ignoreVisibility`，默认忽略可见性。 |
| `ui.getVisibleStatusBarHeight(options?)` | 始终考虑状态栏是否可见。 |
| `ui.getNavigationBarHeight(options?)` | 读取 `ignoreVisibility`，默认忽略可见性。 |
| `ui.getVisibleNavigationBarHeight(options?)` | 始终考虑导航栏是否可见。 |

```js
const status = ui.getStatusBarHeight({
    withComputed: true,
    withDimen: true,
    ignoreVisibility: false,
});
console.log(status, ui.getVisibleNavigationBarHeight());
```

<a id="api-symbol-dWkuV2lkZ2V0Ll9fYXR0cnNfXw"></a>
<a id="api-symbol-dWkuV2lkZ2V0LnJlbmRlckludGVybmFs"></a>
<a id="api-symbol-dWkuV2lkZ2V0LmRlZmluZUF0dHI"></a>
<a id="api-symbol-dWkuV2lkZ2V0Lmhhc0F0dHI"></a>
<a id="api-symbol-dWkuV2lkZ2V0LnNldEF0dHI"></a>
<a id="api-symbol-dWkuV2lkZ2V0LmdldEF0dHI"></a>
<a id="api-symbol-dWkuV2lkZ2V0Lm5vdGlmeVZpZXdDcmVhdGVk"></a>
<a id="api-symbol-dWkuV2lkZ2V0Lm5vdGlmeUFmdGVySW5mbGF0aW9u"></a>
## ui.Widget 原型合同

**`6.7.0`**

`new ui.Widget()` 创建一个带独立 `__attrs__` 表和以下七个永久原型函数的对象。布局解析器在遇到已注册的自定义控件时调用这些函数；脚本通常覆写 `render`、`onViewCreated` 或 `onFinishInflation`，而不覆写内部通知函数。

| 成员 | 合同 |
| --- | --- |
| `widget.__attrs__` | 非枚举的属性合同表；每项保存 `{ getter, setter }`。 |
| `widget.renderInternal()` | 必须为 0 个参数；有 `render()` 时调用并要求非 null 返回，否则返回空布局字符串 `< />`。 |
| `widget.defineAttr(name[, aliasOrGetter[, applierOrSetter]])` | 接受 1..3 个参数；可声明属性别名、应用器，或显式 getter/setter 函数对。name 不得 nullish。 |
| `widget.hasAttr([name])` | 最多 1 个参数；检查 `__attrs__` 是否含该属性。 |
| `widget.setAttr(view, name, value, defaultSetter)` | 调用已注册属性的 setter；属性项或 setter 不是脚本对象/函数时抛出。 |
| `widget.getAttr(view, name, defaultGetter)` | 调用已注册属性的 getter，并返回其结果。 |
| `widget.notifyViewCreated(view)` | 必须传原生 View；若定义了 `onViewCreated` 则调用它。 |
| `widget.notifyAfterInflation(view)` | 必须传原生 View；若定义了 `onFinishInflation` 则调用它。 |

```js
const widget = new ui.Widget();
widget.defineAttr('title');
widget.render = function () {
    return '<text text="custom widget"/>';
};
console.log(widget.hasAttr('title')); // true
console.log(widget.renderInternal());
```
