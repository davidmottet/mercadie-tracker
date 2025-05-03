import Parse from '../parseConfig';
import { NutritionLog, MeasurementUnit, AppState } from '../types';

type NutritionMode = 'health' | 'diet';

// Unités de mesure par défaut
const defaultMeasurementUnits: MeasurementUnit[] = [
  { id: 'water', name: 'l' },
  { id: 'calories', name: 'kcal' },
  { id: 'protein', name: 'g' },
  { id: 'carbs', name: 'g' },
  { id: 'fat', name: 'g' }
];

// Logs nutritionnels par défaut
const defaultNutritionLogs = [
  {
    name: 'Eau',
    date: new Date(),
    currentValue: 0,
    targetValue: 2.5,
    mode: 'health' as NutritionMode,
    unitName: 'l'
  },
  {
    name: 'Calories',
    date: new Date(),
    currentValue: 0,
    targetValue: 2000,
    mode: 'health' as NutritionMode,
    unitName: 'kcal'
  },
  {
    name: 'Protéines',
    date: new Date(),
    currentValue: 0,
    targetValue: 60,
    mode: 'health' as NutritionMode,
    unitName: 'g'
  },
  {
    name: 'Glucides',
    date: new Date(),
    currentValue: 0,
    targetValue: 250,
    mode: 'health' as NutritionMode,
    unitName: 'g'
  },
  {
    name: 'Lipides',
    date: new Date(),
    currentValue: 0,
    targetValue: 70,
    mode: 'health' as NutritionMode,
    unitName: 'g'
  }
];

export const getCurrentUser = async (): Promise<Parse.User> => {
  const currentUser = Parse.User.current();
  if (!currentUser) {
    throw new Error('No user logged in');
  }
  return currentUser;
};

export const getInitialState = async (): Promise<{ logs: NutritionLog[] }> => {
  const today = new Date().toISOString().split('T')[0];
  let currentUser;
  
  try {
    currentUser = await getCurrentUser();
  } catch (error) {
    console.error('Authentication error:', error);
    throw new Error('Please log in to access your data');
  }

  try {
    // Récupérer toutes les unités de mesure
    const unitsQuery = new Parse.Query('MeasurementUnit');
    let units = await unitsQuery.find();

    // Si aucune unité n'existe, créer les unités par défaut
    if (units.length === 0) {
      units = await Promise.all(
        defaultMeasurementUnits.map(async (unit) => {
          const measurementUnit = new Parse.Object('MeasurementUnit');
          measurementUnit.set('name', unit.name);
          await measurementUnit.save();
          return measurementUnit;
        })
      );
    }

    // Récupérer tous les logs nutritionnels de l'utilisateur pour aujourd'hui
    const logsQuery = new Parse.Query('NutritionLog');
    logsQuery.equalTo('user', currentUser);
    logsQuery.equalTo('date', new Date(today));
    let logs = await logsQuery.find();

    // Si aucun log n'existe pour aujourd'hui, en créer
    if (logs.length === 0) {
      logs = await createNutritionLogs(today, currentUser, units);
    }

    return {
      logs: logs.map(log => ({
        id: log.id || '',
        name: log.get('name'),
        date: log.get('date'),
        currentValue: log.get('currentValue'),
        targetValue: log.get('targetValue'),
        mode: log.get('mode'),
        unit: {
          id: log.get('unit').id || '',
          name: log.get('unit').get('name')
        },
        user: log.get('user').id || ''
      }))
    };
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
};

const createNutritionLogs = async (
  date: string,
  user: Parse.User,
  units: Parse.Object[]
): Promise<Parse.Object[]> => {
  const logs: Parse.Object[] = [];

  for (const defaultLog of defaultNutritionLogs) {
    const unit = units.find(u => u.get('name') === defaultLog.name);
    if (!unit) continue;

    const nutritionLog = new Parse.Object('NutritionLog');
    nutritionLog.set('name', defaultLog.name);
    nutritionLog.set('date', new Date(date));
    nutritionLog.set('currentValue', defaultLog.currentValue);
    nutritionLog.set('targetValue', defaultLog.targetValue);
    nutritionLog.set('mode', defaultLog.mode);
    nutritionLog.set('unit', unit);
    nutritionLog.set('user', user);
    await nutritionLog.save();
    logs.push(nutritionLog);
  }

  return logs;
};

const createNutritionLog = async (
  logId: string,
  user: Parse.User,
  date: Date
): Promise<Parse.Object> => {
  const defaultLog = defaultNutritionLogs.find(log => log.name.toLowerCase() === logId);
  if (!defaultLog) {
    throw new Error('Invalid log type');
  }

  // Récupérer l'unité de mesure correspondante
  const unitsQuery = new Parse.Query('MeasurementUnit');
  const unit = await unitsQuery.equalTo('name', defaultLog.unitName).first();

  if (!unit) {
    throw new Error('Unit not found');
  }

  const nutritionLog = new Parse.Object('NutritionLog');
  nutritionLog.set('name', defaultLog.name);
  nutritionLog.set('date', date);
  nutritionLog.set('currentValue', defaultLog.currentValue);
  nutritionLog.set('targetValue', defaultLog.targetValue);
  nutritionLog.set('mode', defaultLog.mode);
  nutritionLog.set('unit', unit);
  nutritionLog.set('user', user);
  await nutritionLog.save();
  return nutritionLog;
};

export const updateNutritionLog = async (
  logId: string,
  amount: number,
  isTarget: boolean = false
): Promise<NutritionLog[]> => {
  const currentUser = await getCurrentUser();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    // Récupérer tous les logs du jour
    const logsQuery = new Parse.Query('NutritionLog');
    logsQuery.equalTo('user', currentUser);
    logsQuery.greaterThanOrEqualTo('date', today);
    logsQuery.lessThan('date', new Date(today.getTime() + 24 * 60 * 60 * 1000));
    const existingLogs = await logsQuery.find();

    console.log('Logs existants:', existingLogs.map(l => ({
      name: l.get('name'),
      id: l.id,
      currentValue: l.get('currentValue')
    })));
    console.log('Recherche du log:', logId);

    // Chercher le log spécifique par son nom (insensible à la casse)
    let log = existingLogs.find(l => {
      const logName = l.get('name').toLowerCase();
      const searchId = logId.toLowerCase();
      console.log('Comparaison:', { logName, searchId, match: logName === searchId });
      return logName === searchId;
    });

    console.log('Log trouvé:', log ? {
      name: log.get('name'),
      id: log.id,
      currentValue: log.get('currentValue')
    } : 'aucun');

    // Si le log n'existe pas, le créer
    if (!log) {
      console.log('Création d\'un nouveau log pour:', logId);
      log = await createNutritionLog(logId, currentUser, today);
    }

    if (isTarget) {
      log.set('targetValue', Math.round(amount * 10) / 10);
    } else {
      const currentValue = log.get('currentValue') || 0;
      const newValue = Math.max(0, Math.round((currentValue + amount) * 10) / 10);
      console.log('Mise à jour de la valeur:', { currentValue, amount, newValue });
      log.set('currentValue', newValue);
    }
    await log.save();

    // Récupérer tous les logs mis à jour
    const updatedLogs = await logsQuery.find();

    return updatedLogs.map(log => ({
      id: log.id || '',
      name: log.get('name'),
      date: log.get('date'),
      currentValue: Math.round(log.get('currentValue') * 10) / 10,
      targetValue: Math.round(log.get('targetValue') * 10) / 10,
      mode: log.get('mode') as NutritionMode,
      unit: {
        id: log.get('unit').id || '',
        name: log.get('unit').get('name')
      },
      user: log.get('user').id || ''
    }));
  } catch (error) {
    console.error('Error updating nutrition log:', error);
    throw error;
  }
};

