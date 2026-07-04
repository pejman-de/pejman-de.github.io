import React, { createContext, useCallback, useContext, useState } from "react";

interface LeadFormModalContextType {
  isOpen: boolean;
  selectedCategory?: string;
  openLeadForm: (category?: string) => void;
  closeLeadForm: () => void;
}

const LeadFormModalContext = createContext<LeadFormModalContextType | undefined>(undefined);

export function LeadFormModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  const openLeadForm = useCallback((category?: string) => {
    setSelectedCategory(category);
    setIsOpen(true);
  }, []);
  const closeLeadForm = useCallback(() => setIsOpen(false), []);

  return (
    <LeadFormModalContext.Provider value={{ isOpen, selectedCategory, openLeadForm, closeLeadForm }}>
      {children}
    </LeadFormModalContext.Provider>
  );
}

export function useLeadFormModal() {
  const context = useContext(LeadFormModalContext);
  if (!context) {
    throw new Error("useLeadFormModal must be used within LeadFormModalProvider");
  }
  return context;
}
