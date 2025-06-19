
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

interface ExpenseData {
  name: string;
  value: number;
}

interface ExpenseDistributionChartProps {
  data: ExpenseData[];
}

export function ExpenseDistributionChart({ data }: ExpenseDistributionChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Répartition des Dépenses</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            value: { label: "Montant", color: "#8884d8" }
          }}
          className="h-[350px]"
        >
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
