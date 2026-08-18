'use client';

import { useState, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { cn } from '@/lib/utils';
import { 
  Type, MousePointer, LayoutGrid, CreditCard, 
  List, BarChart3, Maximize2, FormInput, 
  ChevronDown, Trash2, Eye, Monitor, Tablet, Smartphone
} from 'lucide-react';

const COMPONENT_TYPES = [
  { type: 'container', label: 'Container', icon: LayoutGrid, category: 'Layout' },
  { type: 'grid', label: 'Grid', icon: LayoutGrid, category: 'Layout' },
  { type: 'card', label: 'Card', icon: CreditCard, category: 'Layout' },
  { type: 'input', label: 'Text Input', icon: Type, category: 'Form' },
  { type: 'button', label: 'Button', icon: MousePointer, category: 'Form' },
  { type: 'select', label: 'Dropdown', icon: ChevronDown, category: 'Form' },
  { type: 'table', label: 'Data Table', icon: List, category: 'Data' },
  { type: 'chart', label: 'Chart', icon: BarChart3, category: 'Data' },
  { type: 'modal', label: 'Modal', icon: Maximize2, category: 'Layout' },
  { type: 'form', label: 'Form', icon: FormInput, category: 'Form' },
];

interface CanvasComponent {
  id: string;
  type: string;
  x: number;
  y: number;
  props: Record<string, unknown>;
}

function PaletteItem({ type, label, icon: Icon }: { type: string; label: string; icon: React.ElementType }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'component',
    item: { type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={cn(
        'p-3 bg-card border border-border rounded-lg cursor-grab flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all',
        isDragging && 'opacity-50'
      )}
    >
      <Icon className="w-4 h-4 text-primary" />
      {label}
    </div>
  );
}

function Canvas({ components, onDrop, onSelect, selectedId, onDelete }: {
  components: CanvasComponent[];
  onDrop: (item: { type: string }, offset: { x: number; y: number }) => void;
  onSelect: (id: string | null) => void;
  selectedId: string | null;
  onDelete: (id: string) => void;
}) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'component',
    drop: (item: { type: string }, monitor) => {
      const offset = monitor.getClientOffset();
      if (offset) {
        const canvasRect = document.getElementById('app-canvas')?.getBoundingClientRect();
        if (canvasRect) {
          onDrop(item, { x: offset.x - canvasRect.left, y: offset.y - canvasRect.top });
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      id="app-canvas"
      ref={drop}
      className={cn(
        'flex-1 bg-background rounded-xl border-2 border-dashed border-border relative overflow-hidden min-h-[500px]',
        isOver && 'border-primary/50 bg-primary/5'
      )}
      onClick={() => onSelect(null)}
    >
      {components.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <LayoutGrid className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
            <p>Drag and drop components here</p>
            <p className="text-xs mt-1">Build your app visually</p>
          </div>
        </div>
      )}
      {components.map((comp) => (
        <div
          key={comp.id}
          className={cn(
            'absolute p-4 rounded-lg bg-card border cursor-pointer hover:border-primary/50 transition-all',
            selectedId === comp.id ? 'border-primary ring-2 ring-primary/20' : 'border-border'
          )}
          style={{ left: comp.x, top: comp.y }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(comp.id);
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium uppercase text-muted-foreground">{comp.type}</span>
            {selectedId === comp.id && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(comp.id);
                }}
                className="p-1 rounded hover:bg-destructive/20 text-destructive"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
          <ComponentPreview type={comp.type} props={comp.props} />
        </div>
      ))}
    </div>
  );
}

function ComponentPreview({ type, props }: { type: string; props: Record<string, unknown> }) {
  switch (type) {
    case 'input':
      return <input type="text" placeholder={props.placeholder as string || 'Enter text...'} className="w-48 px-3 py-2 rounded bg-background border border-border text-sm" readOnly />;
    case 'button':
      return <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">{props.label as string || 'Button'}</button>;
    case 'card':
      return <div className="w-48 p-3 rounded-lg bg-accent border border-border"><h4 className="font-medium text-sm">{props.title as string || 'Card Title'}</h4><p className="text-xs text-muted-foreground mt-1">Card content</p></div>;
    case 'table':
      return <div className="w-56"><table className="w-full text-xs"><thead><tr className="border-b border-border"><th className="text-left py-1 text-muted-foreground">Name</th><th className="text-left py-1 text-muted-foreground">Status</th></tr></thead><tbody><tr><td className="py-1">Item 1</td><td className="py-1"><span className="text-emerald-400">Active</span></td></tr></tbody></table></div>;
    case 'chart':
      return <div className="w-32 h-16 flex items-end gap-1"><div className="flex-1 bg-primary/60 rounded-t" style={{height:'60%'}} /><div className="flex-1 bg-primary/80 rounded-t" style={{height:'80%'}} /><div className="flex-1 bg-primary rounded-t" style={{height:'45%'}} /></div>;
    default:
      return <div className="w-32 h-16 border-2 border-dashed border-border rounded flex items-center justify-center text-xs text-muted-foreground">{type}</div>;
  }
}

function PropertiesPanel({ component, onUpdate }: { component: CanvasComponent | null; onUpdate: (id: string, props: Record<string, unknown>) => void }) {
  if (!component) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <MousePointer className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
        <p className="text-sm">Select a component to edit properties</p>
      </div>
    );
  }

  const handleChange = (key: string, value: unknown) => {
    onUpdate(component.id, { ...component.props, [key]: value });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm capitalize">{component.type} Properties</h3>

      {component.type === 'input' && (
        <>
          <div><label className="text-xs text-muted-foreground uppercase">Label</label><input type="text" value={(component.props.label as string) || ''} onChange={(e) => handleChange('label', e.target.value)} className="w-full mt-1 px-3 py-2 rounded bg-background border border-border text-sm focus:border-primary outline-none" /></div>
          <div><label className="text-xs text-muted-foreground uppercase">Placeholder</label><input type="text" value={(component.props.placeholder as string) || ''} onChange={(e) => handleChange('placeholder', e.target.value)} className="w-full mt-1 px-3 py-2 rounded bg-background border border-border text-sm focus:border-primary outline-none" /></div>
        </>
      )}

      {component.type === 'button' && (
        <>
          <div><label className="text-xs text-muted-foreground uppercase">Label</label><input type="text" value={(component.props.label as string) || ''} onChange={(e) => handleChange('label', e.target.value)} className="w-full mt-1 px-3 py-2 rounded bg-background border border-border text-sm focus:border-primary outline-none" /></div>
          <div><label className="text-xs text-muted-foreground uppercase">Variant</label><select value={(component.props.variant as string) || 'primary'} onChange={(e) => handleChange('variant', e.target.value)} className="w-full mt-1 px-3 py-2 rounded bg-background border border-border text-sm focus:border-primary outline-none"><option>primary</option><option>secondary</option><option>ghost</option></select></div>
        </>
      )}

      {component.type === 'card' && (
        <>
          <div><label className="text-xs text-muted-foreground uppercase">Title</label><input type="text" value={(component.props.title as string) || ''} onChange={(e) => handleChange('title', e.target.value)} className="w-full mt-1 px-3 py-2 rounded bg-background border border-border text-sm focus:border-primary outline-none" /></div>
          <div><label className="text-xs text-muted-foreground uppercase">Content</label><textarea value={(component.props.content as string) || ''} onChange={(e) => handleChange('content', e.target.value)} className="w-full mt-1 px-3 py-2 rounded bg-background border border-border text-sm focus:border-primary outline-none h-20 resize-none" /></div>
        </>
      )}

      <div><label className="text-xs text-muted-foreground uppercase">Data Binding</label><input type="text" placeholder="e.g., users_collection" value={(component.props.binding as string) || ''} onChange={(e) => handleChange('binding', e.target.value)} className="w-full mt-1 px-3 py-2 rounded bg-background border border-border text-sm focus:border-primary outline-none" /></div>
    </div>
  );
}

