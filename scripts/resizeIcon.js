/**
 * 图标调整脚本（命令行版本）
 * 使用 Node.js 和 sharp 库将图片调整为 1024x1024
 * 
 * 使用方法：
 * 1. 先安装 sharp: npm install --save-dev sharp
 * 2. 运行: node scripts/resizeIcon.js assets/logo.png assets/logo.png
 */

const fs = require('fs');
const path = require('path');

// 检查是否安装了 sharp
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('❌ 错误: 未安装 sharp 库');
  console.log('\n请先安装 sharp:');
  console.log('  npm install --save-dev sharp');
  console.log('\n或者使用在线工具手动调整图片尺寸为 1024x1024');
  process.exit(1);
}

const ICON_SIZE = 1024;

async function resizeIcon(sourcePath, outputPath) {
  try {
    // 检查源文件是否存在
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`源文件不存在: ${sourcePath}`);
    }

    console.log(`📷 开始处理图片: ${sourcePath}`);
    console.log(`📐 目标尺寸: ${ICON_SIZE}x${ICON_SIZE}px`);
    console.log(`📏 安全区域: 图标内容将保留 15% 边距（推荐）`);

    // 如果输入和输出是同一个文件，使用临时文件
    const isSameFile = path.resolve(sourcePath) === path.resolve(outputPath);
    const tempPath = isSameFile 
      ? path.join(path.dirname(sourcePath), `temp_${Date.now()}_${path.basename(sourcePath)}`)
      : outputPath;

    // 获取原始图片信息
    const sourceMetadata = await sharp(sourcePath).metadata();
    console.log(`📊 原始尺寸: ${sourceMetadata.width}x${sourceMetadata.height}px`);

    // 计算安全区域：保留 15% 的边距（Android 推荐）
    const safeAreaSize = Math.floor(ICON_SIZE * 0.65);
    const padding = Math.floor((ICON_SIZE - safeAreaSize) / 2);

    // 先调整图片到安全区域大小，保持宽高比
    const resizedImage = await sharp(sourcePath)
      .resize(safeAreaSize, safeAreaSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 } // 透明背景
      });

    // 创建 1024x1024 的画布，将调整后的图片居中放置
    await sharp({
      create: {
        width: ICON_SIZE,
        height: ICON_SIZE,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 } // 透明背景
      }
    })
      .composite([
        {
          input: await resizedImage.toBuffer(),
          left: padding,
          top: padding
        }
      ])
      .png()
      .toFile(tempPath);

    // 如果是同一个文件，先删除原文件，然后重命名临时文件
    if (isSameFile) {
      fs.unlinkSync(sourcePath); // 删除原文件
      fs.renameSync(tempPath, outputPath); // 重命名临时文件
    }

    // 获取处理后的图片信息
    const finalMetadata = await sharp(outputPath).metadata();
    const stats = fs.statSync(outputPath);
    const fileSizeKB = (stats.size / 1024).toFixed(2);
    
    console.log('\n✅ 图标处理完成！');
    console.log(`📁 输出文件: ${outputPath}`);
    console.log(`📏 实际尺寸: ${finalMetadata.width}x${finalMetadata.height}px`);
    console.log(`📐 内容区域: ${safeAreaSize}x${safeAreaSize}px (居中，边距 ${padding}px)`);
    console.log(`💾 文件大小: ${fileSizeKB} KB`);
    console.log('\n✨ 图标已准备好，可以用于 APP 了！');
    
  } catch (error) {
    console.error('❌ 处理失败:', error.message);
    process.exit(1);
  }
}

// 从命令行参数获取输入和输出路径
const args = process.argv.slice(2);
if (args.length < 1) {
  console.log('使用方法: node scripts/resizeIcon.js <源图片路径> [输出图片路径]');
  console.log('示例: node scripts/resizeIcon.js assets/logo.png assets/logo.png');
  console.log('\n如果没有指定输出路径，将覆盖源文件');
  process.exit(1);
}

const sourcePath = args[0];
const outputPath = args[1] || sourcePath; // 如果没有指定输出路径，覆盖源文件

// 检查源文件
if (!fs.existsSync(sourcePath)) {
  console.error(`❌ 错误: 源文件不存在: ${sourcePath}`);
  console.log('\n请确保图片文件路径正确');
  process.exit(1);
}

resizeIcon(sourcePath, outputPath);

