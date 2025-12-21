import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface DashboardVisibility {
  // Metric Cards
  showCustomersCard: boolean;
  showSalesCard: boolean;
  showRealPriceCard: boolean;
  showDepositsCard: boolean;
  // Financial Summary
  showFinancialSummary: boolean;
  showFinanceRealPrice: boolean;
  showFinanceSalePrice: boolean;
  showFinanceDownPayment: boolean;
  showFinanceAdminCommission: boolean;
  showFinanceRoayaCommission: boolean;
  showFinanceNetIncome: boolean;
  // Sections
  showSalesTable: boolean;
  showLeadsList: boolean;
  showCallsList: boolean;
  showSitePlan: boolean;
  showCharts: boolean;
}

interface DashboardSettingsContextType {
  visibility: DashboardVisibility;
  toggleVisibility: (key: keyof DashboardVisibility) => void;
  showAllSections: () => void;
  hideAllSections: () => void;
}

const defaultVisibility: DashboardVisibility = {
  showCustomersCard: true,
  showSalesCard: true,
  showRealPriceCard: true,
  showDepositsCard: true,
  showFinancialSummary: true,
  showFinanceRealPrice: true,
  showFinanceSalePrice: true,
  showFinanceDownPayment: true,
  showFinanceAdminCommission: true,
  showFinanceRoayaCommission: true,
  showFinanceNetIncome: true,
  showSalesTable: true,
  showLeadsList: true,
  showCallsList: true,
  showSitePlan: true,
  showCharts: true,
};

const DashboardSettingsContext = createContext<DashboardSettingsContextType | undefined>(undefined);

export function DashboardSettingsProvider({ children }: { children: ReactNode }) {
  const [visibility, setVisibility] = useState<DashboardVisibility>(() => {
    const saved = localStorage.getItem("dashboardVisibility");
    return saved ? JSON.parse(saved) : defaultVisibility;
  });

  useEffect(() => {
    localStorage.setItem("dashboardVisibility", JSON.stringify(visibility));
  }, [visibility]);

  const toggleVisibility = (key: keyof DashboardVisibility) => {
    setVisibility(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const showAllSections = () => {
    setVisibility(defaultVisibility);
  };

  const hideAllSections = () => {
    const allHidden = Object.keys(defaultVisibility).reduce((acc, key) => {
      acc[key as keyof DashboardVisibility] = false;
      return acc;
    }, {} as DashboardVisibility);
    setVisibility(allHidden);
  };

  return (
    <DashboardSettingsContext.Provider value={{ visibility, toggleVisibility, showAllSections, hideAllSections }}>
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
