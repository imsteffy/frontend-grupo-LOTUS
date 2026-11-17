import React from 'react';

/**
 * Componente Toast para notificaciones visuales flotantes
 * @param {string} message - Texto de la notificación
 */
export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 bg-[#141728] border border-purple-500 text-purple-200 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-bounce max-w-xs sm:max-w-md"
    >
      <span className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0" />
      <span className="truncate">{message}</span>
    </div>
  );
}
