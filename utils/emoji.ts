/**
 * 表情 shortcode 到文件名的映射
 * 使用 Fluent Emoji Color 版本
 */
export const EMOJI_FILE_MAP: Record<string, string> = {
  // 常用表情的简化 shortcode
  ':smile:': 'smiling_face_color.svg',
  ':laugh:': 'rolling_on_the_floor_laughing_color.svg',
  ':love:': 'smiling_face_with_heart-eyes_color.svg',
  ':heart:': 'smiling_face_with_hearts_color.svg',
  ':kiss:': 'face_blowing_a_kiss_color.svg',
  ':hug:': 'hugging_face_color.svg',
  ':wink:': 'winking_face_color.svg',
  ':cool:': 'smiling_face_with_sunglasses_color.svg',
  ':sad:': 'slightly_frowning_face_color.svg',
  ':angry:': 'pouting_face_color.svg',
  ':surprised:': 'astonished_face_color.svg',
  ':thinking:': 'thinking_face_color.svg',
  ':star:': 'star-struck_color.svg',
  ':party:': 'partying_face_color.svg',
  ':pleading:': 'pleading_face_color.svg',
  ':grinning:': 'grinning_face_color.svg',
  ':grinning_eyes:': 'grinning_face_with_smiling_eyes_color.svg',
  ':tears_of_joy:': 'face_with_tears_of_joy_color.svg',
  ':loud_cry:': 'loudly_crying_face_color.svg',
  ':neutral:': 'neutral_face_color.svg',
  ':expressionless:': 'expressionless_face_color.svg',
  ':unamused:': 'unamused_face_color.svg',
  ':rolling_eyes:': 'face_with_rolling_eyes_color.svg',
  ':smirk:': 'smirking_face_color.svg',
  ':upside_down:': 'upside-down_face_color.svg',
  ':melting:': 'melting_face_color.svg',
  ':money_mouth:': 'money-mouth_face_color.svg',
  ':zipper_mouth:': 'zipper-mouth_face_color.svg',
  ':shushing:': 'shushing_face_color.svg',
  ':saluting:': 'saluting_face_color.svg',
  ':dizzy:': 'face_with_spiral_eyes_color.svg',
  ':confused:': 'confounded_face_color.svg',
  ':worried:': 'anxious_face_with_sweat_color.svg',
  ':fearful:': 'fearful_face_color.svg',
  ':cold_sweat:': 'downcast_face_with_sweat_color.svg',
  ':cry:': 'loudly_crying_face_color.svg',
  ':scream:': 'face_screaming_in_fear_color.svg',
  ':persevere:': 'persevering_face_color.svg',
  ':disappointed:': 'disappointed_face_color.svg',
  ':weary:': 'weary_face_color.svg',
  ':tired:': 'tired_face_color.svg',
  ':yawning:': 'yawning_face_color.svg',
  ':triumph:': 'face_with_steam_from_nose_color.svg',
  ':rage:': 'pouting_face_color.svg',
  ':cursing:': 'face_with_symbols_on_mouth_color.svg',
  ':kissing:': 'kissing_face_color.svg',
  ':kissing_closed_eyes:': 'kissing_face_with_closed_eyes_color.svg',
  ':kissing_smiling_eyes:': 'kissing_face_with_smiling_eyes_color.svg',
  ':tongue:': 'face_with_tongue_color.svg',
  ':wink_tongue:': 'winking_face_with_tongue_color.svg',
  ':squinting_tongue:': 'squinting_face_with_tongue_color.svg',
  ':drooling:': 'drooling_face_color.svg',
  ':slightly_smile:': 'slightly_smiling_face_color.svg',
  ':hugging:': 'hugging_face_color.svg',
  ':star_struck:': 'star-struck_color.svg',
  ':face_with_hand:': 'face_with_hand_over_mouth_color.svg',
  ':peeking:': 'face_with_peeking_eye_color.svg',
  ':raised_eyebrow:': 'face_with_raised_eyebrow_color.svg',
  ':thermometer:': 'face_with_thermometer_color.svg',
  ':hot:': 'hot_face_color.svg',
  ':cold:': 'cold_face_color.svg',
  ':holding_back_tears:': 'face_holding_back_tears_color.svg',
  ':savoring:': 'face_savoring_food_color.svg',
  ':vomiting:': 'face_vomiting_color.svg',
  ':exhaling:': 'face_exhaling_color.svg',
  ':medical_mask:': 'face_with_medical_mask_color.svg',
  ':knocked_out:': 'knocked-out_face_color.svg',
  ':symbols_mouth:': 'face_with_symbols_on_mouth_color.svg',
  ':tear:': 'smiling_face_with_tear_color.svg',
  ':halo:': 'smiling_face_with_halo_color.svg',
  ':zany:': 'zany_face_color.svg',
  ':sneezing:': 'sneezing_face_color.svg',
  ':grimacing:': 'grimacing_face_color.svg',
  ':beaming:': 'beaming_face_with_smiling_eyes_color.svg',
  ':grinning_sweat:': 'grinning_face_with_sweat_color.svg',
  ':grinning_squint:': 'grinning_squinting_face_color.svg',
  
  // 完整文件名映射（用于直接使用文件名作为 shortcode）
  ':anxious_face_with_sweat:': 'anxious_face_with_sweat_color.svg',
  ':astonished_face:': 'astonished_face_color.svg',
  ':beaming_face_with_smiling_eyes:': 'beaming_face_with_smiling_eyes_color.svg',
  ':cold_face:': 'cold_face_color.svg',
  ':confounded_face:': 'confounded_face_color.svg',
  ':disappointed_face:': 'disappointed_face_color.svg',
  ':downcast_face_with_sweat:': 'downcast_face_with_sweat_color.svg',
  ':drooling_face:': 'drooling_face_color.svg',
  ':expressionless_face:': 'expressionless_face_color.svg',
  ':face_blowing_a_kiss:': 'face_blowing_a_kiss_color.svg',
  ':face_exhaling:': 'face_exhaling_color.svg',
  ':face_holding_back_tears:': 'face_holding_back_tears_color.svg',
  ':face_savoring_food:': 'face_savoring_food_color.svg',
  ':face_screaming_in_fear:': 'face_screaming_in_fear_color.svg',
  ':face_vomiting:': 'face_vomiting_color.svg',
  ':face_with_hand_over_mouth:': 'face_with_hand_over_mouth_color.svg',
  ':face_with_medical_mask:': 'face_with_medical_mask_color.svg',
  ':face_with_peeking_eye:': 'face_with_peeking_eye_color.svg',
  ':face_with_raised_eyebrow:': 'face_with_raised_eyebrow_color.svg',
  ':face_with_rolling_eyes:': 'face_with_rolling_eyes_color.svg',
  ':face_with_spiral_eyes:': 'face_with_spiral_eyes_color.svg',
  ':face_with_steam_from_nose:': 'face_with_steam_from_nose_color.svg',
  ':face_with_symbols_on_mouth:': 'face_with_symbols_on_mouth_color.svg',
  ':face_with_tears_of_joy:': 'face_with_tears_of_joy_color.svg',
  ':face_with_thermometer:': 'face_with_thermometer_color.svg',
  ':face_with_tongue:': 'face_with_tongue_color.svg',
  ':fearful_face:': 'fearful_face_color.svg',
  ':grimacing_face:': 'grimacing_face_color.svg',
  ':grinning_face:': 'grinning_face_color.svg',
  ':grinning_face_with_smiling_eyes:': 'grinning_face_with_smiling_eyes_color.svg',
  ':grinning_face_with_sweat:': 'grinning_face_with_sweat_color.svg',
  ':grinning_squinting_face:': 'grinning_squinting_face_color.svg',
  ':hot_face:': 'hot_face_color.svg',
  ':hugging_face:': 'hugging_face_color.svg',
  ':kissing_face:': 'kissing_face_color.svg',
  ':kissing_face_with_closed_eyes:': 'kissing_face_with_closed_eyes_color.svg',
  ':kissing_face_with_smiling_eyes:': 'kissing_face_with_smiling_eyes_color.svg',
  ':knocked_out_face:': 'knocked-out_face_color.svg',
  ':loudly_crying_face:': 'loudly_crying_face_color.svg',
  ':melting_face:': 'melting_face_color.svg',
  ':money_mouth_face:': 'money-mouth_face_color.svg',
  ':neutral_face:': 'neutral_face_color.svg',
  ':partying_face:': 'partying_face_color.svg',
  ':persevering_face:': 'persevering_face_color.svg',
  ':pleading_face:': 'pleading_face_color.svg',
  ':pouting_face:': 'pouting_face_color.svg',
  ':rolling_on_the_floor_laughing:': 'rolling_on_the_floor_laughing_color.svg',
  ':saluting_face:': 'saluting_face_color.svg',
  ':shushing_face:': 'shushing_face_color.svg',
  ':slightly_frowning_face:': 'slightly_frowning_face_color.svg',
  ':slightly_smiling_face:': 'slightly_smiling_face_color.svg',
  ':smiling_face:': 'smiling_face_color.svg',
  ':smiling_face_with_halo:': 'smiling_face_with_halo_color.svg',
  ':smiling_face_with_heart_eyes:': 'smiling_face_with_heart-eyes_color.svg',
  ':smiling_face_with_hearts:': 'smiling_face_with_hearts_color.svg',
  ':smiling_face_with_smiling_eyes:': 'smiling_face_with_smiling_eyes_color.svg',
  ':smiling_face_with_sunglasses:': 'smiling_face_with_sunglasses_color.svg',
  ':smiling_face_with_tear:': 'smiling_face_with_tear_color.svg',
  ':smirking_face:': 'smirking_face_color.svg',
  ':sneezing_face:': 'sneezing_face_color.svg',
  ':squinting_face_with_tongue:': 'squinting_face_with_tongue_color.svg',
  ':thinking_face:': 'thinking_face_color.svg',
  ':tired_face:': 'tired_face_color.svg',
  ':unamused_face:': 'unamused_face_color.svg',
  ':upside_down_face:': 'upside-down_face_color.svg',
  ':weary_face:': 'weary_face_color.svg',
  ':winking_face:': 'winking_face_color.svg',
  ':winking_face_with_tongue:': 'winking_face_with_tongue_color.svg',
  ':yawning_face:': 'yawning_face_color.svg',
  ':zany_face:': 'zany_face_color.svg',
  ':zipper_mouth_face:': 'zipper-mouth_face_color.svg',
};

