import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getRunners } from '../api/runners';
import { Runner } from '../types/Runner'

type RunnerCache = {
  runners: Map<number, Runner>;
};

const RunnerContext = createContext<RunnerCache | null>(null);

export const useRunnerCache = () => {
  const context = useContext(RunnerContext);
  if (!context) throw new Error("RunnerCacheProvider is missing");
  return context;
};

export const RunnerCacheProvider = ({ children }: { children: ReactNode }) => {
  const [runners, setRunners] = useState(new Map());

  useEffect(() => {
    const runnerMap = new Map();

    getRunners().then((runners) => {
         for (const runner of runners) {
            console.log(runner)
            runnerMap.set(runner.id, runner);
        }
    });

    setRunners(runnerMap);

  }, []);

  return (
    <RunnerContext.Provider value={{ runners }}>
      {children}
    </RunnerContext.Provider>
  );
};