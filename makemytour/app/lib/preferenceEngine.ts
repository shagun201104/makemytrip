export interface UserPreferences {
  seatPreference: "WINDOW" | "AISLE" | "EXTRA_LEGROOM" | "ANY";
  roomPreferences: {
    bedType: "KING" | "TWIN" | "ANY";
    highFloor: boolean;
    oceanView: boolean;
    quietRoom: boolean;
    nonSmoking: boolean;
  };
  travelStyle: "BEACH" | "HERITAGE" | "LUXURY" | "MOUNTAIN" | "CITY";
}

const STORAGE_KEY = "mmt_user_preferences_v1";

const DEFAULT_PREFERENCES: UserPreferences = {
  seatPreference: "WINDOW",
  roomPreferences: {
    bedType: "KING",
    highFloor: true,
    oceanView: true,
    quietRoom: true,
    nonSmoking: true,
  },
  travelStyle: "BEACH",
};

class PreferenceEngine {
  getPreferences(): UserPreferences {
    if (typeof window === "undefined") return DEFAULT_PREFERENCES;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  }

  savePreferences(prefs: Partial<UserPreferences>): UserPreferences {
    const current = this.getPreferences();
    const updated = { ...current, ...prefs };
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    return updated;
  }
}

export const preferenceEngine = new PreferenceEngine();
