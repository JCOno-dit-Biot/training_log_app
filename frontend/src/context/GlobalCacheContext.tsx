import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getDogs } from '../api/dogs';
import { getRunners } from '../api/runners';
import { Dog } from '../types/Dog';
import { Runner } from '../types/Runner';
import { Sport } from '../types/Sport';
import { getSports } from '../api/sports';
import { useAuth } from './AuthContext';


type GlobalCache = {
  dogs: Map<number, Dog>;
  runners: Map<number, Runner>;
  sports: Map<number, Sport>;
};

const GlobalContext = createContext<GlobalCache | null>(null);

export const useGlobalCache = () => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error("CacheProvider is missing");
  return context;
};

export const GlobalCacheProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();

  const [dogs, setDogs] = useState(new Map());
  const [runners, setRunners] = useState(new Map());
  const [sports, setSports] = useState(new Map());

  useEffect(() => {
    console.log(isAuthenticated)
    if (!isAuthenticated) return;

    const dogMap = new Map();
    const runnerMap = new Map();
    const sportMap = new Map();

    getDogs().then((dogs) => {
        for (const dog of dogs) {
            dogMap.set(dog.id, dog);
            }
    }
    );

    getSports().then((sports) => {
      for (const sport of sports) {
        sportMap.set(sport.id, sport);
      }
    }
  );

    getRunners().then((runners) => {
         for (const runner of runners) {
            runnerMap.set(runner.id, runner);
        }
    });

    setDogs(dogMap);
    setRunners(runnerMap);
    setSports(sportMap)
  
  }, [isAuthenticated]);

  return (
    <GlobalContext.Provider value={{ dogs, runners, sports }}>
      {children}
    </GlobalContext.Provider>
  );
};