/**
 * 获取表情文件路径
 */
export function getEmojiPath(shortcode: string): string | null {
  return EMOJI_FILE_MAP[shortcode] || null;
}

/**
 * 表情 shortcode 映射表（用于兼容旧代码）
 * 返回文件名，实际渲染时使用 EmojiSvg 组件
 */
export const EMOJI_MAP: Record<string, string> = EMOJI_FILE_MAP;

/**
 * 特殊符号到 shortcode 的映射
 * 使用 [表情英文] 格式作为表情占位符
 * 例如：:sad: -> [sad]
 */
// 创建 shortcode 到占位符的映射
export const SHORTCODE_TO_PLACEHOLDER: Record<string, string> = {};
export const PLACEHOLDER_TO_SHORTCODE: Record<string, string> = {};

// 初始化映射表
Object.keys(EMOJI_FILE_MAP).forEach((shortcode) => {
  // 将 :sad: 格式转换为 [sad] 格式
  // 移除首尾的冒号
  const shortcodeWithoutColons = shortcode.replace(/^:/, '').replace(/:$/, '');
  const placeholder = `[${shortcodeWithoutColons}]`;
  SHORTCODE_TO_PLACEHOLDER[shortcode] = placeholder;
  PLACEHOLDER_TO_SHORTCODE[placeholder] = shortcode;
});

