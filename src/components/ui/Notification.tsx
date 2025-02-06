import React from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

export type NotificationType = 'success' | 'error';

interface NotificationProps {
  type: NotificationType;
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

export function Notification({ 
  type, 
  message, 
  onClose, 
  autoClose = true, 
  duration = 3000 
}: NotificationProps) {
  React.useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const styles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
    },
  };

  const style = styles[type];

  return (
    <div className={`flex items-center justify-between p-4 ${style.bg} border ${style.border} rounded-lg shadow-sm`}>
      <div className="flex items-center space-x-3">
        {style.icon}
        <p className={`text-sm font-medium ${style.text}`}>{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`p-1 hover:${style.bg} rounded-full transition-colors`}
        >
          <X className={`h-4 w-4 ${style.text}`} />
        </button>
      )}
    </div>
  );
}