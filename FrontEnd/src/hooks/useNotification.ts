import toast, { ToastOptions } from 'react-hot-toast';

interface NotificationOptions extends Partial<ToastOptions> {
  duration?: number;
}

const defaultOptions: ToastOptions = {
  style: {
    background: 'var(--card-bg)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
  },
  duration: 4000,
  position: 'top-right',
};

const useNotification = () => {
  const showNotification = (message: string, type: 'success' | 'error' | 'loading' | 'custom' = 'custom', options: NotificationOptions = {}) => {
    const toastId = toast[type](message, {
      ...defaultOptions,
      ...options,
    } as ToastOptions);

    return toastId;
  };

  const dismissNotification = (toastId: string | undefined) => {
    if (toastId) {
      toast.dismiss(toastId);
    }
  };

  const dismissAllNotifications = () => {
    toast.dismiss();
  };

  const success = (message: string, options?: NotificationOptions) => {
    return showNotification(message, 'success', options);
  };

  const error = (message: string, options?: NotificationOptions) => {
    return showNotification(message, 'error', options);
  };

  const loading = (message: string, options?: NotificationOptions) => {
    return showNotification(message, 'loading', options);
  };

  const custom = (message: string, options?: NotificationOptions) => {
    return showNotification(message, 'custom', options);
  };

  const promise = <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    },
    options?: NotificationOptions
  ) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        ...defaultOptions,
        ...options,
      } as ToastOptions
    );
  };

  return {
    showNotification,
    dismissNotification,
    dismissAllNotifications,
    success,
    error,
    loading,
    custom,
    promise,
  };
};

export default useNotification;
