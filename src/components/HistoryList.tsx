import React, { useState } from "react";
import { MealHistoryItem } from "../types";
import {
  Calendar,
  Flame,
  Trash2,
  ListRestart,
  Heart,
  ChevronRight,
  TrendingDown,
  ChevronDown,
  Edit2
} from "lucide-react";

interface HistoryListProps {
  items: MealHistoryItem[];
  onSelectItem: (item: MealHistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

export default function HistoryList({
  items,
  onSelectItem,
  onDeleteItem,
  onClearAll,
}: HistoryListProps) {
  const [dailyGoal, setDailyGoal] = useState<number>(2000);
  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);
  const [tempGoal, setTempGoal] = useState<string>("2000");

  // Sum up today's logged meals
  const todayStr = new Date().toDateString();
  const todayItems = items.filter((item) => {
    const itemDate = new Date(item.timestamp).toDateString();
    return itemDate === todayStr;
  });

  const totalCalories = todayItems.reduce((acc, item) => acc + item.result.calories, 0);
  const totalCarbs = todayItems.reduce((acc, item) => acc + (item.result.nutritionalBreakdown.carbs || 0), 0);
  const totalProtein = todayItems.reduce((acc, item) => acc + (item.result.nutritionalBreakdown.protein || 0), 0);
  const totalFat = todayItems.reduce((acc, item) => acc + (item.result.nutritionalBreakdown.fat || 0), 0);

  const percentOfGoal = Math.min(100, Math.round((totalCalories / dailyGoal) * 100));

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const g = parseInt(tempGoal, 10);
    if (!isNaN(g) && g > 0) {
      setDailyGoal(g);
      setIsEditingGoal(false);
    }
  };

  return (
    <div id="meal-diary-history" className="space-y-6">
      {/* Daily Calories Dashboard */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        {/* Background ambient radial aura */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex justify-between items-start mb-4 relative z-10">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-semibold bg-emerald-950/80 border border-emerald-900 px-2.5 py-1 rounded-full">
              Today's Calorie Tracker
            </span>
            <p className="text-zinc-400 text-xs mt-2">{todayStr}</p>
          </div>

          {!isEditingGoal ? (
            <button
              onClick={() => {
                setTempGoal(dailyGoal.toString());
                setIsEditingGoal(true);
              }}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-800/80 border border-zinc-700 hover:border-zinc-600 px-3 py-1.5 rounded-xl transition cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Goal: {dailyGoal} kcal</span>
            </button>
          ) : (
            <form onSubmit={handleSaveGoal} className="flex items-center gap-1.5 relative z-20">
              <input
                type="number"
                value={tempGoal}
                onChange={(e) => setTempGoal(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded-xl px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 w-20"
                min="500"
                max="10000"
                required
              />
              <button
                type="submit"
                className="bg-emerald-500 text-black px-2.5 py-1 rounded-xl text-[10px] font-semibold hover:bg-emerald-400 cursor-pointer"
              >
                Set
              </button>
              <button
                type="button"
                onClick={() => setIsEditingGoal(false)}
                className="text-zinc-400 hover:text-white text-[10px] px-1"
              >
                Cancel
              </button>
            </form>
          )}
        </div>

        {/* Big Meter */}
        <div className="mb-5 relative z-10">
          <div className="flex justify-between items-baseline mb-1">
            <span className="font-display font-bold text-4xl tracking-tight text-white flex items-baseline gap-1">
              {totalCalories}
              <span className="text-sm font-sans font-normal text-zinc-400">/ {dailyGoal} kcal</span>
            </span>
            <span className="font-mono text-sm text-emerald-400 font-semibold">{percentOfGoal}%</span>
          </div>

          <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${percentOfGoal}%` }}
            />
          </div>
        </div>

        {/* Macro Summary of the day */}
        <div className="grid grid-cols-3 gap-3 border-t border-zinc-800/80 pt-4 relative z-10">
          <div className="bg-zinc-900/60 border border-zinc-800/40 rounded-2xl p-2 text-center">
            <p className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 mb-0.5">Carbs</p>
            <p className="font-sans font-bold text-zinc-200 text-xs">{totalCarbs}g</p>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800/40 rounded-2xl p-2 text-center">
            <p className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 mb-0.5">Protein</p>
            <p className="font-sans font-bold text-zinc-200 text-xs">{totalProtein}g</p>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800/40 rounded-2xl p-2 text-center">
            <p className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 mb-0.5">Fat</p>
            <p className="font-sans font-bold text-zinc-200 text-xs">{totalFat}g</p>
          </div>
        </div>
      </div>

      {/* Scanned Meal History List */}
      <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-zinc-500" />
            <h3 className="font-display font-semibold text-lg text-zinc-900">Scan Logs</h3>
          </div>

          {items.length > 0 && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/70 px-2.5 py-1.5 rounded-xl transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Diary</span>
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-zinc-200 rounded-2xl">
            <ListRestart className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-500 text-xs font-semibold">Your nutrition diary is empty</p>
            <p className="text-[10px] text-zinc-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
              Scan some meals or test some samples to start saving records.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {items.map((item) => (
              <div
                key={item.id}
                className="group flex gap-3 p-3 border border-zinc-150 rounded-2xl hover:border-emerald-500/30 hover:shadow-sm transition bg-white"
              >
                {/* Meal Image Preview */}
                <button
                  onClick={() => onSelectItem(item)}
                  className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0 relative focus:outline-none cursor-pointer"
                >
                  <img
                    src={item.image}
                    alt={item.result.foodName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>

                {/* Meal Text Specs */}
                <div className="flex-grow min-w-0 flex flex-col justify-between py-0.5">
                  <div className="flex justify-between items-start gap-2">
                    <button
                      onClick={() => onSelectItem(item)}
                      className="text-left focus:outline-none cursor-pointer flex-grow min-w-0"
                    >
                      <h4 className="font-sans font-semibold text-xs text-zinc-900 truncate group-hover:text-emerald-700 transition">
                        {item.result.foodName}
                      </h4>
                      <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {item.result.portionSize}
                      </p>
                    </button>

                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="text-zinc-300 hover:text-rose-600 p-1 rounded-lg hover:bg-zinc-50 transition cursor-pointer"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5 text-[10px] font-semibold text-rose-600">
                      <Flame className="w-3 h-3 fill-rose-50" />
                      <span>{item.result.calories} kcal</span>
                    </span>
                    <span className="text-zinc-300 text-[10px]">•</span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      C:{item.result.nutritionalBreakdown.carbs}g P:{item.result.nutritionalBreakdown.protein}g F:{item.result.nutritionalBreakdown.fat}g
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
