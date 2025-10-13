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
    mdiWaterOpacity,
} from "@mdi/js";
import { RefreshCcwIcon } from "lucide-react";

import type { EntityId } from "@/types/entity-types";
import { haWebSocket } from "@/lib/haWebsocket";

export interface WeatherProps {
    /**
     * HomeAssistant Entity Name
     */
    entity: EntityId;
    /**
     * Forecast Type
     */
    forecastType?: "daily" | "hourly" | "twice_daily";
    /**
     * How often to refresh data
     */
    refreshIntervalMinutes?: number; // default: 1 Hour
    /**
     * Max amount of days/hours of the forecast to show.
     * NOT inclusive of the current day/hour
     */
    maximumDaysShown?: number;
}

// ---------- Utility Functions ----------

function fetchForecast(setForecasts: React.Dispatch<React.SetStateAction<any>>, entity: string) {
    haWebSocket
        .callServiceWithResponse("weather", "get_forecasts", {
            entity_id: entity,
            type: "daily",
        })
        .then((response) => {
            setForecasts(response?.response?.[entity]?.forecast);
            console.log("Response: ", response);
        })
        .catch((error) => {
            console.error("Service call failed:", error);
        });
}

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
export function Weather({
    entity,
    forecastType = "daily",
    refreshIntervalMinutes = 60,
    maximumDaysShown = 7,
}: WeatherProps) {
    const [forecasts, setForecasts] = useState<any[] | null>(null);

    useEffect(() => {
        // Fetch on mount
        fetchForecast(setForecasts, entity);

        let timer: number | null = null;
        if (refreshIntervalMinutes > 0) {
            timer = window.setInterval(
                () => {
                    fetchForecast(setForecasts, entity);
                },
                refreshIntervalMinutes * 1000 * 60,
            );
        }

        return () => {
            if (timer) window.clearInterval(timer);
        };
    }, [entity, forecastType, refreshIntervalMinutes]);
    return (
        <div className="flex space-x-4">
            <div className="flex space-x-4">
                <div className="flex flex-col space-y-4">
                    <div className="flex w-full justify-between">
                        {forecasts && (
                            <div className="flex-col">
                                <div className="flex w-full space-x-2">
                                    <p>
                                        {Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
                                            new Date(forecasts[0].datetime),
                                        )}
                                    </p>
                                    <div className="flex">
                                        <WeatherIcon
                                            condition={forecasts[0].condition}
                                            className="size-6"
                                        ></WeatherIcon>
                                        <p> ({forecasts[0].condition})</p>
                                    </div>
                                </div>

                                <div className="flex">
                                    <p>Humidity: {forecasts[0].humidity}</p>
                                </div>
                                <div className="flex">
                                    <p>Chance of rain: {forecasts[0].precipitation_probability}%</p>
                                </div>
                            </div>
                        )}
                        <Button
                            size="icon"
                            onClick={() => {
                                fetchForecast(setForecasts, entity);
                            }}
                        >
                            <RefreshCcwIcon />
                        </Button>
                    </div>

                    {forecasts && (
                        <div className="bg-accent flex rounded-lg p-2">
                            {forecasts.map((forecast: any, index: number) => {
                                if (index === 0 || index > maximumDaysShown) return null;
                                return (
                                    <div key={index} className="flex w-10 flex-col items-center">
                                        <p>
                                            {Intl.DateTimeFormat("en-US", { weekday: "short" }).format(
                                                new Date(forecast.datetime),
                                            )}
                                        </p>

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
