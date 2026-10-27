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
  const currentCar = FAMOUS_CARS.find(c => c.id === selectedCarId) || FAMOUS_CARS[0];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-semibold text-slate-300">
          Poyga Mashinangizni Tanlang:
        </label>
        <span className="text-[10px] text-cyan-400 font-mono font-bold">
          {currentCar.name} ({currentCar.powerHp} HP)
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1.5 bg-slate-950/70 border border-slate-800 rounded-xl max-h-48 overflow-y-auto">
        {FAMOUS_CARS.map((car: RacingCar) => {
          const isSelected = selectedCarId === car.id;
          return (
            <button
              key={car.id}
              type="button"
              onClick={() => onSelectCar(car.id)}
              className={`p-2 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'border-cyan-400 bg-cyan-950/90 shadow-md ring-1 ring-cyan-400'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-slate-700 shadow-sm shrink-0"
                    style={{ backgroundColor: car.bodyColor }}
                  />
                  <span className="text-[9px] font-mono font-black text-amber-400">
                    {car.powerHp} HP
                  </span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-white block leading-tight truncate">
                  {car.brand}
                </span>
                <span className="text-[9px] text-slate-400 block truncate font-mono">
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
