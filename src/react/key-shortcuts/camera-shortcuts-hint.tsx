import { Button } from '@/ui/button';
import type { DeltakitViewName } from '@/react/events';

const VIEW_CONFIGS: { label: string; key: string; view: DeltakitViewName }[] = [
  { label: 'Top (+Z)', key: '1', view: 'Top' },
  { label: 'Bottom (-Z)', key: '2', view: 'Bottom' },
  { label: 'Front (+X)', key: '3', view: 'Front' },
  { label: 'Back (-X)', key: '4', view: 'Back' },
  { label: 'Right (+Y)', key: '5', view: 'Right' },
  { label: 'Left (-Y)', key: '6', view: 'Left' },
];

export function CameraShortcutsHint() {
  const handleSelect = (view: DeltakitViewName) => {
    window.dispatchEvent(new CustomEvent('deltakit-change-view', { detail: { view } }));
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-1.5 p-2 border bg-white/80 backdrop-blur-sm shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="px-2 whitespace-nowrap text-xs font-normal text-black border-r mr-1">
        Camera Views
      </div>
      {VIEW_CONFIGS.map((config) => (
        <Button
          key={config.view}
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs gap-1.5 hover:bg-primary/5 hover:text-primary transition-colors"
          onClick={() => handleSelect(config.view)}
        >
          <span className="font-mono bg-muted px-1 text-[10px]">{config.key}</span>
          {config.label}
        </Button>
      ))}
    </div>
  );
}
