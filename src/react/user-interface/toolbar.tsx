import * as React from 'react';
import { MousePointer2, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToolId = 'select' | 'surface-code';

interface Tool {
  id: ToolId;
  label: string;
  shortcut: string;
  icon: React.ReactNode;
}

const TOOLS: Tool[] = [
  { id: 'select', label: 'Select', shortcut: 'V', icon: <MousePointer2 className="h-4 w-4" /> },
  { id: 'surface-code', label: 'Surface Code', shortcut: 'S', icon: <LayoutGrid className="h-4 w-4" /> },
];

interface ToolbarProps {
  activeTool: ToolId;
  onToolChange: (tool: ToolId) => void;
}

export function Toolbar({ activeTool, onToolChange }: ToolbarProps) {
  const handleClick = (toolId: ToolId) => {
    // Clicking the active tool again deselects it (back to select)
    onToolChange(toolId === activeTool && toolId !== 'select' ? 'select' : toolId);
  };

  return (
    <div className="flex flex-col border border-border bg-background shadow-sm">
      {TOOLS.map((tool, idx) => (
        <React.Fragment key={tool.id}>
          {idx > 0 && <div className="h-px bg-border" />}
          <button
            onClick={() => handleClick(tool.id)}
            className={cn(
              'flex h-8 w-8 items-center justify-center transition-colors',
              activeTool === tool.id
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
            aria-label={tool.label}
            aria-pressed={activeTool === tool.id}
            title={`${tool.label} (${tool.shortcut})`}
          >
            {tool.icon}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}
