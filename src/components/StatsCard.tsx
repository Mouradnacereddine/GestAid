
import React, { memo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

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
    <Card className="hover:shadow-md transition-shadow duration-300 ease-in-out animate-fade-in">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-grow pr-4">
            <p className="text-sm font-medium text-gray-500 truncate">
              {title}
            </p>
            <p className="text-3xl font-bold text-gray-800 mt-1">
              {value}
            </p>
          </div>
          <div className="p-3 rounded-full bg-gray-100 flex-shrink-0">
            <Icon className="h-6 w-6 text-gray-600" />
          </div>
        </div>
        <div className="flex items-center mt-4">
          {trend ? (
            <>
              <span className={`flex items-center text-sm font-semibold ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {trend.isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                {Math.abs(trend.value)}%
              </span>
              <span className="text-sm text-gray-500 ml-2 truncate">
                {description}
              </span>
            </>
          ) : (
            <p className="text-sm text-gray-500 truncate">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Mémoriser le composant pour éviter les re-renders inutiles
export const StatsCard = memo(StatsCardComponent);
