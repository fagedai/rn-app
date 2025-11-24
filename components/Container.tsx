import { SafeAreaView } from 'react-native-safe-area-context';

export const Container = ({ children }: { children: React.ReactNode }) => {
  return <SafeAreaView className={styles.container} edges={['top', 'bottom', 'left', 'right']}>{children}</SafeAreaView>;
};

const styles = {
  container: 'flex flex-1 m-6',
};
