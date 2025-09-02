// useEntityState.ts
import { useEffect, useState } from "react";
import { haWebSocket } from "./haWebsocket";

export function useEntityState(entityId: string) {
    const [state, setState] = useState<any | null>(null);

    useEffect(() => {
        // Subscribe to entity updates
        const unsubscribe = haWebSocket.subscribeEntity(
            entityId,
            (newState) => {
                setState(newState);
            }
        );

        // Cleanup on unmount
        return unsubscribe;
    }, [entityId]);

    return state;
}
