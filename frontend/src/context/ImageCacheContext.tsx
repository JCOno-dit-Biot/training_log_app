import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getDogs } from '../api/dogs';
import { getRunners } from '../api/runners';

type ImageCache = {
  dogs: Map<number, string>;
  runners: Map<number, string>;
};

const ImageContext = createContext<ImageCache | null>(null);

export const useImageCache = () => {
  const context = useContext(ImageContext);
  if (!context) throw new Error("ImageCacheProvider is missing");
  return context;
};

export const ImageCacheProvider = ({ children }: { children: ReactNode }) => {
  const [dogs, setDogs] = useState(new Map());
  const [runners, setRunners] = useState(new Map());

  useEffect(() => {
    const dogMap = new Map();
    const runnerMap = new Map();

    getDogs().then((dogs) => {
        for (const dog of dogs) {
            dogMap.set(dog.id, dog.image_url);
            }
    }
    );

    getRunners().then((runners) => {
         for (const runner of runners) {
            runnerMap.set(runner.id, runner.image_url);
        }
    });

    setDogs(dogMap);
    setRunners(runnerMap);

  }, []);

  return (
    <ImageContext.Provider value={{ dogs, runners }}>
      {children}
    </ImageContext.Provider>
  );
};