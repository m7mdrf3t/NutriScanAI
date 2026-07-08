export interface Ingredient {
  name: string;
  amount: string;
  calories: number;
}

export interface NutritionalBreakdown {
  carbs: number;
  protein: number;
  fat: number;
  fiber?: number;
  sodium?: number;
}

export interface FoodAnalysisResult {
  foodName: string;
  confidence: number;
  description: string;
  portionSize: string;
  calories: number;
  ingredients: Ingredient[];
  nutritionalBreakdown: NutritionalBreakdown;
  healthScore: number;
  dietaryLabels: string[];
  insights: string[];
}

export interface MealHistoryItem {
  id: string;
  timestamp: string;
  image: string; // base64 representation of scanned image
  result: FoodAnalysisResult;
}

export interface FoodSample {
  name: string;
  url: string;
  tagline: string;
}
