import React, { useRef, useEffect, useState } from 'react';
import { View, ImageBackground, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeArea } from '@/hooks/useSafeArea';
import { LoginHeader } from '@/components/common/LoginHeader';
import { StepIndicator } from '@/components/common/StepIndicator';
import { DatePickerColumn } from '@/components/login/DatePickerColumn';
import { useUserStore } from '@/store/userStore';
import { useQuestionnaireStore } from '@/store/questionnaireStore';
import { validateBirthday } from '@/utils/validation';
import { ErrorModal } from '@/components/common/ErrorModal';
import { getDaysInMonth } from '@/utils/dateUtils';
import { useErrorModal } from '@/hooks/useErrorModal';
import { QuestionnaireLayout } from '@/components/questionnaire/QuestionnaireLayout';
import { QuestionnaireFloorButtons } from '@/components/questionnaire/QuestionnaireFloorButtons';

const HEADER_HEIGHT = 44; // LoginHeader 高度

const ITEM_HEIGHT = 50;
const TITLE_HEIGHT = 32; // 标题高度：16px字体（约24px行高） + 8px marginBottom

export default function LoginBirthday() {
  const router = useRouter();
  const { top } = useSafeArea();
  const { userInfo, setBirthday } = useUserStore();
  const { setQ3Birthday } = useQuestionnaireStore();
  const errorModal = useErrorModal();
  
  // 获取当前日期作为默认值
  const now = new Date();
  const defaultYear = now.getFullYear();
  const defaultMonth = now.getMonth() + 1;
  const defaultDay = now.getDate();
  
  const selectedYear = userInfo.birthday?.year || defaultYear;
  const selectedMonth = userInfo.birthday?.month || defaultMonth;
  const selectedDay = userInfo.birthday?.day || defaultDay;

  const yearScrollRef = useRef<ScrollView>(null);
  const monthScrollRef = useRef<ScrollView>(null);
  const dayScrollRef = useRef<ScrollView>(null);

  // 标记用户是否滑动过
  const [hasUserScrolled, setHasUserScrolled] = useState(false);

  // 如果用户信息中没有生日，初始化设置为当前日期
  useEffect(() => {
    if (!userInfo.birthday) {
      setBirthday({
        year: defaultYear,
        month: defaultMonth,
        day: defaultDay,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 生成年份列表（从1970到当前年份）
  const currentYear = now.getFullYear();
  const years = Array.from({ length: currentYear - 1970 + 1 }, (_, i) => 1970 + i);
  // 生成月份列表
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  // 获取允许的最大日期（不能超出今日的范围）
  const getMaxDay = (year: number, month: number) => {
    const maxDaysInMonth = getDaysInMonth(year, month);
    // 如果是当前年月，则不能超过今日的日期
    if (year === currentYear && month === now.getMonth() + 1) {
      return Math.min(maxDaysInMonth, now.getDate());
    }
    return maxDaysInMonth;
  };
  // 生成日期列表（根据选中的年月动态生成，且不能超出今日的范围）
  const days = Array.from({ length: getMaxDay(selectedYear, selectedMonth) }, (_, i) => i + 1);

  useEffect(() => {
    // 初始定位到选中的值
    // 注意：由于列表有 paddingVertical: ITEM_HEIGHT * 2，所以滚动位置就是 index * ITEM_HEIGHT
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
        setBirthday({ year: selectedYear, month: selectedMonth, day: validDay });
      }
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 当年或月改变时，调整日期并更新日期列表
  useEffect(() => {
    const maxDay = getMaxDay(selectedYear, selectedMonth);
    if (selectedDay > maxDay) {
      // 如果选择的日期超过最大允许日期，自动调整到最大日期
      setBirthday({ year: selectedYear, month: selectedMonth, day: maxDay });
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
    setHasUserScrolled(true);
    setBirthday({ year, month: selectedMonth, day: selectedDay });
  };

  const handleMonthChange = (month: number) => {
    setHasUserScrolled(true);
    setBirthday({ year: selectedYear, month, day: selectedDay });
  };

  const handleDayChange = (day: number) => {
    setHasUserScrolled(true);
    setBirthday({ year: selectedYear, month: selectedMonth, day });
  };

  const handleScroll = (
    event: any,
    data: number[],
    setValue: (value: number) => void
  ) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    if (index >= 0 && index < data.length) {
      setHasUserScrolled(true);
      setValue(data[index]);
    }
  };

  // 处理下一步按钮点击
  const handleNext = () => {
    let dateToSubmit;
    
    if (hasUserScrolled) {
      // 用户滑动过，提交用户选择的日期
      dateToSubmit = {
        year: selectedYear,
        month: selectedMonth,
        day: selectedDay,
      };
    } else {
      // 用户未滑动，提交默认日期（今日）
      dateToSubmit = {
        year: defaultYear,
        month: defaultMonth,
        day: defaultDay,
      };
    }
    
    // 验证
    const validation = validateBirthday(dateToSubmit);
    if (!validation.valid) {
      errorModal.show(validation.error || '请选择有效的生日');
      return;
    }
    
    // 保存临时答案
    setBirthday(dateToSubmit);
    setQ3Birthday(dateToSubmit);
    
    // 进入Q4界面（role页面）
    router.push('/(questionnaire)/role');
  };

  return (
    <ImageBackground
      source={require('@/assets/login_background.png')}
      resizeMode="cover"
      className="flex-1"
    >
      <LoginHeader title="你的生日" backButton={false} />
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
            onNext={handleNext}
            renderStepIndicator={() => <StepIndicator currentStep={3} />}
          />
        }
      />
      <ErrorModal
        visible={errorModal.visible}
        message={errorModal.error}
        onClose={errorModal.hide}
      />
    </ImageBackground>
  );
}

