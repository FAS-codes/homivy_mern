import { createContext, useContext, useRef, useState, useCallback } from "react";

const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timer = useRef();

  const show = useCallback((message, type = "success") => {
    clearTimeout(timer.current);
    setToast({ message, type });
    timer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast && (
        <div className={`toast show ${toast.type}`}>
          <span className="check">{toast.type === "error" ? "✕" : "✓"}</span> {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}
