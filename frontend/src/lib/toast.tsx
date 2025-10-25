import toast, { Toaster } from 'react-hot-toast';

// Custom toast configuration matching our theme
const defaultOptions = {
  duration: 4000,
  position: 'top-right' as const,
  style: {
    background: '#fff',
    color: '#1f2937',
    padding: '16px',
    borderRadius: '12px',
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    border: '2px solid #e5e7eb',
    fontSize: '14px',
    fontWeight: '600',
  },
};

const successOptions = {
  ...defaultOptions,
  icon: '✓',
  style: {
    ...defaultOptions.style,
    borderColor: '#10b981',
    background: '#f0fdf4',
  },
  iconTheme: {
    primary: '#10b981',
    secondary: '#fff',
  },
};

const errorOptions = {
  ...defaultOptions,
  icon: '✕',
  duration: 5000,
  style: {
    ...defaultOptions.style,
    borderColor: '#ef4444',
    background: '#fef2f2',
  },
  iconTheme: {
    primary: '#ef4444',
    secondary: '#fff',
  },
};

const warningOptions = {
  ...defaultOptions,
  icon: '⚠',
  style: {
    ...defaultOptions.style,
    borderColor: '#f59e0b',
    background: '#fffbeb',
  },
  iconTheme: {
    primary: '#f59e0b',
    secondary: '#fff',
  },
};

const infoOptions = {
  ...defaultOptions,
  icon: 'ℹ',
  style: {
    ...defaultOptions.style,
    borderColor: '#3b82f6',
    background: '#eff6ff',
  },
  iconTheme: {
    primary: '#3b82f6',
    secondary: '#fff',
  },
};

// Custom themed toast functions
export const showToast = {
  success: (message: string) => toast.success(message, successOptions),
  error: (message: string) => toast.error(message, errorOptions),
  warning: (message: string) => toast(message, warningOptions),
  info: (message: string) => toast(message, infoOptions),
  loading: (message: string) => toast.loading(message, defaultOptions),
  dismiss: (toastId?: string) => toast.dismiss(toastId),
};

// Custom Toaster component with our theme
export function CustomToaster() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        className: '',
        style: {
          ...defaultOptions.style,
        },
      }}
    />
  );
}
