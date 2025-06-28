
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Heart, Home, Package, Users, FileText, DollarSign, Settings, LogOut, BarChart3, UserCheck } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    title: "Tableau de Bord",
    url: "/",
    icon: Home,
  },
  {
    title: "Articles",
    url: "/articles",
    icon: Package,
  },
  {
    title: "Bénéficiaires",
    url: "/beneficiaires",
    icon: Users,
  },
  {
    title: "Prêts",
    url: "/prets",
    icon: FileText,
  },
  {
    title: "Donateurs",
    url: "/donateurs",
    icon: Heart,
  },
  {
    title: "Rapports",
    url: "/rapports",
    icon: BarChart3,
  },
  {
    title: "Finances",
    url: "/finances",
    icon: DollarSign,
  },
  {
    title: "Gestion Avancée",
    url: "/gestion",
    icon: Settings,
  },
  {
    title: "Paramètres",
    url: "/parametres",
    icon: Settings,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { signOut, user, profile } = useAuth();
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-humanitarian-red flex-shrink-0" />
          <span className="font-semibold text-lg truncate">Lending Aid</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {state === "expanded" && <span className="truncate">{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {profile?.role === 'superadmin' && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === '/admin-requests'}
                    tooltip="Demandes d'accès"
                  >
                    <Link to="/admin-requests" className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 flex-shrink-0" />
                      {state === "expanded" && <span className="truncate">Demandes d'accès</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-gray-200 p-4">
        <div className="space-y-2">
          <div className="text-sm text-gray-600 truncate">
            {user?.email}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={signOut}
            className="w-full justify-start"
          >
            <LogOut className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">Se déconnecter</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
