# javascript

## 利用canvas对线上图片打码

:::details 源码

```js

export class Mosaic {
    constructor(containerId, canvasId, size) {
        this.canvasId = canvasId
        this.containerId = containerId
        this.size = size
    }

    // 画笔初始化
    initBrush() {
        this.brush = document.createElement('div')
        this.brush.style.position = 'absolute'
        this.brush.style.zIndex = '99'
        this.brush.style.width = this.size + 'px'
        this.brush.style.height = this.size + 'px'
        this.brush.style.background = 'rgba(233,233,233,0.7)'
        this.brush.style.pointerEvents = 'none'
        this.brush.style.left = '0'
        this.brush.style.right = '0'
        this.brush.style.transform = `translate(-${this.size}px, -${this.size}px)`
        this.container.appendChild(this.brush)
    }

    //  清除画笔
    removeBrush() {
        this.brush?.remove()
    }

    //改变画笔大小
    resetBrush(size) {
        this.size = size
        this.initBrush()
    }

    // canvas容器初始化
    initContainer() {
        this.container = document.getElementById(this.containerId)
    }

    //初始化canvas
    initCanvas() {
        this.canvas = document.getElementById(this.canvasId)
    }

    //获取context
    getCanvasContext(canvas) {
        return canvas.getContext('2d')
    }

    //创建新的canvas元素
    createNewCanvas() {
        return document.createElement('canvas')
    }

    // 判断是否超过上一次马赛克范围
    judgeD(currentP, lastP, r) {
        const [x1, y1] = currentP, [x2, y2] = lastP
        return Math.sqrt(Math.pow(Math.abs(x1 - x2), 2) + Math.pow(Math.abs(y1 - y2), 2)) <= r
    }

    // 设置范围内像素值
    setPxColor(imgDate, color) {
        for (let i = 0; i < imgDate.data.length; i++) {
            imgDate.data[i] = color[i % 4]
        }
        return imgDate
    }

    initMosaic() {
        this.initContainer()
        this.initCanvas()
        this.initBrush()
        this.painting = this.getCanvasContext(this.canvas)
        this.lastP = [0, 0] // 最后一次绘制中心点
        this.isPrint = false // 绘制启动
        this.brushFollow = false // 画笔启动
        this.handleData = [] // 每次操作步骤
        this.cacheDeleteData = [] // 缓存撤销数据用于恢复
        this.scale = 1 // 缩放倍数
        this.imgWH = [] // 图片原始宽高
        this.flag = false // 是否按住shift
        this.batchCache = [] //批量打码数据
        this.container.style.position = 'relative'
        this.container.style.overflow = 'hidden'
    }

    // 获取平均像素
    getPxAVG(imgDate) {
        const data = imgDate.data
        let r = 0, g = 0, b = 0, a = 0
        const sumPx = data.length / 4
        for (let i = 0; i < sumPx; i++) {
            r = r + data[i * 4]
            g = g + data[i * 4 + 1]
            b = b + data[i * 4 + 2]
            a = a + data[i * 4 + 3]
        }
        return [r / sumPx, g / sumPx, b / sumPx, a / sumPx]
    }

    // 画马赛克
    printMosaic(x, y, size, painting, batch = false) {
        // 获取鼠标定位范围size的像素数据
        const imgData = painting.getImageData(x, y, size, size)
        // 获取范围像素数据平均值
        const pxAVG = this.getPxAVG(imgData)
        // 创建该区域马赛克图像数据
        let mosaic = this.setPxColor(painting.createImageData(size, size), pxAVG)
        // 重新绘制
        painting.putImageData(mosaic, x, y)
        if (!batch) {
            this.batchCache.push([x, y, this.size])
        }
    }

    // 计算出图片等比缩放的宽高
    calculate(cw, pw, ph) {
        ph = ph * (cw / pw)
        pw = cw
        return {pw, ph}
    }

    //  按住shift缩放图片
    keyListener(e, flag) {
        if (e.key === 'Shift') {
            this.flag = flag
        }
    }

    //  获取文件名以及后缀
    getSuffixAndFileName(url) {
        const arr = (url.split('?')[0]).split('/')
        const str = arr[arr.length - 1]
        return [str, str.split('.')[1]]
    }

    // 马赛克
    async draw(url, handleData) {
        this.url = url
        this.suffix = this.getSuffixAndFileName(url)[1]
        this.fileName = this.getSuffixAndFileName(url)[0]
        this.initMosaic()
        const img = new Image()
        img.src = url
        img.crossOrigin = ''//跨域
        img.onload = () => {
            const {pw, ph} = this.calculate(this.canvas.width, img.width, img.height)
            this.imgWH = [img.width, img.height]
            this.canvas.height = ph
            this.painting.drawImage(img, 0, 0, pw, ph)
            this.handleData.push(this.painting.getImageData(0, 0, this.canvas.width, this.canvas.height))
            this.handleData.push(...handleData.slice(1))
            this.painting.putImageData(this.handleData[this.handleData.length - 1], 0, 0)
        }
        document.addEventListener('keydown', (e) => this.keyListener(e, true))
        document.addEventListener('keyup', (e) => this.keyListener(e, false))
        this.container.onwheel = e => {
            if (!this.flag) return
            const {offsetX, offsetY, wheelDelta} = e
            if (wheelDelta > 0) {
                this.scale = this.scale - 0.1 >= 0.7 ? this.scale - 0.1 : 0.7
            } else {
                this.scale = this.scale + 0.1 <= 2.5 ? this.scale + 0.1 : 2.5
            }
            this.container.style.transform = `scale(${this.scale})`
            this.container.style.transformOrigin = `${offsetX}px ${offsetY}px`
        }
        this.canvas.onmousedown = e => {
            if (!this.brushFollow) return false
            this.isPrint = true
        }
        this.canvas.onmousemove = e => {
            const {offsetX, offsetY} = e
            if (!this.brushFollow) return false
            this.brush.style.transform = `translate(${offsetX - this.size / 2}px, ${offsetY - this.size / 2}px)`
            if (!this.isPrint) return false
            if (!this.judgeD([offsetX, offsetY], this.lastP, this.size / 2)) {
                this.lastP = [offsetX, offsetY]
                this.printMosaic(offsetX - (this.size / 2), offsetY - (this.size / 2), this.size, this.painting)
            }
        }
        this.canvas.onmouseup = e => {
            this.isPrint = false
            this.handleData.push(this.painting.getImageData(0, 0, this.canvas.width, this.canvas.height))
            this.cacheDeleteData = []
        }
        this.canvas.onmouseenter = e => {
            !this.brush && (this.initBrush())
            this.brushFollow = true
        }
        this.canvas.onmouseleave = e => {
            this.brush && this.brush.remove()
            this.brushFollow = false
            this.brush = null
        }
    }

    // url 转blob
    dataURLtoBlob(dataUrl, type) {
        let arr = dataUrl.split(','),
            str = atob(arr[1]),
            n = str.length,
            u8arr = new Uint8Array(n)
        while (n--) {
            u8arr[n] = str.charCodeAt(n)
        }
        return new Blob([u8arr], {type: type})
    }

    // 获取原大小图片并转换为文件
    async originSizeImage(handleData, imageWh, url) {
        //通过oss url 获取文件类型以及文件名
        const [fileName, suffix] = this.getSuffixAndFileName(url)
        // 创建一个canvas
        const canvas = this.createNewCanvas()
        canvas.width = 800
        const {ph} = this.calculate(canvas.width, imageWh[0], imageWh[1])
        canvas.height = ph
        canvas.style.display = 'none'
        const painting = canvas.getContext('2d', {willReadFrequently: true})
        // 将缓存的图片数据通过canvas画成图片
        for (let i = 0; i < handleData.length; i++) {
            painting.putImageData(handleData[i], 0, 0)
        }
        // 创建一个新的canvas
        const newCanvas = this.createNewCanvas()
        newCanvas.width = imageWh[0]
        newCanvas.height = imageWh[1]
        newCanvas.style.display = 'none'
        // this.container.appendChild(newCanvas)
        const ctx = this.getCanvasContext(newCanvas)
        const image = new Image()
        image.src = canvas.toDataURL('image/' + suffix)
        return new Promise(r => {
            image.onload = async () => {
                ctx.drawImage(image, 0, 0, imageWh[0], imageWh[1])
                const newImg = new Image()
                newImg.src = newCanvas.toDataURL('image/' + suffix)
                let blob = await this.dataURLtoBlob(newImg.src, 'image/' + suffix)
                //将blob转换为file
                let file = new window.File([blob], fileName, {type: 'image/' + suffix})
                r(file)
            }
        })
    }

    //撤销
    revocation() {
        if (this.handleData.length <= 1) return false
        this.handleData.pop()
        this.painting.putImageData(this.handleData[this.handleData.length - 1], 0, 0)
    }

    // 恢复
    recover() {
        if (this.handleData.length <= 1) return false
        this.handleData.length = 1
        this.painting.putImageData(this.handleData[0], 0, 0)
    }

    //  缓存数据
    getHandleData() {
        return {
            url: this.url,
            cache: this.handleData,
            imageWh: this.imgWH
        }
    }

    //   批量打码数据
    getBatchCache() {
        return this.batchCache
    }

    //清除批量打码数据
    clearBatchCache() {
        this.batchCache = []
    }

    //  批量打码
    async batchDraw(url, arr) {
        const handleData = []
        const img = new Image()
        img.src = url
        img.crossOrigin = ''//跨域
        return new Promise(r => {
            img.onload = () => {
                const {pw, ph} = this.calculate(800, img.width, img.height)
                const canvas = this.createNewCanvas()
                canvas.width = 800
                canvas.height = ph
                canvas.style.display = 'none'
                const painting = canvas.getContext('2d', {willReadFrequently: true})
                painting.drawImage(img, 0, 0, pw, ph)
                handleData.push(painting.getImageData(0, 0, canvas.width, canvas.height))
                for (let i = 0; i < arr.length; i++) {
                    this.printMosaic(...arr[i], painting, true)
                }
                handleData.push(painting.getImageData(0, 0, canvas.width, canvas.height))
                r({
                    url: url,
                    cache: handleData,
                    imageWh: [img.width, img.height]
                })
            }
        })
    }
}


```

