import Parse from '../parseConfig';
import { AppState, DailyLog, NutritionGoal } from '../types';

const defaultNutritionGoals: NutritionGoal[] = [
  {
    id: 'water',
    name: 'Eau',
    current: 0,
    target: {
      health: 2.5,
      diet: 2.5
    },
    unit: 'L',
    color: 'blue'
  },
  {
    id: 'calories',
    name: 'Calories',
    current: 0,
    target: {
      health: 2000,
      diet: 1800
    },
    unit: 'kcal',
    color: 'orange'
  },
  {
    id: 'protein',
    name: 'Protéines',
    current: 0,
    target: {
      health: 60,
      diet: 90
    },
    unit: 'g',
    color: 'red'
  },
  {
    id: 'carbs',
    name: 'Glucides',
    current: 0,
    target: {
      health: 250,
      diet: 150
    },
    unit: 'g',
    color: 'yellow'
  },
  {
    id: 'fat',
    name: 'Lipides',
    current: 0,
    target: {
      health: 70,
      diet: 50
    },
    unit: 'g',
    color: 'purple'
  }
];

const getCurrentUser = async () => {
  const currentUser = await Parse.User.currentAsync();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }
  if (!currentUser.authenticated()) {
    throw new Error('User session is invalid');
  }
  return currentUser;
};

export const getInitialState = async (): Promise<AppState> => {
  const today = new Date().toISOString().split('T')[0];
  let currentUser;
  
  try {
    currentUser = await getCurrentUser();
  } catch (error) {
    console.error('Authentication error:', error);
    throw new Error('Please log in to access your data');
  }

  try {
    // Récupérer tous les logs quotidiens de l'utilisateur
    const query = new Parse.Query('DailyLog');
    query.equalTo('user', currentUser);
    const dailyLogs = await query.find();

    // Convertir les logs Parse en format AppState
    const dailyLogsMap: Record<string, DailyLog> = {};
    for (const log of dailyLogs) {
      const nutritionGoalsQuery = log.relation('nutritionGoals').query();
      const nutritionGoals = await nutritionGoalsQuery.find();
      
      // Créer un map des goals existants
      const existingGoals = nutritionGoals.reduce((acc, goal) => {
        acc[goal.id || ''] = {
          id: goal.id || '',
          name: goal.get('name'),
          current: goal.get('current'),
          target: goal.get('target'),
          unit: goal.get('unit'),
          color: goal.get('color')
        };
        return acc;
      }, {} as Record<string, NutritionGoal>);

      // S'assurer que tous les goals par défaut sont présents
      const allGoals = defaultNutritionGoals.map(defaultGoal => {
        if (existingGoals[defaultGoal.id]) {
          return existingGoals[defaultGoal.id];
        }
        return defaultGoal;
      });
      
      dailyLogsMap[log.get('date')] = {
        date: log.get('date'),
        nutritionGoals: allGoals,
        activeMode: log.get('activeMode')
      };
    }

    // Si aucun log n'existe pour aujourd'hui, en créer un
    if (!dailyLogsMap[today]) {
      const newDailyLog = await createDailyLog(today, currentUser);
      dailyLogsMap[today] = newDailyLog;
    }

    return {
      currentDate: today,
      dailyLogs: dailyLogsMap
    };
  } catch (error) {
    console.error('Error loading data from Parse:', error);
    throw error;
  }
};

