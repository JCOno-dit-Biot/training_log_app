import type { ActivityForm, ActivityPayload } from "@/entities/activities/model";

export function toPayload(formData: ActivityForm): ActivityPayload {
    const tempStr = formData.weather.temperature?.trim() ?? '';
    const temperature =
        tempStr === '' ? null : Number(tempStr); // float | null

    const humidityStr = formData.weather.humidity?.trim() ?? '';
    const humidity = humidityStr === '' ? null : Number(humidityStr) / 100

    return {
        ...formData,
        weather: {
            ...formData.weather,
            temperature,
            humidity
        },
    };
}
