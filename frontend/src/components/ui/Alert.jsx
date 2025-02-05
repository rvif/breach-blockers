import { useState, useEffect, useRef, memo } from "react";
import { X } from "lucide-react";

const Alert = memo(function Alert({ type, message, onClose, duration = 4000 }) {
  const [progress, setProgress] = useState(100);
  const [isVisible, setIsVisible] = useState(true);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (!message) return;

    startTimeRef.current = Date.now();
    setProgress(100);
    setIsVisible(true);

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, 100 * (1 - elapsed / duration));

      setProgress(remaining);

      if (remaining === 0) {
        clearInterval(timerRef.current);
        if (onClose) onClose();
      }
    }, 40);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [message, duration, onClose]);

  const handleClose = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setProgress(0);
    setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, 200);
  };

  if (!message || !isVisible) return null;

  return (
    <div
      className={`relative overflow-hidden transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`p-4 rounded flex justify-between items-start ${
          type === "error"
            ? "bg-red-50 dark:bg-red-500/10 text-red-500 border border-red-500"
            : "bg-green-50 dark:bg-green-500/10 text-green-500 border border-green-500"
        }`}
      >
        <span>{message}</span>
        <button onClick={handleClose} className="ml-4 hover:opacity-70">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div
        className={`absolute bottom-0 left-0 h-1 transition-all duration-150 ease-linear ${
          type === "error" ? "bg-red-500" : "bg-green-500"
        }`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
});

export default Alert;
