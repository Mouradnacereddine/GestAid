
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';

interface CategoryData {
  category: string;
  recettes: number;
  depenses: number;
}

interface CategoryBarChartProps {
  data: CategoryData[];
}

export function CategoryBarChart({ data }: CategoryBarChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analyse Détaillée par Catégorie</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            recettes: { label: "Recettes", color: "#22c55e" },
            depenses: { label: "Dépenses", color: "#ef4444" }
          }}
          className="h-[400px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="horizontal">
              <XAxis type="number" />
              <YAxis type="category" dataKey="category" width={120} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="recettes" fill="#22c55e" />
              <Bar dataKey="depenses" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
