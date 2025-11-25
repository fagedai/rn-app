# APP 图标设置说明

## ✅ 已完成的操作

1. ✅ 已将 `app.json` 中的图标配置更新为使用 `assets/logo.png`
2. ✅ 已创建图标调整工具页面 `app/resize-icon.tsx`
3. ✅ 已创建命令行脚本 `scripts/resizeIcon.js`

## 📋 您需要完成的步骤

### 方法一：使用命令行脚本（最简单，推荐）⭐

1. **安装 sharp 库**（如果还没有安装）：
   ```bash
   npm install --save-dev sharp
   ```

2. **运行脚本**：
   ```bash
   node scripts/resizeIcon.js assets/logo.png assets/logo.png
   ```
   
   脚本会自动将 `assets/logo.png` 调整为 1024x1024 像素并覆盖原文件。

### 方法二：使用 Expo 页面工具

1. **确保 logo.png 已放在 assets 文件夹中**

2. **启动 Expo 开发服务器**：
   ```bash
   npx expo start
   ```

3. **访问图标调整页面**：
   - 在 Expo Go 应用中导航到 `/resize-icon` 页面
   - 或者在浏览器中访问：`http://localhost:8081/resize-icon`（如果使用 Expo Web）
   - 工具会自动将 logo.png 调整为 1024x1024 像素

4. **替换原文件**：
   - 工具处理完成后，会在控制台输出处理后的图片路径
   - 将处理后的图片复制并替换 `assets/logo.png`

### 方法三：手动调整（如果以上方法不可用）

1. **使用图片编辑软件**（如 Photoshop、GIMP、在线工具等）：
   - 打开 `assets/logo.png`
   - 将图片调整为 **1024x1024 像素**
   - 保持 PNG 格式（支持透明度）
   - 保存并替换原文件

2. **推荐的在线工具**：
   - https://www.iloveimg.com/resize-image
   - https://www.resizepixel.com/
   - https://imageresizer.com/

### 方法四：使用 ImageMagick（如果已安装）

```bash
# Windows (需要先安装 ImageMagick)
magick assets/logo.png -resize 1024x1024 assets/logo.png

# macOS/Linux
convert assets/logo.png -resize 1024x1024 assets/logo.png
```

## 📱 图标要求

- **尺寸**：1024x1024 像素（正方形）
- **格式**：PNG（支持透明度）
- **背景**：建议使用透明背景或纯色背景
- **内容**：图标内容应居中，四周留适当边距（建议 10-15%）

## 🔄 更新图标后的操作

1. **重新构建应用**：
   ```bash
   # 清除缓存并重新构建
   npx expo prebuild --clean
   ```

2. **iOS**：
   - 运行 `npx expo run:ios`
   - 或使用 Xcode 打开项目并重新构建

3. **Android**：
   - 运行 `npx expo run:android`
   - 或使用 Android Studio 打开项目并重新构建

4. **Web**：
   - 图标会自动更新，刷新浏览器即可看到

## 📝 注意事项

- ⚠️ **图标尺寸必须为 1024x1024**，否则可能在某些平台上显示异常
- ⚠️ **Android Adaptive Icon**：如果您的图标不是正方形或需要特殊处理，可能需要创建 `adaptive-icon.png`
- ⚠️ **iOS**：iOS 会自动处理图标的各种尺寸，但基础图标必须是 1024x1024
- ⚠️ **缓存问题**：如果更新图标后没有变化，尝试清除缓存：
  ```bash
  npx expo start --clear
  ```

## 🎨 当前配置

- **主图标**：`./assets/logo.png`
- **Web Favicon**：`./assets/logo.png`
- **Android Adaptive Icon**：`./assets/logo.png`（前景图）
- **Android Adaptive Icon 背景色**：`#ffffff`（白色）

如果需要修改 Android Adaptive Icon 的背景色，可以在 `app.json` 中修改：
```json
"android": {
  "adaptiveIcon": {
    "foregroundImage": "./assets/logo.png",
    "backgroundColor": "#你的颜色代码"
  }
}
```

