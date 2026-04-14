import type { ReactNode } from "react";
import { createContext, useState } from "react";

interface GeneralContextType {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

const GeneralContext = createContext<GeneralContextType | undefined>(undefined);

export function DateProvider({ children }: { children: ReactNode }) {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(today);

  return (
    <GeneralContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
      }}
    >
      {children}
    </GeneralContext.Provider>
  );
}
