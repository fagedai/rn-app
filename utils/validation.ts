/**
 * 问卷验证工具函数
 */

/**
 * 验证姓名
 * 中文≤6，英文≤15
 */
export function validateName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: '请输入姓名' };
  }

  const trimmedName = name.trim();
  
  // 检查是否包含中文字符
  const hasChinese = /[\u4e00-\u9fa5]/.test(trimmedName);
  // 检查是否包含英文字符
  const hasEnglish = /[a-zA-Z]/.test(trimmedName);
  
  if (hasChinese && hasEnglish) {
    return { valid: false, error: '姓名不能同时包含中文和英文' };
  }

  if (hasChinese) {
    // 中文姓名：字符数≤6
    if (trimmedName.length > 6) {
      return { valid: false, error: '中文姓名不能超过6个字符' };
    }
  } else if (hasEnglish) {
    // 英文姓名：字符数≤15
    if (trimmedName.length > 15) {
      return { valid: false, error: '英文姓名不能超过15个字符' };
    }
  } else {
    // 既没有中文也没有英文，可能是其他字符
    return { valid: false, error: '请输入有效的姓名（中文或英文）' };
  }

  return { valid: true };
}

/**
 * 验证生日
 * 需要完整的年月日
 */
export function validateBirthday(birthday: {
  year: number;
  month: number;
  day: number;
} | null): { valid: boolean; error?: string } {
  if (!birthday) {
    return { valid: false, error: '请选择生日' };
  }

  const { year, month, day } = birthday;

  // 检查年月日是否有效
  if (!year || !month || !day) {
    return { valid: false, error: '请选择完整的生日（年月日）' };
  }

  // 检查日期是否有效
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return { valid: false, error: '请选择有效的日期' };
  }

  // 检查日期不能是未来
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date > today) {
    return { valid: false, error: '生日不能是未来的日期' };
  }

  return { valid: true };
}

/**
 * 验证单选选项
 */
export function validateSingleChoice(value: string | null): { valid: boolean; error?: string } {
  if (!value || value.trim().length === 0) {
    return { valid: false, error: '请选择一个选项' };
  }
  return { valid: true };
}

/**
 * 验证多选选项（至少选择1个）
 */
export function validateMultipleChoice(values: string[]): { valid: boolean; error?: string } {
  if (!values || values.length === 0) {
    return { valid: false, error: '请至少选择一个选项' };
  }
  return { valid: true };
}

