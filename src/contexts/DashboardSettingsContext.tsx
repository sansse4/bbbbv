import { createContext, useContext, useState, ReactNode } from "react";

interface DashboardSettings {
  showData: boolean;
  showIcons: boolean;
}

interface DashboardSettingsContextType {
  settings: DashboardSettings;
  toggleShowData: () => void;
  toggleShowIcons: () => void;
}

const DashboardSettingsContext = createContext<DashboardSettingsContextType | undefined>(undefined);

export function DashboardSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<DashboardSettings>({
    showData: true,
    showIcons: true,
  });

  const toggleShowData = () => {
    setSettings(prev => ({ ...prev, showData: !prev.showData }));
  };

  const toggleShowIcons = () => {
    setSettings(prev => ({ ...prev, showIcons: !prev.showIcons }));
  };

  return (
    <DashboardSettingsContext.Provider value={{ settings, toggleShowData, toggleShowIcons }}>
      {children}
    </DashboardSettingsContext.Provider>
  );
}

export function useDashboardSettings() {
  const context = useContext(DashboardSettingsContext);
  if (context === undefined) {
    throw new Error("useDashboardSettings must be used within a DashboardSettingsProvider");
  }
  return context;
}