/**
 * 将文本中的 shortcode 转换为特殊符号占位符
 * @param text 包含 shortcode 的文本
 * @returns 转换后的文本（shortcode 被替换为特殊符号）
 */
export function convertShortcodesToPlaceholders(text: string): string {
  let result = text;
  // 按长度降序排序，优先匹配长的 shortcode（避免部分匹配问题）
  const shortcodes = Object.keys(SHORTCODE_TO_PLACEHOLDER).sort((a, b) => b.length - a.length);
  
  for (const shortcode of shortcodes) {
    const placeholder = SHORTCODE_TO_PLACEHOLDER[shortcode];
    result = result.replace(new RegExp(shortcode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), placeholder);
  }
  
  return result;
}

/**
 * 将文本中的特殊符号占位符转换为 shortcode
 * @param text 包含特殊符号的文本
 * @returns 转换后的文本（特殊符号被替换为 shortcode）
 */
export function convertPlaceholdersToShortcodes(text: string): string {
  let result = text;
  for (const [placeholder, shortcode] of Object.entries(PLACEHOLDER_TO_SHORTCODE)) {
    result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), shortcode);
  }
  return result;
}

/**
 * 检查位置是否是表情占位符的起始位置
 * 占位符格式：[表情英文]，例如 [sad]
 */
