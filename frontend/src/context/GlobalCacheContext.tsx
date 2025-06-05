import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getDogs } from '../api/dogs';
import { getRunners } from '../api/runners';
import { Dog } from '../types/Dog';
import { Runner } from '../types/Runner';

type GlobalCache = {
  dogs: Map<number, Dog>;
  runners: Map<number, Runner>;
};

const GlobalContext = createContext<GlobalCache | null>(null);

export const useGlobalCache = () => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error("CacheProvider is missing");
  return context;
};

export const GlobalCacheProvider = ({ children }: { children: ReactNode }) => {
  const [dogs, setDogs] = useState(new Map());
  const [runners, setRunners] = useState(new Map());

  useEffect(() => {
    const dogMap = new Map();
    const runnerMap = new Map();

    getDogs().then((dogs) => {
        for (const dog of dogs) {
            dogMap.set(dog.id, dog);
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

  }, []);

  return (
    <GlobalContext.Provider value={{ dogs, runners }}>
      {children}
    </GlobalContext.Provider>
  );
};