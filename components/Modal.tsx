
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all animate-in fade-in zoom-in duration-300">
        <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
        <p className="text-slate-300 mb-8">{message}</p>
        <div className="flex gap-4 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-700 text-white hover:bg-slate-600 transition-colors active:scale-95"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors active:scale-95"
          >
            Excluir Tudo
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
