'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  CloudUpload, FileArchive, CheckCircle2, Download,
  Loader2, Github, Container, Database, Server
} from 'lucide-react';

export default function DeployPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportComplete, setExportComplete] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setProgress(0);
    setExportComplete(false);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          setExportComplete(true);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 300);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold gradient-text mb-2">Deploy Your Project</h3>
        <p className="text-muted-foreground">Export as a production-ready package or deploy directly to Firebase</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Firebase Deploy */}
        <div className="glass-panel rounded-xl p-6 neon-border hover:border-primary/50 transition-colors cursor-pointer group">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mb-4">
            <CloudUpload className="text-white w-7 h-7" />
          </div>
          <h4 className="text-lg font-semibold mb-2">Deploy to Firebase</h4>
          <p className="text-sm text-muted-foreground mb-4">One-click deployment to Firebase Hosting, Firestore, and Cloud Functions</p>
          <ul className="text-sm text-muted-foreground space-y-2 mb-6">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Automatic SSL</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> CDN Distribution</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Real-time Database</li>
          </ul>
          <button className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors">
            Deploy Now
          </button>
        </div>

        {/* Export ZIP */}
        <div className="glass-panel rounded-xl p-6 neon-border hover:border-purple-500/50 transition-colors cursor-pointer group">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center mb-4">
            <FileArchive className="text-white w-7 h-7" />
          </div>
          <h4 className="text-lg font-semibold mb-2">Export as ZIP</h4>
          <p className="text-sm text-muted-foreground mb-4">Download complete source code with Next.js frontend and Node.js backend</p>
          <ul className="text-sm text-muted-foreground space-y-2 mb-6">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Complete Source Code</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Docker Configuration</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> CI/CD Templates</li>
          </ul>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isExporting ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Download className="w-4 h-4" /> Generate ZIP</>}
          </button>
        </div>
      </div>

      {/* Export Progress */}
      {(isExporting || exportComplete) && (
        <div className="glass-panel rounded-xl p-6 mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span>{exportComplete ? 'Export Complete!' : 'Generating package...'}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 rounded-full bg-accent overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-300", exportComplete ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-cyan-400')}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          {exportComplete && (
            <div className="mt-4 flex gap-2">
              <button className="flex-1 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> Download ZIP
              </button>
            </div>
          )}
        </div>
      )}

      {/* Export Configuration */}
      <div className="glass-panel rounded-xl p-6">
        <h4 className="font-semibold mb-4">Export Configuration</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <label className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 cursor-pointer">
            <input type="checkbox" defaultChecked className="accent-primary w-4 h-4" />
            <div><div className="text-sm font-medium">Frontend</div><div className="text-xs text-muted-foreground">Next.js / React</div></div>
          </label>
          <label className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 cursor-pointer">
            <input type="checkbox" defaultChecked className="accent-primary w-4 h-4" />
            <div><div className="text-sm font-medium">Backend</div><div className="text-xs text-muted-foreground">Node.js / Express</div></div>
          </label>
          <label className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 cursor-pointer">
            <input type="checkbox" className="accent-primary w-4 h-4" />
            <div><div className="text-sm font-medium">Docker</div><div className="text-xs text-muted-foreground">Container config</div></div>
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Project Name</label>
            <input type="text" defaultValue="my-ai-app" className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Environment</label>
            <select className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-primary outline-none">
              <option>Production</option>
              <option>Staging</option>
              <option>Development</option>
            </select>
          </div>
        </div>
      </div>

      {/* Package Structure */}
      <div className="glass-panel rounded-xl p-6 mt-6">
        <h4 className="font-semibold mb-4">Package Structure</h4>
        <div className="bg-card border border-border rounded-lg p-4 font-mono text-sm text-muted-foreground space-y-1">
          <div className="flex items-center gap-2"><Database className="w-4 h-4 text-blue-400" /> <span className="text-foreground">frontend/</span> <span className="text-xs">Next.js React App</span></div>
          <div className="flex items-center gap-2"><Server className="w-4 h-4 text-purple-400" /> <span className="text-foreground">backend/</span> <span className="text-xs">Node.js Express Functions</span></div>
          <div className="flex items-center gap-2"><Github className="w-4 h-4 text-emerald-400" /> <span className="text-foreground">python/</span> <span className="text-xs">Scripts & Dockerfile</span></div>
          <div className="flex items-center gap-2"><Database className="w-4 h-4 text-orange-400" /> <span className="text-foreground">firebase/</span> <span className="text-xs">Security Rules & Configs</span></div>
          <div className="flex items-center gap-2"><Container className="w-4 h-4 text-cyan-400" /> <span className="text-foreground">docker-compose.yml</span></div>
          <div className="flex items-center gap-2"><FileArchive className="w-4 h-4 text-muted-foreground" /> <span className="text-foreground">README.md & SETUP.md</span></div>
        </div>
      </div>
    </div>
  );
}