:::

## 快速生成0-99的数组

```js
// ES6
[...Array(100).keys()]
```

## Array方法

### at通过索引获取元素

:::details 代码

```js
 const arr = [5, 12, 8, 130, 44]
arr.at() // 5  如果不填默认0
arr.at(1)// 12
arr.at(-1) // 44 如果index是负数 访问index + arr.length
arr.at(5) // undefined  index < -arr.length 或 arr >= array.length  直接返回undefined
```

:::

### concat合并两个或多个数组(返回一个新数组)(浅拷贝)

:::details 代码

```js
const arr1 = ['a', 'b', 'c'];
const arr2 = ['d', 'e', 'f'];
const arr3 = arr1.concat(arr2);// ["a", "b", "c", "d", "e", "f"]
//ES6扩展运算符
arr3 = [...arr1, ...arr2]// ["a", "b", "c", "d", "e", "f"]

// 注意
    ["a", "b", "c"].concat(1, [2, 3]) //['a', 'b', 'c', 1, 2, 3]
    [[1]].concat([2, [3]]) //[[1], 2, [3]]
```

:::

### copyWithin浅复制数组的一部分到同一数组中的另一个位置

:::details 代码

```js
// 不会改变数组长度的复制，改变原数组
// copyWithin(target, start, end)
[1, 2, 3, 4, 5].copyWithin(0, 3, 4)//[4, 2, 3, 4, 5]
//  如start < 0 则start + array.length
// end < 0，则实际是 end + array.length
    [1, 2, 3, 4, 5].copyWithin(0, -2, -1)//[4, 2, 3, 4, 5]
// 省略start 或 start < -array.length，则默认为 0
//省略end 或 end >= array.length，则默认为 array.length
    [1, 2, 3, 4, 5].copyWithin(2)//[1, 2, 1, 2, 3]
//end 位于 start 之前，则不会拷贝任何内容
    [1, 2, 3, 4, 5].copyWithin(2, 2, 1)//[1, 2, 3, 4, 5]
```

