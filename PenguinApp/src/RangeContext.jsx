import { createContext, useContext, useState } from "react";

const RangeContext = createContext();

export function RangeProvider({ children }) {
  const [rangeType, setRangeType] = useState("year");
  const [startDate, setStartDate] = useState(new Date("2025-01-01T00:00:00Z"));
  const [endDate, setEndDate] = useState(new Date("2025-12-31T23:59:59Z"));

  return (
    <RangeContext.Provider value={{
      rangeType, setRangeType,
      startDate, setStartDate,
      endDate, setEndDate
    }}>
      {children}
    </RangeContext.Provider>
  );
}

export function useRange() {
  return useContext(RangeContext);
}