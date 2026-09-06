'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
export function LabDialog({ title, onClose, children, closeLabel }: { title: string; onClose: () => void; children: ReactNode; closeLabel: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const d = ref.current!; d.showModal(); return () => d.close(); }, []);
  return <dialog ref={ref} className="lab-dialog" aria-labelledby="dialog-title" onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="dialog-heading"><h2 id="dialog-title">{title}</h2><button aria-label={closeLabel} onClick={onClose}><X size={20} /></button></div>
    <div className="dialog-body">{children}</div>
  </dialog>;
}
