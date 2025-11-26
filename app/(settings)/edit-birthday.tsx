import React, { useRef, useEffect, useState } from 'react';
import { View, ImageBackground, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeArea } from '@/hooks/useSafeArea';
import { LoginHeader } from '@/components/common/LoginHeader';
import { DatePickerColumn } from '@/components/login/DatePickerColumn';
import { QuestionnaireLayout } from '@/components/questionnaire/QuestionnaireLayout';
import { QuestionnaireFloorButtons } from '@/components/questionnaire/QuestionnaireFloorButtons';
import { useUserStore } from '@/store/userStore';
import { updateUserInfo } from '@/services/api/user';
import { ErrorModal } from '@/components/common/ErrorModal';
import { useErrorModal } from '@/hooks/useErrorModal';
import { isLeapYear, getDaysInMonth, formatBirthday } from '@/utils/dateUtils';

const HEADER_HEIGHT = 44; // LoginHeader 高度

const ITEM_HEIGHT = 50;
const TITLE_HEIGHT = 32; // 标题高度：16px字体（约24px行高） + 8px marginBottom

export default function EditBirthday() {
  const router = useRouter();
  const { top } = useSafeArea();
  const { userInfo, setBirthday } = useUserStore();
  const errorModal = useErrorModal();
  
  // 获取当前日期
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();
  
  // 从用户信息获取生日，如果没有则使用当前日期
  const initialBirthday = userInfo.birthday || {
    year: currentYear,
    month: currentMonth,
    day: currentDay,
  };
  
  // 本地状态管理选中的年月日
  const [selectedYear, setSelectedYear] = useState(initialBirthday.year);
  const [selectedMonth, setSelectedMonth] = useState(initialBirthday.month);
  const [selectedDay, setSelectedDay] = useState(initialBirthday.day);

  const yearScrollRef = useRef<ScrollView>(null);
  const monthScrollRef = useRef<ScrollView>(null);
  const dayScrollRef = useRef<ScrollView>(null);

  // 生成年份列表（从1970到当前年份）
  const years = Array.from({ length: currentYear - 1970 + 1 }, (_, i) => 1970 + i);
  // 生成月份列表（1-12）
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  // 获取允许的最大日期（不能超出今日的范围）
  const getMaxDay = (year: number, month: number) => {
    const maxDaysInMonth = getDaysInMonth(year, month);
    // 如果是当前年月，则不能超过今日的日期
    if (year === currentYear && month === currentMonth) {
      return Math.min(maxDaysInMonth, currentDay);
    }
    return maxDaysInMonth;
  };
  // 生成日期列表（根据选中的年月动态生成）
  const days = Array.from({ length: getMaxDay(selectedYear, selectedMonth) }, (_, i) => i + 1);

  // 初始化滚动位置
  useEffect(() => {
    setTimeout(() => {
      const yearIndex = years.indexOf(selectedYear);
      const monthIndex = months.indexOf(selectedMonth);
      const maxDay = getMaxDay(selectedYear, selectedMonth);
      const currentDays = Array.from({ length: maxDay }, (_, i) => i + 1);
      // 确保选中的日期不超过最大允许日期
      const validDay = Math.min(selectedDay, maxDay);
      const dayIndex = currentDays.indexOf(validDay);
      
      if (yearIndex >= 0) {
        yearScrollRef.current?.scrollTo({
          y: yearIndex * ITEM_HEIGHT,
          animated: false,
        });
      }
      if (monthIndex >= 0) {
        monthScrollRef.current?.scrollTo({
          y: monthIndex * ITEM_HEIGHT,
          animated: false,
        });
      }
      if (dayIndex >= 0 && dayIndex < currentDays.length) {
        dayScrollRef.current?.scrollTo({
          y: dayIndex * ITEM_HEIGHT,
          animated: false,
        });
      }
      // 如果日期被调整，更新状态
      if (validDay !== selectedDay) {
        setSelectedDay(validDay);
      }
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 当年或月改变时，调整日期并更新日期列表
  useEffect(() => {
    const maxDay = getMaxDay(selectedYear, selectedMonth);
    if (selectedDay > maxDay) {
      // 如果选择的日期超过最大允许日期，自动调整到最大日期
      setSelectedDay(maxDay);
      // 重新定位日期滚动
      const currentDays = Array.from({ length: maxDay }, (_, i) => i + 1);
      const dayIndex = currentDays.indexOf(maxDay);
      if (dayIndex >= 0) {
        setTimeout(() => {
          dayScrollRef.current?.scrollTo({
            y: dayIndex * ITEM_HEIGHT,
            animated: true,
          });
        }, 50);
      }
    } else {
      // 重新定位日期滚动
      const currentDays = Array.from({ length: maxDay }, (_, i) => i + 1);
      const dayIndex = currentDays.indexOf(selectedDay);
      if (dayIndex >= 0) {
        setTimeout(() => {
          dayScrollRef.current?.scrollTo({
            y: dayIndex * ITEM_HEIGHT,
            animated: true,
          });
        }, 50);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedMonth]);

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  const handleMonthChange = (month: number) => {
    setSelectedMonth(month);
  };

  const handleDayChange = (day: number) => {
    setSelectedDay(day);
  };

  const handleScroll = (
    event: any,
    data: number[],
    setValue: (value: number) => void
  ) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    if (index >= 0 && index < data.length) {
      setValue(data[index]);
    }
  };

  // 显示Toast

  // 处理保存按钮点击
  const handleSave = async () => {
    const dateToSubmit = {
      year: selectedYear,
      month: selectedMonth,
      day: selectedDay,
    };
    
    // 前端验证：检查日期是否有效
    const date = new Date(dateToSubmit.year, dateToSubmit.month - 1, dateToSubmit.day);
    if (
      date.getFullYear() !== dateToSubmit.year ||
      date.getMonth() !== dateToSubmit.month - 1 ||
      date.getDate() !== dateToSubmit.day
    ) {
      errorModal.show('请选择有效的日期');
      return;
    }

    try {
      // 检查生日是否有变化
      const hasChanged = 
        !userInfo.birthday ||
        userInfo.birthday.year !== dateToSubmit.year ||
        userInfo.birthday.month !== dateToSubmit.month ||
        userInfo.birthday.day !== dateToSubmit.day;
      
      if (!hasChanged) {
        router.back();
        return;
      }

      // 将生日格式化为 ISO 8601 格式字符串（YYYY-MM-DD）
      const birthdayString = `${dateToSubmit.year}-${String(dateToSubmit.month).padStart(2, '0')}-${String(dateToSubmit.day).padStart(2, '0')}`;
      
      // 调用后端API更新生日（只传变更的字段）
      if (userInfo.token) {
        await updateUserInfo(userInfo.token, {
          birthday: birthdayString,
        });
      }
      
      // 更新本地store
      setBirthday(dateToSubmit);
      
      // 显示成功提示
      errorModal.show('修改成功', '修改成功');
      
      // 延迟返回，让用户看到成功提示
      setTimeout(() => {
        router.back();
      }, 500);
    } catch (error) {
      console.error('修改生日失败:', error);
      const errorMessage = error instanceof Error ? error.message : '修改失败，请稍后重试';
      errorModal.show(errorMessage);
    }
  };

  return (
    <ImageBackground
      source={require('@/assets/setting_backgorund.png')}
      resizeMode="cover"
      className="flex-1"
    >
      <LoginHeader title="修改生日" backButton={true} />
      <QuestionnaireLayout
        header={<View />} // LoginHeader 是绝对定位的，header 模块为空
        headerHeight={top + HEADER_HEIGHT + 10} // 安全区域 + header高度 + 10px间距
        content={
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                alignItems: 'center',
                width: '100%',
                maxWidth: 365,
                position: 'relative',
              }}
            >
              {/* 三个日期列，包含标题 */}
              <View
                style={{
                  flexDirection: 'row',
                  width: '100%',
                  position: 'relative',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                }}
              >
                {/* 整体选中指示器：横跨所有三列，玻璃边框+深色背景，圆角100 */}
                {/* 选中指示器在列表容器的中间行（第3行，索引2），位于标题下方 */}
                <LinearGradient
                  colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.18)']}
                  locations={[0, 0.5, 1]}
                  style={{
                    position: 'absolute',
                    top: TITLE_HEIGHT + ITEM_HEIGHT * 2,
                    left: 0,
                    right: 0,
                    height: ITEM_HEIGHT,
                    borderRadius: 100,
                    padding: 1,
                    zIndex: -1,
                    pointerEvents: 'none',
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      borderRadius: 100,
                      backgroundColor: 'rgba(6, 6, 6, 0.25)',
                    }}
                  />
                </LinearGradient>
                <DatePickerColumn
                  data={years}
                  selectedValue={selectedYear}
                  setValue={handleYearChange}
                  scrollRef={yearScrollRef}
                  suffix="年"
                  title="年"
                  roundedClass="rounded-l-full"
                  hideLeftBorder={false}
                  hideRightBorder={true}
                  onScroll={handleScroll}
                  showBackground={false}
                />
                <DatePickerColumn
                  data={months}
                  selectedValue={selectedMonth}
                  setValue={handleMonthChange}
                  scrollRef={monthScrollRef}
                  suffix="月"
                  title="月"
                  hideLeftBorder={true}
                  hideRightBorder={true}
                  onScroll={handleScroll}
                  showBackground={false}
                />
                <DatePickerColumn
                  data={days}
                  selectedValue={selectedDay}
                  setValue={handleDayChange}
                  scrollRef={dayScrollRef}
                  suffix="日"
                  title="日"
                  roundedClass="rounded-r-full"
                  hideLeftBorder={true}
                  hideRightBorder={false}
                  onScroll={handleScroll}
                  showBackground={false}
                />
              </View>
            </View>
          </View>
        }
        floor={
          <QuestionnaireFloorButtons
            onBack={() => router.back()}
            onNext={handleSave}
            backText="取消"
            nextText="保存"
            showPrivacyNotice={false}
          />
        }
      />
      <ErrorModal
        visible={errorModal.visible}
        message={errorModal.error}
        title={errorModal.title || '操作失败'}
        onClose={errorModal.hide}
      />
    </ImageBackground>
  );
}

