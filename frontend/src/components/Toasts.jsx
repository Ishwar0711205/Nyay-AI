import { CheckIcon, AlertIcon, InfoIcon, CloseIcon } from "./Icons";

function Toast({ toast, onDismiss }) {
  const Icon =
    toast.type === "success" ? CheckIcon
    : toast.type === "error" ? AlertIcon
    : InfoIcon;
  return (
    <div className={`toast toast-${toast.type}`} role={toast.type === "error" ? "alert" : "status"}>
      <span className="toast-icon"><Icon size={16} /></span>
      <span className="toast-message">{toast.message}</span>
      <button
        type="button"
        className="toast-close"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
      >
        <CloseIcon size={14} />
      </button>
    </div>
  );
}

export default function Toasts({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div className="toasts" aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}