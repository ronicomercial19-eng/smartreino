
import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Dumbbell, 
  BookOpen, 
  MessageSquare, 
  Settings, 
  Users, 
  GraduationCap,
  ChevronDown,
  BarChart3,
  Target,
  TrendingUp,
  Zap,
  LogOut
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";

type NavItem = {
  title: string;
  url?: string;
  icon: any;
  /** Roles that can see this item. undefined = all non-student roles */
  roles?: string[];
  items?: { title: string; url: string; roles?: string[] }[];
};

const allNavigationItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Gestão de Alunos",
    url: "/gerenciamento-alunos",
    icon: Users,
  },
  {
    title: "Treinos",
    icon: Dumbbell,
    items: [
      { title: "Smart Treino Builder", url: "/smart-treino-builder" },
      { title: "Catálogo 9x9x9", url: "/protocol-catalog" },
      { title: "Gerar Treino", url: "/workout-models" },
      { title: "Plano Periodizado", url: "/periodization-upload" },
      { title: "Meus Treinos", url: "/meus-treinos" },
      { title: "Base de Modelos", url: "/workout-models-database" },
    ],
  },
  {
    title: "Exercícios",
    url: "/exercise-library",
    icon: BookOpen,
  },
  {
    title: "Analytics",
    icon: TrendingUp,
    items: [
      { title: "Por Aluno", url: "/student-analytics" },
      { title: "Visão Geral", url: "/analytics", roles: ["admin"] },
      { title: "Avançado", url: "/advanced-statistics", roles: ["admin"] },
    ],
  },
  {
    title: "Chat IA",
    url: "/ai-chat",
    icon: MessageSquare,
  },
  {
    title: "Configurações",
    url: "/settings",
    icon: Settings,
  },
  {
    title: "Interface Aluno",
    url: "/student-interface",
    icon: GraduationCap,
  },
  {
    title: "Admin",
    icon: BarChart3,
    roles: ["admin"],
    items: [
      { title: "Config IA", url: "/ai-config" },
      { title: "Roadmap", url: "/roadmap" },
    ],
  },
];

function filterNavForRole(items: NavItem[], role: string | null): NavItem[] {
  if (!role) return [];
  
  return items.reduce<NavItem[]>((acc, item) => {
    // Check top-level role restriction
    if (item.roles && !item.roles.includes(role)) return acc;

    if (item.items) {
      const filteredSubs = item.items.filter(
        sub => !sub.roles || sub.roles.includes(role)
      );
      if (filteredSubs.length > 0) {
        acc.push({ ...item, items: filteredSubs });
      }
    } else {
      acc.push(item);
    }
    return acc;
  }, []);
}

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<string[]>(["Treinos"]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
  }, []);

  const { role, isAdmin } = useUserRole(userId);

  // Admin sees everything, professor sees filtered, student doesn't use sidebar
  const effectiveRole = isAdmin ? 'admin' : (role === 'professor' || role === 'trainer' as any ? 'professor' : role);
  const navigationItems = filterNavForRole(allNavigationItems, effectiveRole || 'professor');

  const isCollapsed = state === "collapsed";
  
  const isActive = (path: string) => location.pathname === path;
  
  const isGroupActive = (items: any[]) => 
    items?.some((item: any) => isActive(item.url));

  const toggleGroup = (title: string) => {
    setOpenGroups(prev => 
      prev.includes(title) 
        ? prev.filter(group => group !== title)
        : [...prev, title]
    );
  };

  const getNavClassName = (isActiveLink: boolean) => 
    isActiveLink 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
      : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground";

  return (
    <Sidebar collapsible="icon" className={isCollapsed ? "w-14" : "w-64"}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-primary font-heading font-bold text-base py-4">
            {!isCollapsed ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg font-bold">9</span>
                </div>
                <span className="gradient-text text-xl">9FIT</span>
              </div>
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mx-auto">
                <span className="text-white text-lg font-bold">9</span>
              </div>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const hasSubItems = item.items && item.items.length > 0;
                const isGroupOpen = openGroups.includes(item.title);
                
                if (hasSubItems) {
                  return (
                    <Collapsible
                      key={item.title}
                      open={isGroupOpen && !isCollapsed}
                      onOpenChange={() => toggleGroup(item.title)}
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className={getNavClassName(isGroupActive(item.items!))}>
                            <item.icon className="h-4 w-4" />
                            {!isCollapsed && (
                              <>
                                <span>{item.title}</span>
                                <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${isGroupOpen ? 'rotate-180' : ''}`} />
                              </>
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        {!isCollapsed && (
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.items!.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton asChild isActive={isActive(subItem.url)}>
                                    <NavLink to={subItem.url} className={getNavClassName(isActive(subItem.url))}>
                                      <span>{subItem.title}</span>
                                    </NavLink>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        )}
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url!} className={getNavClassName(isActive(item.url!))}>
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout button */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={async () => {
                    try {
                      await supabase.auth.signOut({ scope: 'local' });
                    } catch (e) {
                      console.warn('signOut warning:', e);
                    }
                    try { localStorage.clear(); } catch {}
                    window.location.href = '/login';
                  }}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  {!isCollapsed && <span>Sair</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
