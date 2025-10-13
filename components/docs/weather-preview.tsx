"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@mdi/react";
import {
    mdiWeatherNight,
    mdiWeatherCloudy,
    mdiWeatherFog,
    mdiWeatherLightningRainy,
    mdiWeatherHail,
    mdiWeatherLightning,
    mdiWeatherPouring,
    mdiWeatherSunny,
    mdiWeatherRainy,
    mdiWeatherPartlyCloudy,
    mdiWeatherSnowyRainy,
    mdiWeatherSnowy,
    mdiWeatherWindy,
    mdiWeatherWindyVariant,
    mdiAlertCircleCheckOutline,
} from "@mdi/js";
import { RefreshCcwIcon } from "lucide-react";

import { cn } from "@/lib/utils";
type OptionalWeatherFeatures = "rain_chance" | "temperature" | "wind_speed" | "humidity";

interface WeatherProps {
    /**
     * Forecast Type (Optional)
     * Default: daily
     *
     */
    forecastType?: "daily" | "hourly"; // | "twice_daily";

    maximumForecastShown?: number;
    OptionalFeatures?: OptionalWeatherFeatures[];
}

// ---------- Utility Functions ----------
function WeatherIcon({ condition, ...props }: any) {
    switch (condition) {
        case "clear-night":
            return <Icon path={mdiWeatherNight} {...props} />;
        case "cloudy":
            return <Icon path={mdiWeatherCloudy} {...props} />;
        case "fog":
            return <Icon path={mdiWeatherFog} {...props} />;
        case "hail":
            return <Icon path={mdiWeatherHail} {...props} />;
        case "lightning":
            return <Icon path={mdiWeatherLightning} {...props} />;
        case "lightning-rainy":
            return <Icon path={mdiWeatherLightningRainy} {...props} />;
        case "partlycloudy":
            return <Icon path={mdiWeatherPartlyCloudy} {...props} />;
        case "pouring":
            return <Icon path={mdiWeatherPouring} {...props} />;
        case "rainy":
            return <Icon path={mdiWeatherRainy} {...props} />;
        case "snowy":
            return <Icon path={mdiWeatherSnowy} {...props} />;
        case "snowy-rainy":
            return <Icon path={mdiWeatherSnowyRainy} {...props} />;
        case "sunny":
            return <Icon path={mdiWeatherSunny} {...props} />;
        case "windy":
            return <Icon path={mdiWeatherWindy} {...props} />;
        case "windy-variant":
            return <Icon path={mdiWeatherWindyVariant} {...props} />;

        case "exceptional":
            return <Icon path={mdiAlertCircleCheckOutline} {...props} />;
    }
}
export default function WeatherPreview({
    forecastType = "daily",
    maximumForecastShown = 7,
    OptionalFeatures,
}: WeatherProps) {
    const forecasts = [
        {
            condition: "windy",
            precipitation_probability: 86,
            temperature: 19.6,
            templow: 15.8,
            wind_speed: 20.17,
            humidity: 85,
        },
        {
            condition: "sunny",
            precipitation_probability: 5,
            temperature: 22.4,
            templow: 16.1,
            wind_speed: 12.3,
            humidity: 42,
        },
        {
            condition: "partlycloudy",
            precipitation_probability: 18,
            temperature: 20.1,
            templow: 14.9,
            wind_speed: 9.5,
            humidity: 58,
        },
        {
            condition: "rainy",
            precipitation_probability: 72,
            temperature: 17.3,
            templow: 13.5,
            wind_speed: 15.2,
            humidity: 92,
        },
        {
            condition: "cloudy",
            precipitation_probability: 34,
            temperature: 16.2,
            templow: 12.7,
            wind_speed: 10.9,
            humidity: 70,
        },
        {
            condition: "hail",
            precipitation_probability: 20,
            temperature: 14.5,
            templow: 11.8,
            wind_speed: 6.2,
            humidity: 94,
        },
        {
            condition: "snowy",
            precipitation_probability: 3,
            temperature: 18.2,
            templow: 13.9,
            wind_speed: 5.5,
            humidity: 45,
        },
        {
            condition: "partlycloudy",
            precipitation_probability: 15,
            temperature: 20.0,
            templow: 15.2,
            wind_speed: 8.3,
            humidity: 55,
        },
        {
            condition: "snowy",
            precipitation_probability: 63,
            temperature: 17.9,
            templow: 14.0,
            wind_speed: 11.8,
            humidity: 88,
        },
        {
            condition: "windy",
            precipitation_probability: 25,
            temperature: 19.1,
            templow: 15.0,
            wind_speed: 19.7,
            humidity: 66,
        },
    ];

    const now = new Date();
    return (
        <div className="flex space-x-4">
            <div className="flex space-x-4">
                <div className="flex flex-col space-y-4">
                    <div className="flex w-full justify-between">
                        {forecasts && (
                            <div className="flex-col">
                                <div className="flex w-full space-x-2">
                                    <p>{Intl.DateTimeFormat("en-US", { weekday: "long" }).format(now)}</p>
                                    <div className="flex">
                                        <WeatherIcon
                                            condition={forecasts[0].condition}
                                            className="size-6"
                                        ></WeatherIcon>
                                        <p> ({forecasts[0].condition})</p>
                                    </div>
                                </div>

                                {OptionalFeatures?.includes("humidity") && (
                                    <div className="flex">
                                        <p>Humidity: {forecasts[0].humidity}</p>
                                    </div>
                                )}
                                {OptionalFeatures?.includes("rain_chance") && (
                                    <div className="flex">
                                        <p>Chance of rain: {forecasts[0].precipitation_probability}%</p>
                                    </div>
                                )}
                                {OptionalFeatures?.includes("temperature") && (
                                    <div className="flex">
                                        <p>
                                            Temperature: {forecasts[0].temperature}
                                            {forecasts[0].templow && <> ({forecasts[0].templow})</>}
                                        </p>
                                    </div>
                                )}
                                {OptionalFeatures?.includes("wind_speed") && (
                                    // TODO Automatically grab wind units (Current assumes it is hm/h)
                                    <div className="flex">
                                        <p>Wind Speed: {forecasts[0].wind_speed}m/s</p>
                                    </div>
                                )}
                            </div>
                        )}
                        <Button size="icon">
                            <RefreshCcwIcon />
                        </Button>
                    </div>

                    {forecasts && (
                        <div className="bg-accent flex rounded-lg p-2">
                            {forecasts.map((forecast: any, index: number) => {
                                if (index === 0 || index > maximumForecastShown) return null;
                                // clone the base date object
                                const displayDate = new Date(now);

                                if (forecastType === "daily") {
                                    // offset by index days
                                    displayDate.setDate(now.getDate() + index);
                                } else if (forecastType === "hourly") {
                                    // offset by index hours
                                    displayDate.setHours(now.getHours() + index);
                                }

                                return (
                                    <div
                                        key={index}
                                        className={cn(
                                            "flex flex-col items-center",
                                            forecastType === "daily" && "w-10", // e.g. slightly wider for daily
                                            forecastType === "hourly" && "w-20", // narrower for hourly
                                        )}
                                    >
                                        {forecastType == "daily" && (
                                            <p>
                                                {Intl.DateTimeFormat("en-US", { weekday: "short" }).format(displayDate)}
                                            </p>
                                        )}
                                        {forecastType == "hourly" && (
                                            <p>
                                                {Intl.DateTimeFormat("en-US", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    hour12: true,
                                                }).format(displayDate)}
                                            </p>
                                        )}

                                        <WeatherIcon condition={forecast.condition} className="size-8"></WeatherIcon>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
