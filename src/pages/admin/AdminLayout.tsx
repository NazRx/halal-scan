import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileCheck, 
  Users, 
  BarChart3, 
  Database,
  ChevronLeft,
  Shield,
  MessageSquare,
  Beaker,
  PanelLeftClose,
  PanelLeft,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

const navItems = [
  { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { title: 'Verdicts', href: '/admin/verdicts', icon: FileCheck },
  { title: 'Users', href: '/admin/users', icon: Users },
  { title: 'Feedback', href: '/admin/feedback', icon: MessageSquare },
  { title: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { title: 'Seed Data', href: '/admin/seed-data', icon: Database },
  { title: 'Ingest Debug', href: '/admin/ingest-debug', icon: Beaker },
  { title: 'Hydrate Labels', href: '/admin/hydrate-label', icon: Beaker },
];

export default function AdminLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();

  const NavContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <nav className="flex-1 p-2 space-y-1">
      {navItems.map((item) => {
        const isActive = location.pathname === item.href || 
          (item.href !== '/admin' && location.pathname.startsWith(item.href));
        
        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={onItemClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );

  // Mobile layout with drawer
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col bg-muted/30 w-full">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 bg-card border-b px-4 py-3 flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setMobileOpen(true)}
            className="h-9 w-9"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-semibold">Admin Panel</span>
        </header>

        {/* Mobile Drawer */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Admin Panel
              </SheetTitle>
            </SheetHeader>
            <NavContent onItemClick={() => setMobileOpen(false)} />
            <div className="p-2 border-t">
              <Button variant="ghost" size="sm" asChild className="w-full justify-start">
                <Link to="/app" onClick={() => setMobileOpen(false)}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to App
                </Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Content - Mobile */}
        <main className="flex-1 p-4 overflow-auto">
          <Outlet />
        </main>
      </div>
    );
  }

  // Desktop layout with collapsible sidebar
  return (
    <TooltipProvider delayDuration={0}>
      <div className="min-h-screen flex bg-muted/30 w-full">
        {/* Sidebar */}
        <aside 
          className={cn(
            "bg-card border-r flex flex-col transition-all duration-300 ease-in-out",
            collapsed ? "w-16" : "w-64"
          )}
        >
          <div className="p-4 border-b flex items-center justify-between">
            <div className={cn(
              "flex items-center gap-2 overflow-hidden transition-all duration-300",
              collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}>
              <Shield className="h-6 w-6 text-primary flex-shrink-0" />
              <span className="font-semibold text-lg whitespace-nowrap">Admin Panel</span>
            </div>
            {collapsed && (
              <Shield className="h-6 w-6 text-primary mx-auto" />
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                "h-8 w-8 flex-shrink-0 transition-all",
                collapsed && "mx-auto"
              )}
            >
              {collapsed ? (
                <PanelLeft className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>
          </div>

          <nav className="flex-1 p-2 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href !== '/admin' && location.pathname.startsWith(item.href));
              
              const linkContent = (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && <span className="truncate">{item.title}</span>}
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      {linkContent}
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={8}>
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return linkContent;
            })}
          </nav>

          <div className="p-2 border-t">
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" asChild className="w-full">
                    <Link to="/app">
                      <ChevronLeft className="h-4 w-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  Back to App
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button variant="ghost" size="sm" asChild className="w-full justify-start">
                <Link to="/app">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to App
                </Link>
              </Button>
            )}
          </div>
        </aside>

        {/* Main Content - Desktop */}
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </TooltipProvider>
  );
}
