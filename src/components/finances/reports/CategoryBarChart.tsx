
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
            {/* Use vertical layout so categories are on the Y axis */}
            <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
              <XAxis type="number" />
              <YAxis type="category" dataKey="category" width={160} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="recettes" fill="#22c55e" />
              <Bar dataKey="depenses" fill="#ef4444" />
            </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
