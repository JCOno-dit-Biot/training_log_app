import DogCard from '@features/dogs/ui/DogCard';
import RunnerCard from '@features/runners/ui/RunnerCard';
import { useDogs } from '@/features/dogs/model/useDogs';
import { useRunners } from '@/features/runners/model/useRunners';

export default function MyKennelPage() {

  const { list: dogs } = useDogs();
  const { list: runners } = useRunners();

  const sortedDogs = [...dogs].sort(
    (a, b) => new Date(a.date_of_birth).getTime() - new Date(b.date_of_birth).getTime(),
  );
  return (
    <div className="min-h-screen w-full bg-neutral-25 p-6">
      <div className="mx-auto w-full space-y-12 px-0 py-2">
        {/* Runners Section */}
        <section className="space-y-4">
          <h2 className="rounded bg-primary p-2 text-center text-2xl font-bold text-neutral-100">
            Runners
          </h2>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-4">
            {runners.map((runner) => (
              <RunnerCard key={runner.id} runner={runner} />
            ))}
          </div>
        </section>

        {/* Dogs Section */}
        <section className="space-y-4">
          <h2 className="rounded bg-primary p-2 text-center text-2xl font-bold text-neutral-100">
            Dogs
          </h2>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-4">
            {sortedDogs.map((dog) => (
              <DogCard key={dog.id} dog={dog} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}