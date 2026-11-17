import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-14 pt-8 pb-10 border-t border-[#181a27] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-slate-400">kiroku</span>
        <span>—</span>
        <span>cada historia deja una huella.</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-slate-400 font-medium">Programación III · UTN INSPT</span>
        <span className="text-slate-600">·</span>
        <span className="text-slate-500 font-mono">Comisión 3-601 TM · Grupo LOTUS</span>
      </div>
    </footer>
  );
}
