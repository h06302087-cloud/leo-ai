'use client';

import { useStore } from '@/hooks/useStore';
import { cn } from '@/lib/utils';
import { Bell, Search, Plus, Command } from 'lucide-react';

export default function Header() {
  const { sidebarOpen, currentProject } = useStore();

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 h-16 bg-background/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-6 transition-all duration-300',
        sidebarOpen ? 'left-64' : 'left-16'
      )}
    >
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold">
          {currentProject?.name || 'Dashboard'}
        </h1>
        <span className="px-2 py-0.5 rounded text-xs bg-primary/10 text-primary border border-primary/20">
          Beta
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="w-64 pl-9 pr-4 py-2 rounded-lg bg-card border border-border text-sm focus:outline-none focus:border-primary transition-colors"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-accent px-1.5 rounded hidden md:block">
            <Command className="w-3 h-3 inline" /> K
          </kbd>
        </div>

        <button className="relative p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <button className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>
    </header>
  );
}