:::

### entries返回一个新的数组迭代器对象

:::details 代码

```js
const arr = ['a', 'b', 'c'];
const iterator = arr.entries()
for (el in iterator) {
    console.log(el)
}
//[0, "a"]
//[1, "b"]
//[2, "c"]
```

:::

### findLast 反向获取第一个符合条件的元素

:::details 代码

```js
const inventory = [
    {name: "apples", quantity: 2},
    {name: "bananas", quantity: 0},
    {name: "fish", quantity: 1},
    {name: "cherries", quantity: 5},
]
const result = inventory.findLast(({quantity}) => quantity < 2)//{ name: "fish", quantity: 1 }
```

:::

### fill方法用一个固定值填充一个数组中从起始索引（默认为 0）到终止索引（默认为 array.length）内的全部元素。它返回修改后的数组。

:::details 代码

```js
//fill(value, start, end)
[1, 2, 3].fill(4)//[4, 4, 4]
Array(3).fill(4) // [4, 4, 4]
// 同一个地址
const arr = Array(3).fill({}); // [{}, {}, {}] 
arr[0].hi = "hi"; // [{ hi: "hi" }, { hi: "hi" }, { hi: "hi" }]
```

:::

### flatMap等价于在调用 map() 方法后再调用深度为 1 的 flat() 方法

