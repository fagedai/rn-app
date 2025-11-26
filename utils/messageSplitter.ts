/**
 * 消息分割工具
 * 根据换行符将长消息分割成多个消息气泡
 */

/**
 * 分割消息内容
 * 规则：
 * - \n\n（双换行符）作为段落分隔符，分割成不同的消息气泡
 * - 如果只有单个 \n，不分割（保留在同一个气泡内）
 * - 分割后的每个部分会去除首尾空白
 * 
 * @param content 原始消息内容
 * @returns 分割后的消息内容数组
 */
export function splitMessageByNewlines(content: string): string[] {
  if (!content || content.trim().length === 0) {
    return [content];
  }

  // 使用 \n\n 作为分隔符（段落分隔）
  // 使用正则表达式匹配连续的换行符（\n\n 或更多）
  const parts = content.split(/\n\n+/);
  
  // 过滤空字符串并去除首尾空白
  const filteredParts = parts
    .map(part => part.trim())
    .filter(part => part.length > 0);

  // 如果分割后只有一个部分，返回原内容
  if (filteredParts.length <= 1) {
    return [content];
  }

  return filteredParts;
}

