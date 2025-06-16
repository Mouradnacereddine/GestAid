
import React, { memo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatsCardComponent({ title, value, description, icon: Icon, trend }: StatsCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 animate-fade-in">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">
              {title}
            </p>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {value}
            </p>
            <div className="flex items-center">
              {trend ? (
                <>
                  <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    {description}
                  </span>
                </>
              ) : (
                <span className="text-sm text-gray-500">
                  {description}
                </span>
              )}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-blue-50">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Mémoriser le composant pour éviter les re-renders inutiles
export const StatsCard = memo(StatsCardComponent);