const createDailyLog = async (date: string, user: Parse.User): Promise<DailyLog> => {
  if (!user || !user.id) {
    throw new Error('Invalid user');
  }

  if (!user.authenticated()) {
    throw new Error('User session is invalid');
  }

  const dailyLog = new Parse.Object('DailyLog');
  dailyLog.set('date', date);
  dailyLog.set('activeMode', 'health');
  dailyLog.set('user', user);

  // Créer les objectifs nutritionnels par défaut
  const nutritionGoals = await Promise.all(
    defaultNutritionGoals.map(async (goal) => {
      const nutritionGoal = new Parse.Object('NutritionGoal');
      nutritionGoal.set('name', goal.name);
      nutritionGoal.set('current', goal.current);
      nutritionGoal.set('target', goal.target);
      nutritionGoal.set('unit', goal.unit);
      nutritionGoal.set('color', goal.color);
      nutritionGoal.set('user', user);
      await nutritionGoal.save();
      return nutritionGoal;
    })
  );

  // Associer les objectifs au log quotidien
  const relation = dailyLog.relation('nutritionGoals');
  for (const goal of nutritionGoals) {
    relation.add(goal);
  }

  await dailyLog.save();

  return {
    date,
    nutritionGoals: defaultNutritionGoals,
    activeMode: 'health'
  };
};

export const updateNutritionGoal = async (
  state: AppState,
  date: string,
  goalId: string,
  amount: number
): Promise<AppState> => {
  const currentUser = await getCurrentUser();

  try {
    // Récupérer le log quotidien
    const query = new Parse.Query('DailyLog');
    query.equalTo('user', currentUser);
    query.equalTo('date', date);
    let dailyLog = await query.first();

    if (!dailyLog) {
      // Si le log n'existe pas, le créer
      dailyLog = new Parse.Object('DailyLog');
      dailyLog.set('date', date);
      dailyLog.set('activeMode', 'health');
      dailyLog.set('user', currentUser);
      await dailyLog.save();
    }

    // Récupérer l'objectif nutritionnel
    const nutritionGoalsQuery = dailyLog.relation('nutritionGoals').query();
    const nutritionGoals = await nutritionGoalsQuery.find();
    let goal = nutritionGoals.find(g => g.id === goalId);

    if (!goal) {
      // Si le goal n'existe pas, le créer
      const defaultGoal = defaultNutritionGoals.find(g => g.id === goalId);
      if (!defaultGoal) {
        throw new Error('Invalid goal ID');
      }

      // Vérifier si un goal avec le même ID existe déjà dans la base de données
      const existingGoalQuery = new Parse.Query('NutritionGoal');
      existingGoalQuery.equalTo('user', currentUser);
      existingGoalQuery.equalTo('name', defaultGoal.name);
      const existingGoal = await existingGoalQuery.first();

      if (existingGoal) {
        // Utiliser le goal existant
        goal = existingGoal;
        // L'associer au log quotidien
        const relation = dailyLog.relation('nutritionGoals');
        relation.add(goal);
        await dailyLog.save();
      } else {
        // Créer un nouveau goal
        goal = new Parse.Object('NutritionGoal');
        goal.set('name', defaultGoal.name);
        goal.set('current', 0);
        goal.set('target', defaultGoal.target);
        goal.set('unit', defaultGoal.unit);
        goal.set('color', defaultGoal.color);
        goal.set('user', currentUser);
        await goal.save();

        // Associer le goal au log quotidien
        const relation = dailyLog.relation('nutritionGoals');
        relation.add(goal);
        await dailyLog.save();
      }
    }

    // Mettre à jour l'objectif
    const currentValue = goal.get('current') || 0;
    const newValue = Math.max(0, currentValue + amount);
    goal.set('current', newValue);
    await goal.save();

    // Mettre à jour l'état local
    const updatedDailyLog = state.dailyLogs[date] || {
      date,
      nutritionGoals: defaultNutritionGoals,
      activeMode: 'health'
    };
    const updatedGoals = updatedDailyLog.nutritionGoals.map(g => {
      if (g.id === goalId) {
        return { ...g, current: newValue };
      }
      return g;
    });

    return {
      ...state,
      dailyLogs: {
        ...state.dailyLogs,
        [date]: {
          ...updatedDailyLog,
          nutritionGoals: updatedGoals
        }
      }
    };
  } catch (error) {
    console.error('Error updating nutrition goal:', error);
    throw error;
  }
};

