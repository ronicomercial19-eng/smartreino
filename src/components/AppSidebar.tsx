
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Dumbbell, 
  Database, 
  Upload, 
  BookOpen, 
  MessageSquare, 
  Settings, 
  Users, 
  GraduationCap,
  ChevronDown,
  BarChart3,
  Target,
  TrendingUp
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

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Modelos de Treino",
    icon: Dumbbell,
    items: [
      {
        title: "Visualizar Modelos",
        url: "/workout-models",
      },
      {
        title: "Base de Dados",
        url: "/workout-models-database",
      },
    ],
  },
  {
    title: "Meus Treinos",
    url: "/meus-treinos",
    icon: Target,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: TrendingUp,
  },
  {
    title: "Periodização",
    icon: BarChart3,
    items: [
      {
        title: "Upload de Periodização",
        url: "/periodization-upload",
      },
    ],
  },
  {
    title: "Exercícios",
    url: "/exercise-library",
    icon: BookOpen,
  },
  {
    title: "IA & Chat",
    icon: MessageSquare,
    items: [
      {
        title: "Chat IA",
        url: "/ai-chat",
      },
      {
        title: "Configurações IA",
        url: "/ai-config",
      },
    ],
  },
  {
    title: "Gestão de Alunos",
    url: "/gerenciamento-alunos",
    icon: Users,
  },
  {
    title: "Configurações",
    url: "/settings",
    icon: Settings,
  },
  {
    title: "Roadmap",
    url: "/roadmap",
    icon: Target,
  },
  {
    title: "Interface Aluno",
    url: "/student-interface",
    icon: GraduationCap,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<string[]>(["Modelos de Treino", "IA & Chat"]);

  const isCollapsed = state === "collapsed";
  
  const isActive = (path: string) => location.pathname === path;
  
  const isGroupActive = (items: any[]) => 
    items?.some(item => isActive(item.url));

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
                          <SidebarMenuButton className={getNavClassName(isGroupActive(item.items))}>
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
                              {item.items.map((subItem) => (
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
      </SidebarContent>
    </Sidebar>
  );
}
