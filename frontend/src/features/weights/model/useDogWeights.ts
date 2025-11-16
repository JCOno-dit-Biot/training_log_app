import { fetchWeights } from "@/entities/dogs/api/weight";
import type { FetchWeightsParams } from "@/entities/dogs/model";
import { qk } from "@/shared/api/keys";

import { useQuery } from "@tanstack/react-query";

export function useWeights(params: FetchWeightsParams) {

    const enabled = true; // change to params.dogId in case we do not watn to allow for all dogs
    return useQuery({
        queryKey: qk.weights(params),
        queryFn: () => fetchWeights(params),
        enabled,
        staleTime: 60_000,
    });
}
