export interface NutritionGoal {
  id: string;
  name: string;
  current: number;
  target: {
    health: number;
    diet: number;
  };
  unit: string;
  color: string;
}

export interface DailyLog {
  date: string;
  nutritionGoals: NutritionGoal[];
  activeMode: 'health' | 'diet';
}

export interface AppState {
  currentDate: string;
  dailyLogs: Record<string, DailyLog>;
}