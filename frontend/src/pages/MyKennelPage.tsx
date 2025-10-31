import DogCard from '@features/dogs/ui/DogCard';
import RunnerCard from '@features/runners/ui/RunnerCard';
import { useDogs } from '@/features/dogs/model/useDogs';
import { useRunners } from '@/features/runners/model/useRunners';

export default function MyKennelPage() {
  // const [runners, setRunners] = useState<Runner[]>([]);
  // const [dogs, setDogs] = useState<Dog[]>([]);

  // useEffect(() => {
  //   getRunners().then(setRunners).catch(console.error);
  //   getDogs().then(setDogs).catch(console.error);
  // }, []);

  const { list: dogs } = useDogs();
  const { list: runners } = useRunners();

  const sortedDogs = [...dogs].sort(
    (a, b) => new Date(a.date_of_birth).getTime() - new Date(b.date_of_birth).getTime(),
  );
  return (
    <div className="max-w-full space-y-20">
      {/* Runners Section */}
      <section className="mt-4 w-full max-w-full">
        <h2 className="text-centered text-cream bg-primary mb-4 rounded p-1 text-2xl font-bold">
          Runners
        </h2>
        <div className="scroll-snap-x max-w-full overflow-x-auto scroll-smooth">
          <div className="flex snap-x snap-mandatory gap-3 pb-2">
            {runners.map((runner) => (
              <div
                key={runner.id}
                className="w-[80%] flex-shrink-0 snap-start sm:w-[50%] md:w-[33%] lg:w-[25%]"
              >
                <RunnerCard key={runner.id} runner={runner} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dogs Section */}
      <section className="w-full max-w-full">
        <h2 className="text-cream bg-primary mb-4 rounded p-1 text-2xl font-bold">Dogs</h2>
        <div className="scroll-snap-x max-w-full overflow-x-auto scroll-smooth">
          <div className="flex snap-x snap-mandatory gap-3 pb-2">
            {sortedDogs.map((dog) => (
              <div
                key={dog.id}
                className="w-[80%] flex-shrink-0 snap-start sm:w-[50%] md:w-[33%] lg:w-[25%]"
              >
                <DogCard dog={dog} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
