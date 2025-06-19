
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ResponsiveContainer, AreaChart, Area, Line, XAxis, YAxis } from 'recharts';

interface MonthlyData {
  monthLabel: string;
  recettes: number;
  depenses: number;
  solde: number;
}

interface MonthlyEvolutionChartProps {
  data: MonthlyData[];
}

export function MonthlyEvolutionChart({ data }: MonthlyEvolutionChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Évolution Mensuelle</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            recettes: { label: "Recettes", color: "#22c55e" },
            depenses: { label: "Dépenses", color: "#ef4444" },
            solde: { label: "Solde", color: "#3b82f6" }
          }}
          className="h-[350px]"
        >
            <AreaChart data={data}>
              <XAxis dataKey="monthLabel" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="recettes"
                stackId="1"
                stroke="#22c55e"
                fill="#22c55e"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="depenses"
                stackId="2"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.6}
              />
              <Line
                type="monotone"
                dataKey="solde"
                stroke="#3b82f6"
                strokeWidth={3}
              />
            </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