export function isEmojiPlaceholder(text: string, index: number): boolean {
  if (index >= text.length) return false;
  
  // 检查当前位置是否是 '[' 且后面跟着有效的 shortcode
  if (text[index] !== '[') {
    return false;
  }
  
  // 查找匹配的 ']'
  const endIndex = text.indexOf(']', index);
  if (endIndex === -1) {
    return false;
  }
  
  // 提取占位符文本 [shortcode]
  const placeholder = text.substring(index, endIndex + 1);
  return placeholder in PLACEHOLDER_TO_SHORTCODE;
}

/**
 * 表情 shortcode 正则表达式
 * 匹配 :[a-z0-9_+\-]+: 格式
 */
export const SHORTCODE_REGEX = /:([a-z0-9_+\-]+):/gi;

/**
 * 检查光标前是否是完整的 shortcode 或占位符
 * @param text 文本内容
 * @param cursorPosition 光标位置
 * @returns 如果是 shortcode 或占位符，返回匹配信息，否则返回 null
 */
export function checkShortcodeBeforeCursor(
  text: string,
  cursorPosition: number
): { start: number; end: number; shortcode: string } | null {
  if (cursorPosition === 0) return null;

  // 首先检查是否是占位符（格式：[表情英文]）
  if (cursorPosition >= 1) {
    // 向前查找匹配的 ']'
    let endIndex = cursorPosition;
    let startIndex = cursorPosition - 1;
    
    // 向前查找 ']'
    while (startIndex >= 0 && text[startIndex] !== ']') {
      startIndex--;
    }
    
    // 如果找到了 ']'，继续向前查找 '['
    if (startIndex >= 0 && text[startIndex] === ']') {
      const bracketEnd = startIndex;
      startIndex--;
      while (startIndex >= 0 && text[startIndex] !== '[') {
        startIndex--;
      }
      
      // 如果找到了 '[' 和 ']'，检查是否是有效的占位符
      if (startIndex >= 0 && text[startIndex] === '[') {
        const placeholder = text.substring(startIndex, bracketEnd + 1);
        if (placeholder in PLACEHOLDER_TO_SHORTCODE) {
          return {
            start: startIndex,
            end: bracketEnd + 1,
            shortcode: PLACEHOLDER_TO_SHORTCODE[placeholder],
          };
        }
      }
    }
  }

  // 从光标位置向前查找 shortcode（兼容旧数据）
  const beforeCursor = text.substring(0, cursorPosition);
  
  // 匹配最后一个可能的 shortcode
  const matches = Array.from(beforeCursor.matchAll(SHORTCODE_REGEX));
  if (matches.length === 0) return null;

  // 获取最后一个匹配
  const lastMatch = matches[matches.length - 1];
  const matchStart = lastMatch.index!;
  const matchEnd = matchStart + lastMatch[0].length;

  // 检查这个 shortcode 是否刚好在光标前
  if (matchEnd === cursorPosition) {
    return {
      start: matchStart,
      end: matchEnd,
      shortcode: lastMatch[0],
    };
  }

  return null;
}

