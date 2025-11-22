import type { ActivityForm, ActivityPayload } from "@/entities/activities/model";

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

    return {
        ...formData,
        weather
    };
}