:::details 代码

```js
const arr1 = ["it's Sunny in", "", "California"];

arr1.map((x) => x.split(" "));
// [["it's","Sunny","in"],[""],["California"]]

arr1.flatMap((x) => x.split(" "));
// ["it's","Sunny","in", "", "California"]

```

:::

### fromAsync 将一个 promise 可迭代对象转换为一个数组的 promise

:::details 代码

```js
const asyncIterable = (async function* () {
    for (let i = 0; i < 5; i++) {
        await new Promise((resolve) => setTimeout(resolve, 10 * i));
        yield i;
    }
})();

Array.fromAsync(asyncIterable).then((array) => console.log(array));
// [0, 1, 2, 3, 4]
```

:::

### keys 新的数组迭代器对象

:::details 代码

```js
[...['a', 'b', 'c'].keys()]//[0,1,2]
```

:::

### lastIndexOf给定元素最后一次出现的索引

:::details 代码

```js
//lastIndexOf(searchElement, fromIndex)
const numbers = [2, 5, 9, 2];
numbers.lastIndexOf(2); // 3
numbers.lastIndexOf(7); // -1
numbers.lastIndexOf(2, 3); // 3
numbers.lastIndexOf(2, 2); // 0
numbers.lastIndexOf(2, -2); // 0
numbers.lastIndexOf(2, -1); // 3
```

:::

### of静态方法通过可变数量的参数创建一个新的 Array 实例

:::details 代码

```js
Array.of(1); // [1]
Array.of(1, 2, 3); // [1, 2, 3]
Array.of(undefined); // [undefined]
```

:::

### with返回一个新数组，其指定索引处的值会被新值替换。

:::details 代码

```js
//array.with(index, value)
const arr = [1, 2, 3, 4, 5];
console.log(arr.with(2, 6)); // [1, 2, 6, 4, 5]
console.log(arr); // [1, 2, 3, 4, 5]
```

:::
