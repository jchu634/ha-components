"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

function AltSwitch() {
    const [monitoredState, setMonitoredState] = useState(false);

    return (
        <div>
            {monitoredState == true ? (
                <div className="flex">
                    {/* Right Clicked */}
                    <div className="h-21 w-40 border-white border-2  flex items-center">
                        <p className="text-center w-full">Left Switch</p>
                    </div>

                    <div
                        className="border-black bg-white dark:border-white dark:bg-black border-y-2 border-r-2 flex"
                        onClick={() => setMonitoredState(false)}
                    >
                        <div className="h-20 w-30 border-x-1 border-y-2 bg-white border-black dark:border-white dark:bg-black -skew-y-[23deg] translate-y-[-25.5px] flex items-center">
                            <p className="text-center w-full">Right Switch</p>
                        </div>
                        <div className="h-20 w-15 border-l-1 border-y-2 bg-white border-black dark:border-white dark:bg-black skew-y-[40.32deg] translate-y-[-26px] "></div>
                    </div>
                </div>
            ) : (
                <div className="flex">
                    {/* Left Clicked */}
                    <div
                        className="border-black bg-white dark:border-white dark:bg-black border-y-2 border-l-2 flex"
                        onClick={() => setMonitoredState(true)}
                    >
                        <div className="h-20 w-15 border-x-1 border-y-2 bg-white border-black dark:border-white dark:bg-black -skew-y-[40.32deg] translate-y-[-26px]"></div>
                        <div className="h-20 w-30 border-r-1 border-y-2 bg-white border-black dark:border-white dark:bg-black skew-y-[23deg] translate-y-[-25.5px] flex items-center">
                            <p className="text-center w-full">Left Switch</p>
                        </div>
                    </div>
                    <div className="h-21 w-40 border-white border-2  flex items-center">
                        <p className="text-center w-full">Right Switch</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export { AltSwitch };
