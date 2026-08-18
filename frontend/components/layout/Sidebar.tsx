'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/hooks/useStore';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Layers,
  GitBranch,
  Bot,
  Plug,
  Rocket,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/builder', icon: Layers, label: 'App Builder' },
  { href: '/workflow', icon: GitBranch, label: 'Workflows' },
  { href: '/agents', icon: Bot, label: 'AI Agents' },
  { href: '/integrations', icon: Plug, label: 'Integrations' },
  { href: '/deploy', icon: Rocket, label: 'Deploy' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, user } = useStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300 flex flex-col',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          {sidebarOpen && (
            <span className="font-display font-bold text-lg gradient-text whitespace-nowrap">
              Leo AI
            </span>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-md hover:bg-accent text-muted-foreground shrink-0"
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary/10 text-primary border-l-2 border-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                !sidebarOpen && 'justify-center px-2'
              )}
              title={!sidebarOpen ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-all',
            !sidebarOpen && 'justify-center px-2'
          )}
        >
          <Settings className="w-5 h-5 shrink-0" />
          {sidebarOpen && <span>Settings</span>}
        </Link>
        {user && sidebarOpen && (
          <div className="mt-3 p-3 rounded-lg bg-accent/50 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                {user.name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.subscription} Plan</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
