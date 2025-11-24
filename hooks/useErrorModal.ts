import { useState, useCallback } from 'react';

/**
 * ErrorModal 显示 Hook
 * 简化 ErrorModal 的显示逻辑
 */
export function useErrorModal() {
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');

  const show = useCallback((message: string, errorTitle: string = '') => {
    setError(message);
    setTitle(errorTitle);
    setVisible(true);
  }, []);

  const hide = useCallback(() => {
    setVisible(false);
    setError(null);
    setTitle('');
  }, []);

  return {
    visible,
    error: error || '',
    title,
    show,
    hide,
  };
}

