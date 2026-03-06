/**
 * Global shared state for the SleepWell Engine.
 */

export const ENGINE_REGISTRY = {
    active: false,
    startTime: "Now",
    wakeTime: { hour: 7, minute: 0, period: 'AM' },
    timeLeft: 3600,
    isLightOn: false,
    isPacingOn: false,
    hideLightAlert: false,
    currentLightLevel: "Waiting...",
};

type Listener = () => void;
const listeners = new Set<Listener>();

export const updateEngineState = (updates: Partial<typeof ENGINE_REGISTRY>) => {
    Object.assign(ENGINE_REGISTRY, updates);
    listeners.forEach(l => l());
};

export const subscribeToEngine = (listener: Listener) => {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
};

// Global background light simulation
let backgroundInterval: any = null;
export const startBackgroundLightSense = () => {
    if (backgroundInterval) return;
    backgroundInterval = setInterval(() => {
        if (ENGINE_REGISTRY.active && ENGINE_REGISTRY.isLightOn) {
            const levels = ["Ideal (Dark)", "Acceptable", "Device Light Present", "Room Too Bright"];
            const newLevel = levels[Math.floor(Math.random() * levels.length)];
            updateEngineState({ currentLightLevel: newLevel });
        }
    }, 5000); // 5 sec background ping
};

startBackgroundLightSense();

export default ENGINE_REGISTRY;
