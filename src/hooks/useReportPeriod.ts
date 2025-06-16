
import { useState } from 'react';
import { startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subYears } from 'date-fns';

export function useReportPeriod() {
  const [reportPeriod, setReportPeriod] = useState<string>('current-month');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });

  const handlePeriodChange = (period: string) => {
    setReportPeriod(period);
    const now = new Date();
    
    switch (period) {
      case 'current-month':
        setDateRange({ from: startOfMonth(now), to: endOfMonth(now) });
        break;
      case 'last-month':
        const lastMonth = subMonths(now, 1);
        setDateRange({ from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) });
        break;
      case 'current-year':
        setDateRange({ from: startOfYear(now), to: endOfYear(now) });
        break;
      case 'last-year':
        const lastYear = subYears(now, 1);
        setDateRange({ from: startOfYear(lastYear), to: endOfYear(lastYear) });
        break;
      case 'last-3-months':
        setDateRange({ from: subMonths(now, 3), to: now });
        break;
      case 'last-6-months':
        setDateRange({ from: subMonths(now, 6), to: now });
        break;
    }
  };

  return {
    reportPeriod,
    dateRange,
    setDateRange,
    handlePeriodChange
  };
}
