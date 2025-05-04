import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Auth from './components/Auth';
import Header from './components/Header';
import DailyTracker from './components/DailyTracker';
import Progress from './components/Progress';
import Calendar from './components/Calendar';
import Params from './components/Params';
import { formatDate } from './utils/dateUtils';
import { 
  getInitialState, 
  updateNutritionLog,
  updateNutritionTarget,
  toggleNutritionMode,
  updateLogToDefault,
  getLogsForDate
} from './utils/parseStorageUtils';
import { AppState, NutritionLog } from './types';
import Parse from './parseConfig';
import Navbar from './components/Navbar';

function App() {
  const [state, setState] = useState<AppState | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<NutritionLog[]>([]);
  const [isParamsMode, setIsParamsMode] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = Parse.User.current();
      if (!currentUser) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      setIsAuthenticated(true);
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (isAuthenticated) {
        try {
          const today = formatDate(new Date());
          const logs = await getLogsForDate(today);
          setState({
            currentDate: today,
            nutritionLogs: {
              [today]: logs
            }
          });
          setLogs(logs);
        } catch (error) {
          console.error('Error loading data:', error);
        }
      }
    };

    loadData();
  }, [isAuthenticated]);

  const handleLogin = async () => {
    setIsAuthenticated(true);
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
      const logs = await getLogsForDate(newDate);
      setState(prevState => {
        if (!prevState) return null;
        return {
          ...prevState,
          currentDate: newDate,
          nutritionLogs: {
            ...prevState.nutritionLogs,
            [newDate]: logs
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
      const logs = await getLogsForDate(newDate);
      setState(prevState => {
        if (!prevState) return null;
        return {
          ...prevState,
          currentDate: newDate,
          nutritionLogs: {
            ...prevState.nutritionLogs,
            [newDate]: logs
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
      const logs = await getLogsForDate(today);
      setState(prevState => {
        if (!prevState) return null;
        return {
          ...prevState,
          currentDate: today,
          nutritionLogs: {
            ...prevState.nutritionLogs,
            [today]: logs
          }
        };
      });
    } catch (error) {
      console.error('Error loading today:', error);
    }
  };
  
  const handleUpdateLog = async (logId: string, amount: number) => {
    if (!state) return;
    try {
      const updatedLogs = await updateNutritionLog(logId, amount, false, state.currentDate);
      setState(prevState => {
        if (!prevState) return null;
        return {
          ...prevState,
          nutritionLogs: {
            ...prevState.nutritionLogs,
            [prevState.currentDate]: updatedLogs
          }
        };
      });
      setLogs(updatedLogs);
    } catch (error) {
      console.error('Error updating log:', error);
    }
  };
  
  const handleUpdateTarget = async (logId: string, amount: number) => {
    if (!state) return;
    try {
      const updatedLogs = await updateNutritionLog(logId, amount, true, state.currentDate);
      setState(prevState => {
        if (!prevState) return null;
        return {
          ...prevState,
          nutritionLogs: {
            ...prevState.nutritionLogs,
            [prevState.currentDate]: updatedLogs
          }
        };
      });
      setLogs(updatedLogs);
    } catch (error) {
      console.error('Error updating target:', error);
    }
  };
  
  const handleResetLog = async (logId: string): Promise<NutritionLog[]> => {
    if (!state) return [];
    try {
      const updatedLogs = await updateLogToDefault(logId, state.currentDate);
      setState(prevState => {
        if (!prevState) return null;
        return {
          ...prevState,
          nutritionLogs: {
            ...prevState.nutritionLogs,
            [prevState.currentDate]: updatedLogs
          }
        };
      });
      setLogs(updatedLogs);
      return updatedLogs;
    } catch (error) {
      console.error('Error resetting log:', error);
      throw error;
    }
  };
  
  const handleToggleMode = () => {
    if (!state) return;
    setIsParamsMode(!isParamsMode);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app">
        <div className="text-2xl text-gray-700">Chargement...</div>
      </div>
    );
  }

  const currentLogs = state?.nutritionLogs[state?.currentDate] || [];

  return (
    <Router>
      <div className="min-h-screen bg-app">
        {isAuthenticated && <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />}
        <div className="container mx-auto px-4 md:px-0">
          <main className="flex-1 container mx-auto pb-20">
            <Routes>
              <Route path="/login" element={
                !isAuthenticated ? (
                  <Auth onLogin={handleLogin} />
                ) : (
                  <Navigate to="/" replace />
                )
              } />
              <Route path="/" element={
                isAuthenticated ? (
                  state ? (
                    <>
                      <Header
                        currentDate={state.currentDate}
                        onPrevDay={handlePrevDay}
                        onNextDay={handleNextDay}
                        onTodayClick={handleTodayClick}
                      />
                      <DailyTracker
                        logs={currentLogs}
                        onUpdateLog={handleUpdateLog}
                        onUpdateTarget={handleUpdateTarget}
                        onResetLog={handleResetLog}
                        onToggleMode={handleToggleMode}
                      />
                    </>
                  ) : (
                    <div className="min-h-screen flex items-center justify-center bg-app">
                      <div className="text-2xl text-gray-700">Chargement des données...</div>
                    </div>
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              } />
              <Route path="/progress" element={
                isAuthenticated ? (
                  <Progress dailyLogs={state?.nutritionLogs || {}} />
                ) : (
                  <Navigate to="/login" replace />
                )
              } />
              <Route path="/calendar" element={
                isAuthenticated ? (
                  <Calendar dailyLogs={state?.nutritionLogs || {}} />
                ) : (
                  <Navigate to="/login" replace />
                )
              } />
              <Route path="/params" element={
                isAuthenticated ? (
                  <Params
                    onUpdateTarget={handleUpdateTarget}
                    onResetLog={handleResetLog}
                    onToggleMode={handleToggleMode}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
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