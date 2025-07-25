
import React from 'react';
import { Dashboard } from '@/components/Dashboard';
import { NotificationCenter } from '@/components/NotificationCenter';

export default function Index() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Dashboard />
      </div>
      <div>
        <NotificationCenter />
      </div>
    </div>
  );
}
