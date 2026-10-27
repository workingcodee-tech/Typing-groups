import React from 'react';
import { FAMOUS_CARS, RacingCar } from '../data/cars';
import { Check } from 'lucide-react';

interface CarSelectorProps {
  selectedCarId: string;
  onSelectCar: (carId: string) => void;
}

export const CarSelector: React.FC<CarSelectorProps> = ({
  selectedCarId,
  onSelectCar
}) => {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-semibold text-slate-300">
          Poyga Mashinangizni Tanlang:
        </label>
        <span className="text-[10px] text-cyan-400 font-mono">10 ta mashhur brend</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1 bg-slate-950/60 border border-slate-800 rounded-xl max-h-40 overflow-y-auto">
        {FAMOUS_CARS.map((car: RacingCar) => {
          const isSelected = selectedCarId === car.id;
          return (
            <button
              key={car.id}
              type="button"
              onClick={() => onSelectCar(car.id)}
              className={`p-2 rounded-lg border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'border-cyan-400 bg-cyan-950/80 shadow-xs ring-1 ring-cyan-400/80'
                  : 'border-slate-800/80 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className="w-3 h-3 rounded-full border border-slate-700 shadow-xs shrink-0"
                  style={{ backgroundColor: car.bodyColor }}
                />
                {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-white block leading-tight truncate">
                  {car.name.split(' ')[0]}
                </span>
                <span className="text-[9px] text-slate-400 block truncate">
                  {car.shortLabel}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
