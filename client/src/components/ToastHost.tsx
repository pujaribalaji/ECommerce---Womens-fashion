import { useEffect, useState } from "react";

export function ToastHost() {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const handler = (e: Event) => {
      const d = (e as CustomEvent<string>).detail;
      if (timer) clearTimeout(timer);
      setToast(typeof d === "string" && d.trim() ? d : "Saved");
      timer = setTimeout(() => setToast(null), 3200);
    };
    window.addEventListener("aarnika-toast", handler as EventListener);
    return () => {
      window.removeEventListener("aarnika-toast", handler as EventListener);
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (!toast) return null;
  return (
    <div
      role="status"
      className="pointer-events-none fixed bottom-24 left-1/2 z-[100] max-w-[min(92vw,360px)] -translate-x-1/2"
    >
      <div className="rounded-full border border-gold-400/35 bg-ink-950/95 px-5 py-3 text-center text-sm font-semibold text-sand-50 shadow-xl shadow-black/40">
        {toast}
      </div>
    </div>
  );
}
