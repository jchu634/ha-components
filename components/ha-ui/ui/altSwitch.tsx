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
                    <div className="flex h-21 w-40 items-center border-2 border-white">
                        <p className="w-full text-center">Left Switch</p>
                    </div>

                    <div
                        className="flex border-y-2 border-r-2 border-black bg-white dark:border-white dark:bg-black"
                        onClick={() => setMonitoredState(false)}
                    >
                        <div className="flex h-20 w-30 translate-y-[-25.5px] -skew-y-[23deg] items-center border-x-1 border-y-2 border-black bg-white dark:border-white dark:bg-black">
                            <p className="w-full text-center">Right Switch</p>
                        </div>
                        <div className="h-20 w-15 translate-y-[-26px] skew-y-[40.32deg] border-y-2 border-l-1 border-black bg-white dark:border-white dark:bg-black"></div>
                    </div>
                </div>
            ) : (
                <div className="flex">
                    {/* Left Clicked */}
                    <div
                        className="flex border-y-2 border-l-2 border-black bg-white dark:border-white dark:bg-black"
                        onClick={() => setMonitoredState(true)}
                    >
                        <div className="h-20 w-15 translate-y-[-26px] -skew-y-[40.32deg] border-x-1 border-y-2 border-black bg-white dark:border-white dark:bg-black"></div>
                        <div className="flex h-20 w-30 translate-y-[-25.5px] skew-y-[23deg] items-center border-y-2 border-r-1 border-black bg-white dark:border-white dark:bg-black">
                            <p className="w-full text-center">Left Switch</p>
                        </div>
                    </div>
                    <div className="flex h-21 w-40 items-center border-2 border-white">
                        <p className="w-full text-center">Right Switch</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export { AltSwitch };
