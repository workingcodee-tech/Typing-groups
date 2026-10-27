import React from 'react';

interface VirtualKeyboardProps {
  nextChar: string;
  isError: boolean;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ nextChar, isError }) => {
  const char = nextChar.toLowerCase();

  const row1 = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'];
  const row2 = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"];
  const row3 = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'];

  const isSpace = nextChar === ' ';

  const getKeyClass = (key: string) => {
    const isTarget = char === key;
    if (isTarget) {
      return isError
        ? 'bg-rose-600 text-white border-rose-500 scale-105 shadow-md shadow-rose-500/30'
        : 'bg-cyan-500 text-slate-950 font-bold border-cyan-300 scale-105 shadow-md shadow-cyan-400/40 ring-2 ring-cyan-400/50';
    }
    return 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700';
  };

  return (
    <div className="hidden lg:block w-full max-w-2xl mx-auto p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl select-none text-[11px] font-mono shadow-inner">
      <div className="flex flex-col gap-1.5 items-center">
        {/* 1-qator */}
        <div className="flex gap-1.5 justify-center w-full">
          {row1.map((k) => (
            <div
              key={k}
              className={`w-9 h-9 rounded flex items-center justify-center border transition-all duration-100 ${getKeyClass(k)}`}
            >
              {k.toUpperCase()}
            </div>
          ))}
        </div>

        {/* 2-qator */}
        <div className="flex gap-1.5 justify-center w-full pl-3">
          {row2.map((k) => (
            <div
              key={k}
              className={`w-9 h-9 rounded flex items-center justify-center border transition-all duration-100 ${getKeyClass(k)}`}
            >
              {k.toUpperCase()}
            </div>
          ))}
        </div>

        {/* 3-qator */}
        <div className="flex gap-1.5 justify-center w-full pl-6">
          {row3.map((k) => (
            <div
              key={k}
              className={`w-9 h-9 rounded flex items-center justify-center border transition-all duration-100 ${getKeyClass(k)}`}
            >
              {k.toUpperCase()}
            </div>
          ))}
        </div>

        {/* Probel (Space) */}
        <div className="flex gap-1.5 justify-center w-full pt-0.5">
          <div
            className={`w-64 h-8 rounded flex items-center justify-center border transition-all duration-100 ${
              isSpace
                ? isError
                  ? 'bg-rose-600 text-white border-rose-500 scale-102 shadow-md shadow-rose-500/30'
                  : 'bg-cyan-500 text-slate-950 font-bold border-cyan-300 scale-102 shadow-md shadow-cyan-400/40 ring-2 ring-cyan-400/50'
                : 'bg-slate-900/90 text-slate-400 border-slate-800'
            }`}
          >
            {isSpace ? '␣ PROBEL' : 'PROBEL'}
          </div>
        </div>
      </div>
    </div>
  );
};
