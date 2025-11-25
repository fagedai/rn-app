/**
 * 性别工具函数
 * 存储格式：1=男, 2=女, 3=不愿意透露
 */

export type GenderCode = 1 | 2 | 3;
export type GenderDisplayText = '男' | '女' | '不愿意透露';

// 性别映射表
const GENDER_MAP: Record<GenderCode, GenderDisplayText> = {
  1: '男',
  2: '女',
  3: '不愿意透露',
};

const GENDER_REVERSE_MAP: Record<GenderDisplayText, GenderCode> = {
  男: 1,
  女: 2,
  不愿意透露: 3,
};

/**
 * 将数字性别代码转换为显示文本
 */
export function genderCodeToText(code: GenderCode | null | undefined): GenderDisplayText | '' {
  if (code === null || code === undefined) {
    return '';
  }
  return GENDER_MAP[code] || '';
}

/**
 * 将显示文本转换为数字性别代码
 */
export function genderTextToCode(text: GenderDisplayText): GenderCode {
  return GENDER_REVERSE_MAP[text];
}

/**
 * 获取所有性别的显示文本数组（按数字顺序）
 */
export function getAllGenderTexts(): GenderDisplayText[] {
  return [GENDER_MAP[1], GENDER_MAP[2], GENDER_MAP[3]];
}

/**
 * 获取所有性别的代码数组
 */
export function getAllGenderCodes(): GenderCode[] {
  return [1, 2, 3];
}

/**
 * 将数字性别代码转换为显示符号
 * 存储格式：1=男, 2=女, 3=不愿意透露
 */
export function genderCodeToSymbol(code: GenderCode | null | undefined): string {
  if (code === null || code === undefined) {
    return '';
  }
  if (code === 1) return '♂';
  if (code === 2) return '♀';
  return ''; // 不愿意透露不显示符号
}

/**
 * 将AI性别代码转换为显示符号
 * AI性别格式：1=男, 2=女, 3=不愿意透露
 */
export function aiGenderCodeToSymbol(code: 1 | 2 | 3 | null | undefined): string {
  if (code === null || code === undefined) {
    return '';
  }
  if (code === 1) return '♂';
  if (code === 2) return '♀';
  return '保密'; // 不愿意透露显示"保密"
}

