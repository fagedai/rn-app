import { useState, useCallback } from 'react';

/**
 * Toast 显示 Hook
 * 简化 Toast 的显示逻辑
 */
export function useToast(duration: number = 2000) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');

  const show = useCallback((msg: string) => {
    setMessage(msg);
    setVisible(true);
  }, []);

  const hide = useCallback(() => {
    setVisible(false);
  }, []);

  return {
    visible,
    message,
    show,
    hide,
    duration,
  };
}