/**
 * 解析文本中的 shortcode，返回片段数组
 * @param text 文本内容（可能包含 shortcode 或占位符）
 * @returns 片段数组，每个片段包含 type ('text' | 'emoji') 和 content
 */
export interface TextSegment {
  type: 'text' | 'emoji';
  content: string;
  shortcode?: string;
  placeholder?: string; // 占位符字符
}

export function parseShortcodes(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let lastIndex = 0;

  // 首先检查占位符（优先级更高，占位符是单个字符）
  for (let i = 0; i < text.length; i++) {
    // 检查从当前位置开始的字符是否是占位符
    if (isEmojiPlaceholder(text, i)) {
      // 添加之前的文本
      if (i > lastIndex) {
        segments.push({
          type: 'text',
          content: text.substring(lastIndex, i),
        });
      }
      
      // 查找匹配的 ']'
      const endIndex = text.indexOf(']', i);
      if (endIndex !== -1) {
        // 获取占位符文本 [shortcode]
        const placeholder = text.substring(i, endIndex + 1);
        const shortcode = PLACEHOLDER_TO_SHORTCODE[placeholder];
        segments.push({
          type: 'emoji',
          content: placeholder, // 占位符文本 [sad]
          shortcode: shortcode,
          placeholder: placeholder,
        });
        lastIndex = endIndex + 1; // 跳过整个占位符
        i = endIndex; // 继续从 ']' 之后开始
      }
    }
  }

  // 添加剩余的文本
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex);
    // 检查剩余文本中是否还有 shortcode（兼容旧数据）
    let textLastIndex = 0;
    SHORTCODE_REGEX.lastIndex = 0;
    let match;
    
    while ((match = SHORTCODE_REGEX.exec(remainingText)) !== null) {
      // 添加匹配前的文本
      if (match.index > textLastIndex) {
        segments.push({
          type: 'text',
          content: remainingText.substring(textLastIndex, match.index),
        });
      }

      // 添加表情
      const shortcode = match[0];
      if (EMOJI_FILE_MAP[shortcode]) {
        segments.push({
          type: 'emoji',
          content: shortcode,
          shortcode: shortcode,
        });
      } else {
        segments.push({
          type: 'text',
          content: shortcode,
        });
      }

      textLastIndex = match.index + match[0].length;
    }

    // 添加剩余的文本
    if (textLastIndex < remainingText.length) {
      segments.push({
        type: 'text',
        content: remainingText.substring(textLastIndex),
      });
    }
  }

  // 如果没有匹配到任何内容，返回整个文本
  if (segments.length === 0) {
    segments.push({
      type: 'text',
      content: text,
    });
  }

  return segments;
}

/**
 * 获取所有可用的表情 shortcode 列表
 * 去重：只保留简化 shortcode，移除完整文件名映射以避免重复
 */
export function getAvailableEmojis(): {
  shortcode: string;
  name: string;
  filename: string;
}[] {
  const seen = new Set<string>();
  const emojis: { shortcode: string; name: string; filename: string }[] = [];
  
  for (const [shortcode, filename] of Object.entries(EMOJI_FILE_MAP)) {
    if (!seen.has(filename)) {
      seen.add(filename);
      emojis.push({
        shortcode,
        name: shortcode.replace(/:/g, ''),
        filename,
      });
    }
  }
  
  return emojis;
}

export function isPrivateUseChar(char: string): boolean {
  if (char.length !== 1) return false;
  const code = char.charCodeAt(0);
  return code >= 0xE000 && code <= 0xF8FF;
}