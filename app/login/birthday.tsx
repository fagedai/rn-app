import React, { useRef, useEffect } from 'react';
import { View, ImageBackground, Dimensions, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoginHeader } from '../../components/common/LoginHeader';
import { StepIndicator } from '../../components/common/StepIndicator';
import { NavigationButtons } from '../../components/common/NavigationButtons';
import { DatePickerColumn } from '../../components/login/DatePickerColumn';
import { useUserStore } from '../../store/userStore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const ITEM_HEIGHT = 80;

export default function LoginBirthday() {
  const router = useRouter();
  const { userInfo, setBirthday } = useUserStore();
  const selectedYear = userInfo.birthday?.year || 1980;
  const selectedMonth = userInfo.birthday?.month || 1;
  const selectedDay = userInfo.birthday?.day || 1;

  const yearScrollRef = useRef<ScrollView>(null);
  const monthScrollRef = useRef<ScrollView>(null);
  const dayScrollRef = useRef<ScrollView>(null);

  // 生成年份列表（1980-2010）
  const years = Array.from({ length: 31 }, (_, i) => 1980 + i);
  // 生成月份列表
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  // 获取该月的天数
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };
  // 生成日期列表（根据选中的年月动态生成）
  const days = Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1);

  useEffect(() => {
    // 初始定位到选中的值
    setTimeout(() => {
      const yearIndex = years.indexOf(selectedYear);
      const monthIndex = months.indexOf(selectedMonth);
      const currentDays = Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1);
      const dayIndex = currentDays.indexOf(selectedDay);
      
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
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 当年或月改变时，调整日期并更新日期列表
  useEffect(() => {
    const maxDay = getDaysInMonth(selectedYear, selectedMonth);
    if (selectedDay > maxDay) {
      handleDayChange(maxDay);
    }
    // 重新定位日期滚动
    const currentDays = Array.from({ length: maxDay }, (_, i) => i + 1);
    const dayIndex = currentDays.indexOf(selectedDay > maxDay ? maxDay : selectedDay);
    if (dayIndex >= 0) {
      setTimeout(() => {
        dayScrollRef.current?.scrollTo({
          y: dayIndex * ITEM_HEIGHT,
          animated: true,
        });
      }, 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedMonth, selectedDay]);

  const handleYearChange = (year: number) => {
    setBirthday({ year, month: selectedMonth, day: selectedDay });
  };

  const handleMonthChange = (month: number) => {
    setBirthday({ year: selectedYear, month, day: selectedDay });
  };

  const handleDayChange = (day: number) => {
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
      setValue(data[index]);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/background.png')}
      resizeMode="cover"
      className="flex-1"
    >
      <LoginHeader title="你的生日" />
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-6">
          <View
            style={{
              flexDirection: 'row',
              height: ITEM_HEIGHT * 5,
              marginTop: SCREEN_HEIGHT * 0.25,
              marginBottom: 200,
              alignItems: 'center',
            }}
          >
            <DatePickerColumn
              data={years}
              selectedValue={selectedYear}
              setValue={handleYearChange}
              scrollRef={yearScrollRef}
              suffix="年"
              roundedClass="rounded-l-full"
              hideLeftBorder={false}
              hideRightBorder={true}
              onScroll={handleScroll}
            />
            <DatePickerColumn
              data={months}
              selectedValue={selectedMonth}
              setValue={handleMonthChange}
              scrollRef={monthScrollRef}
              suffix="月"
              hideLeftBorder={true}
              hideRightBorder={true}
              onScroll={handleScroll}
            />
            <DatePickerColumn
              data={days}
              selectedValue={selectedDay}
              setValue={handleDayChange}
              scrollRef={dayScrollRef}
              suffix="日"
              roundedClass="rounded-r-full"
              hideLeftBorder={true}
              hideRightBorder={false}
              onScroll={handleScroll}
            />
          </View>

          <View className="absolute bottom-0 left-0 right-0 px-6 pb-8">
            <StepIndicator currentStep={3} />
            <NavigationButtons
              onBack={() => router.back()}
              onNext={() => router.push('/create/role')}
            />
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

