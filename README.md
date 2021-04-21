
### 实现一个移动端排序

feature:

    - 高亮当前选项
    - 排序实现过度动效

### 原理：

wrapper 外层设置 position 为 relative，排序元素定位 absolute；

在实例初始化的时候，根据元素的排序定位 top

touchstart => touchmove => 根据元素移动最新的 top 值，得出 newSort 的位置，然后计算其他元素的 sort, 根据 sort 重新定位，达到排序效果 => touchend => reset

详细实现可看代码。

使用方式：

    const instance = new DragSort({
      data: ['A', 'B', 'C', 'D'] // 需要排序的数据，用于动态生成排序选项，
      wrapper: 'id' // 排序外层容器html id
    })

### 亮点：

    1.以 oop class 组织代码结构，排序选项以 option 参数形式传入，功能拓展性及代码可读性较好；
    2.引入 Rxjs 管理 touch event 事件流，函数式编程方式让代码更加清晰可维护。

### to do:

    1.优化对源数据排序方式;
    2.options 选项增加自定义 class 参数
