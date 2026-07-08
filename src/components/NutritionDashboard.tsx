import React from "react";
import { FoodAnalysisResult } from "../types";
import {
  Flame,
  Scale,
  Activity,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Heart,
  Droplet,
  Shuffle
} from "lucide-react";

interface NutritionDashboardProps {
  result: FoodAnalysisResult;
  imageUrl?: string;
}

export default function NutritionDashboard({ result, imageUrl }: NutritionDashboardProps) {
  const {
    foodName,
    confidence,
    description,
    portionSize,
    calories,
    ingredients,
    nutritionalBreakdown,
    healthScore,
    dietaryLabels,
    insights,
  } = result;

  // Calculate percentage of macronutrients relative to daily reference values (2000 kcal diet)
  // Carbs: ~300g, Protein: ~50g, Fat: ~65g
  const carbPercent = Math.min(100, Math.round((nutritionalBreakdown.carbs / 275) * 100));
  const proteinPercent = Math.min(100, Math.round((nutritionalBreakdown.protein / 56) * 100));
  const fatPercent = Math.min(100, Math.round((nutritionalBreakdown.fat / 78) * 100));

  // Determine health score tier color
  const getHealthColor = (score: number) => {
    if (score >= 80) return { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", fill: "text-emerald-500", label: "Excellent Density" };
    if (score >= 60) return { bg: "bg-teal-50 text-teal-700 border-teal-200", fill: "text-teal-500", label: "Moderately Balanced" };
    if (score >= 40) return { bg: "bg-amber-50 text-amber-700 border-amber-200", fill: "text-amber-500", label: "Moderate Density" };
    return { bg: "bg-rose-50 text-rose-700 border-rose-200", fill: "text-rose-500", label: "Calorically Dense" };
  };

  const healthTier = getHealthColor(healthScore);

  return (
    <div id="nutrition-dashboard" className="space-y-6">
      {/* Upper Grid - Image & Main Bio */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white border border-zinc-100 rounded-3xl overflow-hidden shadow-sm">
        {imageUrl && (
          <div className="md:col-span-5 h-64 md:h-auto relative bg-zinc-50 border-r border-zinc-50">
            <img
              src={imageUrl}
              alt={foodName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            {confidence > 0 && (
              <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md text-white text-[11px] font-mono px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-white/10 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>AI Confidence: {Math.round(confidence * 100)}%</span>
              </div>
            )}
          </div>
        )}

        <div className={`${imageUrl ? "md:col-span-7" : "md:col-span-12"} p-6 flex flex-col justify-between`}>
          <div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {dietaryLabels.map((label, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 border border-emerald-100 text-emerald-700 uppercase tracking-wider"
                >
                  {label}
                </span>
              ))}
            </div>

            <h2 className="font-display font-bold text-2xl text-zinc-900 tracking-tight mb-2">
              {foodName}
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed mb-4">
              {description}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 border-t border-zinc-100 pt-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-rose-50 rounded-xl text-rose-500">
                <Flame className="w-5 h-5 fill-rose-50" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-mono text-zinc-400">Calories</p>
                <p className="font-sans font-bold text-zinc-800 text-sm leading-tight">
                  {calories} kcal
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-50 rounded-xl text-amber-500">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-mono text-zinc-400">Serving Size</p>
                <p className="font-sans font-medium text-zinc-800 text-xs truncate max-w-[120px] leading-tight" title={portionSize}>
                  {portionSize}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-xl border ${healthTier.bg}`}>
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-mono text-zinc-400">Health Score</p>
                <p className="font-sans font-bold text-zinc-800 text-sm leading-tight flex items-baseline gap-0.5">
                  {healthScore} <span className="text-[9px] text-zinc-400">/100</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Macronutrient Breakdowns */}
      <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm">
        <h3 className="font-display font-semibold text-lg text-zinc-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          <span>Macronutrient Profile</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Carbohydrates */}
          <div className="border border-zinc-100 rounded-2xl p-4 bg-zinc-50/50">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-zinc-600 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                Carbohydrates
              </span>
              <span className="font-mono font-bold text-sm text-zinc-800">{nutritionalBreakdown.carbs}g</span>
            </div>
            <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden mb-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${carbPercent}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-400">
              <span>Est. Daily Allowance</span>
              <span>{carbPercent}% of 275g Allowance</span>
            </div>
          </div>

          {/* Protein */}
          <div className="border border-zinc-100 rounded-2xl p-4 bg-zinc-50/50">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-zinc-600 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                Protein
              </span>
              <span className="font-mono font-bold text-sm text-zinc-800">{nutritionalBreakdown.protein}g</span>
            </div>
            <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden mb-2">
              <div className="bg-red-500 h-2 rounded-full" style={{ width: `${proteinPercent}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-400">
              <span>Est. Daily Allowance</span>
              <span>{proteinPercent}% of 56g Allowance</span>
            </div>
          </div>

          {/* Fat */}
          <div className="border border-zinc-100 rounded-2xl p-4 bg-zinc-50/50">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-zinc-600 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                Fat
              </span>
              <span className="font-mono font-bold text-sm text-zinc-800">{nutritionalBreakdown.fat}g</span>
            </div>
            <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden mb-2">
              <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${fatPercent}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-400">
              <span>Est. Daily Allowance</span>
              <span>{fatPercent}% of 78g Allowance</span>
            </div>
          </div>
        </div>

        {/* Micronutrient Badges */}
        {(nutritionalBreakdown.fiber !== undefined || nutritionalBreakdown.sodium !== undefined) && (
          <div className="flex gap-4 border-t border-zinc-100 mt-5 pt-4 text-xs text-zinc-500">
            {nutritionalBreakdown.fiber !== undefined && (
              <div className="flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-emerald-600" />
                <span>Dietary Fiber: <strong className="text-zinc-800 font-mono">{nutritionalBreakdown.fiber}g</strong></span>
              </div>
            )}
            {nutritionalBreakdown.sodium !== undefined && (
              <div className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Sodium: <strong className="text-zinc-800 font-mono">{nutritionalBreakdown.sodium}mg</strong></span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ingredient Deconstruction & Calorie Breakdown */}
      {ingredients && ingredients.length > 0 && (
        <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm">
          <h3 className="font-display font-semibold text-lg text-zinc-900 mb-4 flex items-center gap-2">
            <Shuffle className="w-5 h-5 text-emerald-600" />
            <span>Visible Ingredients & Calories</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-500">
              <thead className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 bg-zinc-50 border-b border-zinc-100">
                <tr>
                  <th className="px-4 py-3 font-semibold rounded-l-xl">Ingredient Name</th>
                  <th className="px-4 py-3 font-semibold">Estimated Portion</th>
                  <th className="px-4 py-3 font-semibold text-right rounded-r-xl">Est. Calories</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {ingredients.map((ing, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-zinc-800">{ing.name}</td>
                    <td className="px-4 py-3 text-zinc-500">{ing.amount}</td>
                    <td className="px-4 py-3 font-mono text-zinc-700 text-right font-medium">
                      {ing.calories} kcal
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Healthy Insights / Dietetic Suggestions */}
      {insights && insights.length > 0 && (
        <div className="bg-emerald-50/40 border border-emerald-100 rounded-3xl p-6">
          <h3 className="font-display font-semibold text-lg text-emerald-950 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>AI Nutrition & Lifestyle Tips</span>
          </h3>
          <ul className="space-y-2.5">
            {insights.map((insight, idx) => (
              <li key={idx} className="flex gap-2.5 items-start">
                <span className="p-1 bg-emerald-100/80 rounded-full text-emerald-700 mt-0.5 flex-shrink-0">
                  <Heart className="w-3.5 h-3.5 fill-emerald-700" />
                </span>
                <span className="text-xs text-emerald-900/90 leading-relaxed font-medium">
                  {insight}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
