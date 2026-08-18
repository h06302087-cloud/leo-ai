'use client';

import { cn } from '@/lib/utils';
import { 
  Slack, CreditCard, Mail, Google, MessageCircle,
  Plus, Trash2, Settings, CheckCircle2, XCircle
} from 'lucide-react';

const INTEGRATIONS = [
  { id: 'slack', name: 'Slack', icon: Slack, status: 'connected', detail: 'Workspace: acme-corp', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { id: 'stripe', name: 'Stripe', icon: CreditCard, status: 'connected', detail: 'Mode: Live', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { id: 'sendgrid', name: 'SendGrid', icon: Mail, status: 'disconnected', detail: 'Email service provider', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { id: 'gsheets', name: 'Google Sheets', icon: Google, status: 'connected', detail: 'Account: john@acme.com', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  { id: 'discord', name: 'Discord', icon: MessageCircle, status: 'disconnected', detail: 'Webhook notifications', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
];

export default function IntegrationsPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h3 className="text-2xl font-bold gradient-text mb-2">Connected Services</h3>
        <p className="text-muted-foreground">Manage your third-party integrations and API connections</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {INTEGRATIONS.map((integration) => (
          <div
            key={integration.id}
            className={cn(
              'glass-panel rounded-xl p-5 transition-colors hover:border-opacity-50',
              integration.status === 'connected' ? 'hover:border-emerald-500/30' : 'hover:border-primary/30'
            )}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", integration.bg)}>
                <integration.icon className={cn("w-6 h-6", integration.color)} />
              </div>
              <span className={cn(
                "px-2 py-1 rounded text-xs border flex items-center gap-1",
                integration.status === 'connected' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-muted text-muted-foreground border-border'
              )}>
                {integration.status === 'connected' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {integration.status === 'connected' ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <h4 className="font-semibold">{integration.name}</h4>
            <p className="text-sm text-muted-foreground mb-4">{integration.detail}</p>
            <div className="flex gap-2">
              {integration.status === 'connected' ? (
                <>
                  <button className="flex-1 px-3 py-1.5 rounded-lg bg-card border border-border hover:bg-accent text-sm transition-colors flex items-center justify-center gap-2">
                    <Settings className="w-3.5 h-3.5" /> Configure
                  </button>
                  <button className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 text-sm transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <button className="flex-1 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm transition-colors">
                  Connect
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Add Integration Card */}
        <button className="glass-panel rounded-xl p-5 border-dashed border-2 border-border hover:border-primary/30 transition-colors flex flex-col items-center justify-center text-center min-h-[200px] group">
          <div className="w-12 h-12 rounded-xl bg-card flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
            <Plus className="text-muted-foreground group-hover:text-primary w-6 h-6 transition-colors" />
          </div>
          <h4 className="font-semibold text-muted-foreground group-hover:text-foreground">Add Integration</h4>
          <p className="text-sm text-muted-foreground mt-1">Browse 100+ connectors</p>
        </button>
      </div>
    </div>
  );
}
