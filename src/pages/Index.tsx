
import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Dashboard } from '@/components/Dashboard';
import { NotificationCenter } from '@/components/NotificationCenter';
import { BreadcrumbNav } from '@/components/BreadcrumbNav';

export default function Index() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <BreadcrumbNav />
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Dashboard />
            </div>
            <div>
              <NotificationCenter />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