export const resetNutritionLog = async (logId: string): Promise<NutritionLog[]> => {
  const currentUser = await getCurrentUser();

  try {
    const log = await new Parse.Query('NutritionLog')
      .equalTo('user', currentUser)
      .equalTo('objectId', logId)
      .first();

    if (!log) {
      throw new Error('Log not found');
    }

    log.set('currentValue', 0);
    await log.save();

    // Récupérer tous les logs mis à jour
    const logsQuery = new Parse.Query('NutritionLog');
    logsQuery.equalTo('user', currentUser);
    logsQuery.equalTo('date', log.get('date'));
    const updatedLogs = await logsQuery.find();

    return updatedLogs.map(log => ({
      id: log.id || '',
      name: log.get('name'),
      date: log.get('date'),
      currentValue: log.get('currentValue'),
      targetValue: log.get('targetValue'),
      mode: log.get('mode'),
      unit: {
        id: log.get('unit').id || '',
        name: log.get('unit').get('name')
      },
      user: log.get('user').id || ''
    }));
  } catch (error) {
    console.error('Error resetting nutrition log:', error);
    throw error;
  }
};

export const toggleNutritionMode = async (
  state: AppState,
  date: string
): Promise<AppState> => {
  const currentUser = await getCurrentUser();

  try {
    const logs = await new Parse.Query('NutritionLog')
      .equalTo('user', currentUser)
      .equalTo('date', new Date(date))
      .find();

    const newMode = state.nutritionLogs[date][0]?.mode === 'health' ? 'diet' : 'health';

    // Mettre à jour tous les logs du jour
    await Promise.all(logs.map(log => {
      log.set('mode', newMode);
      return log.save();
    }));

    // Mettre à jour l'état local
    const updatedLogs = state.nutritionLogs[date].map(l => ({
      ...l,
      mode: newMode
    }));

    return {
      ...state,
      nutritionLogs: {
        ...state.nutritionLogs,
        [date]: updatedLogs
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
  logId: string,
  amount: number
): Promise<AppState> => {
  const currentUser = await getCurrentUser();

  try {
    const log = await new Parse.Query('NutritionLog')
      .equalTo('user', currentUser)
      .equalTo('objectId', logId)
      .first();

    if (!log) {
      throw new Error('Log not found');
    }

    log.set('targetValue', amount);
    await log.save();

    // Mettre à jour l'état local
    const updatedLogs = state.nutritionLogs[date].map(l => {
      if (l.id === logId) {
        return { ...l, targetValue: amount };
      }
      return l;
    });

    return {
      ...state,
      nutritionLogs: {
        ...state.nutritionLogs,
        [date]: updatedLogs
      }
    };
  } catch (error) {
    console.error('Error updating nutrition target:', error);
    throw error;
  }
}; 