# dm 通用 OCR

> 运行条件：本页适用于提供 `dm` 全局对象的 Monkey King 6.7.0 构建。

`dm.Ocr` 是公开字库点阵识别；`dm.ocrAuto` 是通用 OCR 入口，使用已安装的原生 RapidOCR 推理资源。两者的模型、延迟、结果结构和依赖不同，`Ocr` 不会自动回退到 `ocrAuto`。

```js
requestScreenCapture();
const frame = captureScreen();
try {
    dm.setImage(frame);
    const blocks = dm.ocrAuto({ maxSideLen: 0, doAngle: false });
    console.log(JSON.stringify(blocks));
} finally {
    dm.useScreen();
    frame.recycle();
}
```

通用 OCR 模型按需加载。没有模型或运行时资源时应显示能力不可用，不把错误伪装成空识别结果。设备端验证和离线预览的耗时、得分字段分开记录。