export default function BuilderPage() {
  const [components, setComponents] = useState<CanvasComponent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const handleDrop = useCallback((item: { type: string }, offset: { x: number; y: number }) => {
    const newComp: CanvasComponent = {
      id: `comp_${Date.now()}`,
      type: item.type,
      x: offset.x - 50,
      y: offset.y - 20,
      props: {},
    };
    setComponents((prev) => [...prev, newComp]);
    setSelectedId(newComp.id);
  }, []);

  const handleUpdate = useCallback((id: string, props: Record<string, unknown>) => {
    setComponents((prev) => prev.map((c) => (c.id === id ? { ...c, props } : c)));
  }, []);

  const handleDelete = useCallback((id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
    setSelectedId(null);
  }, []);

  const selectedComponent = components.find((c) => c.id === selectedId) || null;

  const viewWidth = viewMode === 'desktop' ? '100%' : viewMode === 'tablet' ? '768px' : '375px';

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-[calc(100vh-4rem)] flex">
        {/* Components Panel */}
        <div className="w-64 bg-card border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-sm">Components</h3>
            <input type="text" placeholder="Search..." className="mt-2 w-full px-3 py-1.5 rounded-lg bg-background border border-border text-sm focus:border-primary outline-none" />
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {['Layout', 'Form', 'Data'].map((cat) => (
              <div key={cat}>
                <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">{cat}</div>
                <div className="space-y-1">
                  {COMPONENT_TYPES.filter((c) => c.category === cat).map((c) => (
                    <PaletteItem key={c.type} type={c.type} label={c.label} icon={c.icon} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 flex flex-col p-4 gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 bg-card rounded-lg p-1 border border-border">
              <button onClick={() => setViewMode('desktop')} className={cn("p-2 rounded-md transition-colors", viewMode === 'desktop' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground')}><Monitor className="w-4 h-4" /></button>
              <button onClick={() => setViewMode('tablet')} className={cn("p-2 rounded-md transition-colors", viewMode === 'tablet' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground')}><Tablet className="w-4 h-4" /></button>
              <button onClick={() => setViewMode('mobile')} className={cn("p-2 rounded-md transition-colors", viewMode === 'mobile' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground')}><Smartphone className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setComponents([])} className="px-3 py-1.5 rounded-lg bg-card border border-border hover:bg-accent text-sm transition-colors flex items-center gap-2"><Trash2 className="w-4 h-4" /> Clear</button>
              <button className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm transition-colors flex items-center gap-2"><Eye className="w-4 h-4" /> Preview</button>
            </div>
          </div>
          <div className="flex-1 flex justify-center overflow-auto">
            <div style={{ width: viewWidth, maxWidth: '100%' }} className="h-full">
              <Canvas components={components} onDrop={handleDrop} onSelect={setSelectedId} selectedId={selectedId} onDelete={handleDelete} />
            </div>
          </div>
        </div>

        {/* Properties Panel */}
        <div className="w-72 bg-card border-l border-border flex flex-col">
          <div className="p-4 border-b border-border"><h3 className="font-semibold text-sm">Properties</h3></div>
          <div className="flex-1 overflow-y-auto p-4">
            <PropertiesPanel component={selectedComponent} onUpdate={handleUpdate} />
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
