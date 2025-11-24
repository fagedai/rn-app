/**
 * 日期工具函数
 */

/**
 * 判断是否为闰年
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * 获取指定年月的最大天数
 */
export function getDaysInMonth(year: number, month: number): number {
  // 大月（31天）：1, 3, 5, 7, 8, 10, 12
  // 小月（30天）：4, 6, 9, 11
  // 2月：闰年29天，平年28天
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28;
  }
  if ([1, 3, 5, 7, 8, 10, 12].includes(month)) {
    return 31;
  }
  return 30;
}

/**
 * 格式化生日显示
 */
export function formatBirthday(birthday: {
  year: number;
  month: number;
  day: number;
} | null): string {
  if (!birthday) {
    return '';
  }
  const { year, month, day } = birthday;
  return `${year}年${month}月${day}日`;
}