export const resetNutritionGoal = async (
  state: AppState,
  date: string,
  goalId: string
): Promise<AppState> => {
  const currentUser = await getCurrentUser();

  try {
    // Récupérer le log quotidien
    const query = new Parse.Query('DailyLog');
    query.equalTo('user', currentUser);
    query.equalTo('date', date);
    const dailyLog = await query.first();

    if (!dailyLog) {
      throw new Error('Daily log not found');
    }

    // Récupérer l'objectif nutritionnel
    const nutritionGoalsQuery = dailyLog.relation('nutritionGoals').query();
    const nutritionGoals = await nutritionGoalsQuery.find();
    const goal = nutritionGoals.find(g => g.id === goalId);

    if (!goal) {
      throw new Error('Nutrition goal not found');
    }

    // Réinitialiser l'objectif
    goal.set('current', 0);
    await goal.save();

    // Mettre à jour l'état local
    const updatedDailyLog = state.dailyLogs[date];
    const updatedGoals = updatedDailyLog.nutritionGoals.map(g => {
      if (g.id === goalId) {
        return { ...g, current: 0 };
      }
      return g;
    });

    return {
      ...state,
      dailyLogs: {
        ...state.dailyLogs,
        [date]: {
          ...updatedDailyLog,
          nutritionGoals: updatedGoals
        }
      }
    };
  } catch (error) {
    console.error('Error resetting nutrition goal:', error);
    throw error;
  }
};

export const toggleNutritionMode = async (
  state: AppState,
  date: string
): Promise<AppState> => {
  const currentUser = await getCurrentUser();

  try {
    // Récupérer le log quotidien
    const query = new Parse.Query('DailyLog');
    query.equalTo('user', currentUser);
    query.equalTo('date', date);
    const dailyLog = await query.first();

    if (!dailyLog) {
      throw new Error('Daily log not found');
    }

    // Mettre à jour le mode
    const currentMode = dailyLog.get('activeMode');
    const newMode = currentMode === 'health' ? 'diet' : 'health';
    dailyLog.set('activeMode', newMode);
    await dailyLog.save();

    // Mettre à jour l'état local
    const updatedDailyLog = state.dailyLogs[date];
    return {
      ...state,
      dailyLogs: {
        ...state.dailyLogs,
        [date]: {
          ...updatedDailyLog,
          activeMode: newMode
        }
      }
    };
  } catch (error) {
    console.error('Error toggling nutrition mode:', error);
    throw error;
  }
};

export const updateNutritionTarget = async (
  state: AppState,
  date: string,
  goalId: string,
  amount: number
): Promise<AppState> => {
  const currentUser = await getCurrentUser();

  try {
    // Récupérer tous les logs quotidiens à partir de la date spécifiée
    const query = new Parse.Query('DailyLog');
    query.equalTo('user', currentUser);
    query.greaterThanOrEqualTo('date', date);
    const dailyLogs = await query.find();

    // Mettre à jour les objectifs pour chaque log
    for (const dailyLog of dailyLogs) {
      const nutritionGoalsQuery = dailyLog.relation('nutritionGoals').query();
      const nutritionGoals = await nutritionGoalsQuery.find();
      const goal = nutritionGoals.find(g => g.id === goalId);

      if (goal) {
        const target = goal.get('target');
        target[dailyLog.get('activeMode')] = amount;
        goal.set('target', target);
        await goal.save();
      }
    }

    // Mettre à jour l'état local
    const updatedDailyLogs: Record<string, DailyLog> = {};
    Object.entries(state.dailyLogs).forEach(([logDate, log]) => {
      if (logDate >= date) {
        const updatedGoals = log.nutritionGoals.map(goal => {
          if (goal.id === goalId) {
            return {
              ...goal,
              target: {
                ...goal.target,
                [log.activeMode]: amount
              }
            };
          }
          return goal;
        });
        updatedDailyLogs[logDate] = {
          ...log,
          nutritionGoals: updatedGoals
        };
      } else {
        updatedDailyLogs[logDate] = log;
      }
    });

    return {
      ...state,
      dailyLogs: updatedDailyLogs
    };
  } catch (error) {
    console.error('Error updating nutrition target:', error);
    throw error;
  }
}; 