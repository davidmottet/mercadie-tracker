import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import Header from './components/Header';
import DailyTracker from './components/DailyTracker';
import Progress from './components/Progress';
import Calendar from './components/Calendar';
import Params from './components/Params';
import { formatDate } from './utils/dateUtils';
import { 
  getInitialState, 
  updateNutritionGoal,
  updateNutritionTarget,
  resetNutritionGoal,
  toggleNutritionMode,
  defaultNutritionGoals,
  getDailyLog
} from './utils/parseStorageUtils';
import { AppState, DailyLog } from './types';
import Parse from './parseConfig';
import Navbar from './components/Navbar';

function App() {
  const [state, setState] = useState<AppState | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const currentUser = Parse.User.current();
        if (currentUser) {
          // Vérifier si la session est valide
          const sessionToken = currentUser.getSessionToken();
          if (sessionToken) {
            await Parse.User.become(sessionToken);
            // Attendre que l'utilisateur soit complètement authentifié
            const user = await Parse.User.currentAsync();
            if (user && user.authenticated()) {
              setIsAuthenticated(true);
              // Charger les données immédiatement après l'authentification
              try {
                const initialState = await getInitialState();
                setState(initialState);
              } catch (error) {
                console.error('Error loading initial state:', error);
                if (error instanceof Error && error.message.includes('user is required')) {
                  await Parse.User.logOut();
                  setIsAuthenticated(false);
                }
              }
            } else {
              await Parse.User.logOut();
              setIsAuthenticated(false);
            }
          } else {
            await Parse.User.logOut();
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Session check failed:', error);
        await Parse.User.logOut();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const initialState = await getInitialState();
      setState(initialState);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error loading initial state after login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await Parse.User.logOut();
    setIsAuthenticated(false);
    setState(null);
  };

  const handlePrevDay = async () => {
    if (!state) return;
    
    const currentDate = new Date(state.currentDate);
    currentDate.setDate(currentDate.getDate() - 1);
    const newDate = formatDate(currentDate);
    
    try {
      const dailyLog = await getDailyLog(newDate);
      setState(prevState => {
        if (!prevState) return null;
        return {
          ...prevState,
          currentDate: newDate,
          dailyLogs: {
            ...prevState.dailyLogs,
            [newDate]: dailyLog
          }
        };
      });
    } catch (error) {
      console.error('Error loading previous day:', error);
    }
  };
  
  const handleNextDay = async () => {
    if (!state) return;
    
    const currentDate = new Date(state.currentDate);
    currentDate.setDate(currentDate.getDate() + 1);
    const newDate = formatDate(currentDate);
    
    try {
      const dailyLog = await getDailyLog(newDate);
      setState(prevState => {
        if (!prevState) return null;
        return {
          ...prevState,
          currentDate: newDate,
          dailyLogs: {
            ...prevState.dailyLogs,
            [newDate]: dailyLog
          }
        };
      });
    } catch (error) {
      console.error('Error loading next day:', error);
    }
  };
  
  const handleTodayClick = async () => {
    if (!state) return;
    
    const today = formatDate(new Date());
    try {
      const dailyLog = await getDailyLog(today);
      setState(prevState => {
        if (!prevState) return null;
        return {
          ...prevState,
          currentDate: today,
          dailyLogs: {
            ...prevState.dailyLogs,
            [today]: dailyLog
          }
        };
      });
    } catch (error) {
      console.error('Error loading today:', error);
    }
  };
  
  const handleUpdateGoal = async (goalId: string, amount: number) => {
    if (!state) return;
    
    try {
      const updatedState = await updateNutritionGoal(state, state.currentDate, goalId, amount);
      setState(updatedState);
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };
  
  const handleUpdateTarget = async (goalId: string, amount: number) => {
    if (!state) return;
    
    try {
      const updatedState = await updateNutritionTarget(state, state.currentDate, goalId, amount);
      setState(updatedState);
    } catch (error) {
      console.error('Error updating target:', error);
    }
  };
  
  const handleResetGoal = async (goalId: string) => {
    if (!state) return;
    
    try {
      const updatedState = await resetNutritionGoal(state, state.currentDate, goalId);
      setState(updatedState);
    } catch (error) {
      console.error('Error resetting goal:', error);
    }
  };
  
  const handleToggleMode = async () => {
    if (!state) return;
    
    try {
      const updatedState = await toggleNutritionMode(state, state.currentDate);
      setState(updatedState);
    } catch (error) {
      console.error('Error toggling mode:', error);
    }
  };

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  if (isLoading || !state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app">
        <div className="text-2xl text-gray-700">Chargement...</div>
      </div>
    );
  }

  const currentDailyLog = state.dailyLogs[state.currentDate];
  if (!currentDailyLog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app">
        <div className="text-2xl text-gray-700">Chargement des données...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-app">
        <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        <div className="container mx-auto px-4 md:px-0">
          <main className="flex-1 container mx-auto pb-20">
            <Routes>
              <Route path="/" element={
                <>
                  <Header
                    currentDate={state.currentDate}
                    onPrevDay={handlePrevDay}
                    onNextDay={handleNextDay}
                    onTodayClick={handleTodayClick}
                    showDateNav={true}
                  />
                  <DailyTracker
                    dailyLog={currentDailyLog}
                    onUpdateGoal={handleUpdateGoal}
                    onResetGoal={handleResetGoal}
                    onToggleMode={handleToggleMode}
                  />
                </>
              } />
              <Route path="/progress" element={<Progress dailyLogs={state.dailyLogs} />} />
              <Route path="/calendar" element={<Calendar dailyLogs={state.dailyLogs} />} />
              <Route path="/params" element={
                <Params
                  dailyLog={currentDailyLog}
                  onUpdateTarget={handleUpdateTarget}
                  onResetGoal={handleResetGoal}
                  onToggleMode={handleToggleMode}
                />
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;