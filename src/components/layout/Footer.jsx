import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-14 pt-8 pb-10 border-t border-[#181a27] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-slate-400">kiroku</span>
        <span>—</span>
        <span>cada historia deja una huella.</span>
      </div>

      <div className="flex items-center gap-6">
        <a href="#normas" className="hover:text-slate-300 transition-colors">
          Normas de la comunidad
        </a>
        <a href="#ayuda" className="hover:text-slate-300 transition-colors">
          Ayuda
        </a>
        <button className="flex items-center gap-1 hover:text-slate-300 transition-colors">
          <span>Español</span>
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    </footer>
  );
}
