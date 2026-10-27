import React from 'react';
import { Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="h-10 shrink-0 border-t border-slate-800/80 bg-[#060913]/95 text-slate-400 text-[11px] px-4 sm:px-6 flex items-center justify-between select-none">
      {/* Chap qism: Logotip va brend */}
      <div className="flex items-center gap-2">
        <img
          src="/type-groups-logo.png"
          alt="TYPING GROUPS Logotipi"
          className="w-5 h-5 object-contain rounded-full"
          width={20}
          height={20}
        />
        <span className="font-bold text-white tracking-tight">
          TYPING <span className="text-cyan-400">GROUPS</span>
        </span>
        <span className="text-slate-500">·</span>
        <span className="text-slate-400 hidden sm:inline">Ishlab chiquvchi:</span>
        <strong className="text-cyan-300 font-semibold">WORKING CODE</strong>
      </div>

      {/* O'rta qism: Klaviatura tezkor yordami */}
      <div className="hidden md:flex items-center gap-3 text-slate-400 font-mono text-[10px]">
        <span className="flex items-center gap-1">
          <Terminal className="w-3 h-3 text-cyan-400" />
          <span>Qayta boshlash:</span>
          <kbd className="px-1 py-0.2 bg-slate-800 border border-slate-700 rounded text-slate-200">Tab</kbd>
        </span>
        <span>·</span>
        <span>
          Keyingi soʻz: <kbd className="px-1 py-0.2 bg-slate-800 border border-slate-700 rounded text-slate-200">Space</kbd>
        </span>
      </div>

      {/* O'ng qism: Holat */}
      <div className="flex items-center gap-2 text-slate-400 text-[10px]">
        <span className="text-slate-400 hidden sm:inline">10 ta sport avtomobili</span>
        <span className="text-slate-500 hidden sm:inline">·</span>
        <span className="text-cyan-400 font-medium">v1.2</span>
      </div>
    </footer>
  );
};
