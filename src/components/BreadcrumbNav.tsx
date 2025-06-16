
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SidebarTrigger } from '@/components/ui/sidebar';

const routeLabels: Record<string, string> = {
  '/': 'Tableau de Bord',
  '/articles': 'Articles',
  '/beneficiaires': 'Bénéficiaires',
  '/prets': 'Prêts',
  '/donateurs': 'Donateurs',
  '/rapports': 'Rapports',
  '/finances': 'Finances',
  '/gestion': 'Gestion Avancée',
  '/parametres': 'Paramètres',
};

export function BreadcrumbNav() {
  const location = useLocation();
  
  const getPathSegments = () => {
    const path = location.pathname;
    if (path === '/') return [{ path: '/', label: routeLabels['/'] }];
    
    const segments = path.split('/').filter(Boolean);
    const breadcrumbs = [{ path: '/', label: routeLabels['/'] }];
    
    segments.forEach((segment, index) => {
      const segmentPath = '/' + segments.slice(0, index + 1).join('/');
      const label = routeLabels[segmentPath] || segment;
      breadcrumbs.push({ path: segmentPath, label });
    });
    
    return breadcrumbs;
  };

  const pathSegments = getPathSegments();

  return (
    <div className="flex items-center gap-2 p-4 border-b bg-background">
      <SidebarTrigger />
      <Breadcrumb>
        <BreadcrumbList>
          {pathSegments.map((segment, index) => (
            <div key={segment.path} className="flex items-center">
              <BreadcrumbItem>
                {index === pathSegments.length - 1 ? (
                  <BreadcrumbPage>{segment.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={segment.path}>{segment.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < pathSegments.length - 1 && <BreadcrumbSeparator />}
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
