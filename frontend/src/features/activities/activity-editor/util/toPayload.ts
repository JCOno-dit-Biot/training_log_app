import type { ActivityDogForm, ActivityForm, ActivityPayload } from "@/entities/activities/model";

function buildTemperatures(dog: ActivityDogForm) {
    const temperatures = [];

    const method = dog.measurement_method?.trim() || "ear";

    if (dog.temperature_before?.trim()) {
        temperatures.push({
            phase: "before" as const,
            recovery_minute: null,
            temperature_c: Number(dog.temperature_before),
            measurement_method: method,
        });
    }

    if (dog.temperature_after?.trim()) {
        temperatures.push({
            phase: "after" as const,
            recovery_minute: null,
            temperature_c: Number(dog.temperature_after),
            measurement_method: method,
        });
    }

    if (dog.temperature_recovery?.trim() && dog.recovery_minute?.trim()) {
        temperatures.push({
            phase: "recovery" as const,
            recovery_minute: Number(dog.recovery_minute),
            temperature_c: Number(dog.temperature_recovery),
            measurement_method: method,
        });
    }

    return temperatures;
}

export function toPayload(formData: ActivityForm): ActivityPayload {
    const tempStr = formData.weather?.temperature?.trim() ?? '';
    const temperature =
        tempStr === '' ? null : Number(tempStr); // float | null

    const humidityStr = formData.weather?.humidity?.trim() ?? '';
    const humidity = humidityStr === '' ? null : Number(humidityStr) / 100

    const conditionStr = formData.weather?.condition?.trim() ?? "";
    // Check if weather is provided
    const noWeatherProvided =
        temperature === null &&
        humidity === null &&
        conditionStr === "";

    const weather = noWeatherProvided
        ? null
        : {
            temperature,
            humidity,
            condition: conditionStr || null,
        };

    const dogs = formData.dogs.map((dog) => {
        const temperatures = buildTemperatures(dog);
        const hasTemps = temperatures.length > 0;

        return {
            id: null,
            dog_id: dog.dog_id,
            rating: dog.rating,
            cooling_method: hasTemps ? dog.cooling_method?.trim() || null : null,
            temperatures,
        };
    });

    return {
        ...formData,
        weather,
        dogs
    };
}
