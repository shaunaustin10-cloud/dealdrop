import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const Toast = ({ toast, setToast }) => {
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false });
      }, 4000); // Hide after 4 seconds

      return () => clearTimeout(timer);
    }
  }, [toast, setToast]);

  if (!toast.show) return null;

  const baseClasses = "fixed top-5 right-5 z-50 flex items-center p-4 max-w-sm w-full rounded-lg shadow-lg text-white animate-fade-in";
  const typeClasses = {
    success: "bg-emerald-500",
    error: "bg-red-500",
  };

  return (
    <div className={`${baseClasses} ${typeClasses[toast.type] || 'bg-slate-700'}`}>
      {toast.type === 'success' && <CheckCircle className="mr-3" />}
      {toast.type === 'error' && <AlertCircle className="mr-3" />}
      <div className="flex-1 font-semibold">{toast.message}</div>
      <button onClick={() => setToast({ ...toast, show: false })} className="ml-4 -mr-2 p-1.5 rounded-lg hover:bg-white/20 transition-colors">
        <X size={20} />
      </button>
    </div>
  );
};

Toast.propTypes = {
  toast: PropTypes.shape({
    show: PropTypes.bool.isRequired,
    message: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired,
  setToast: PropTypes.func.isRequired,
};

export default Toast;

