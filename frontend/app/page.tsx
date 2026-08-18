'use client';

import { useStore } from '@/hooks/useStore';
import { 
  LayoutDashboard, 
  Smartphone, 
  Bot, 
  Zap,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const stats = [
  { label: 'Active Workflows', value: '24', change: '+12%', icon: LayoutDashboard, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { label: 'Apps Deployed', value: '7', change: '+8%', icon: Smartphone, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  { label: 'AI Agents', value: '12', change: '+24%', icon: Bot, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { label: 'Executions', value: '48.2K', change: 'This month', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-400/10' },
];

const projects = [
  { name: 'E-Commerce Dashboard', icon: '🛒', status: 'Live', updated: '2 hours ago', color: 'from-blue-500 to-cyan-400' },
  { name: 'Email Automation Flow', icon: '✉️', status: 'Draft', updated: '5 hours ago', color: 'from-purple-500 to-pink-400' },
  { name: 'Customer Support AI', icon: '💬', status: 'Live', updated: '1 day ago', color: 'from-emerald-500 to-teal-400' },
  { name: 'Analytics Pipeline', icon: '📊', status: 'Archived', updated: '2 days ago', color: 'from-orange-500 to-red-400' },
];

const healthMetrics = [
  { label: 'API Latency', value: '42ms', percent: 20, color: 'bg-emerald-500' },
  { label: 'Workflow Success', value: '98.2%', percent: 98, color: 'bg-emerald-500' },
  { label: 'AI Token Usage', value: '72%', percent: 72, color: 'bg-amber-500' },
  { label: 'Storage', value: '45%', percent: 45, color: 'bg-blue-500' },
];

const activities = [
  { text: 'Workflow "Email Automation" executed successfully', time: '2 minutes ago', icon: CheckCircle2, color: 'text-emerald-400' },
  { text: 'New AI agent "Support Bot" deployed to production', time: '15 minutes ago', icon: Bot, color: 'text-blue-400' },
  { text: 'App "E-Commerce" exported as ZIP package', time: '1 hour ago', icon: Activity, color: 'text-cyan-400' },
  { text: 'Integration "Slack" connection refreshed', time: '3 hours ago', icon: AlertCircle, color: 'text-amber-400' },
];

export default function DashboardPage() {
  const { projects: storeProjects } = useStore();

  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-panel rounded-xl p-5 neon-border">
            <div className="flex justify-between items-start mb-3">
              <div className={cn("p-2 rounded-lg", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold">{stat.value}</h3>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Recent Projects</h3>
            <button className="text-sm text-primary hover:text-primary/80">View All</button>
          </div>
          <div className="space-y-3">
            {projects.map((project) => (
              <div
                key={project.name}
                className="flex items-center gap-4 p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors cursor-pointer group"
              >
                <div className={cn("w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-lg", project.color)}>
                  {project.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm group-hover:text-primary transition-colors">{project.name}</h4>
                  <p className="text-xs text-muted-foreground">Last edited {project.updated}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "px-2 py-1 rounded text-xs border",
                    project.status === 'Live' && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                    project.status === 'Draft' && 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                    project.status === 'Archived' && 'bg-muted text-muted-foreground border-border'
                  )}>
                    {project.status}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="glass-panel rounded-xl p-6">
          <h3 className="font-semibold mb-4">System Health</h3>
          <div className="space-y-4">
            {healthMetrics.map((metric) => (
              <div key={metric.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{metric.label}</span>
                  <span className={cn(metric.color.replace('bg-', 'text-'))}>{metric.value}</span>
                </div>
                <div className="h-2 rounded-full bg-accent overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all", metric.color)} style={{ width: `${metric.percent}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <h4 className="text-sm font-medium mb-3">Recent Activity</h4>
            <div className="space-y-3">
              {activities.map((activity, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <activity.icon className={cn("w-4 h-4 mt-0.5 shrink-0", activity.color)} />
                  <div>
                    <p className="text-muted-foreground">{activity.text}</p>
                    <p className="text-xs text-muted-foreground/60">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
