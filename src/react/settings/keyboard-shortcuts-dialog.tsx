import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/ui/dialog';
import { Label } from '@/ui/label';

const ShortcutRow = ({ label, keys }: { label: string; keys: string[] }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm text-foreground">{label}</span>
    <div className="flex items-center gap-1">
      {keys.map((key, i) => (
        <span key={key} className="flex items-center gap-1">
          <kbd className="min-w-[24px] h-6 flex items-center justify-center px-2 py-1 text-xs font-sans font-normal text-black bg-primary/10 rounded-xs">
            {key}
          </kbd>
          {i < keys.length - 1 && <span className="text-muted-foreground text-xs">+</span>}
        </span>
      ))}
    </div>
  </div>
);

const shortcuts = [
  { label: 'Top (+Z)', keys: ['C', '1'] },
  { label: 'Bottom (-Z)', keys: ['C', '2'] },
  { label: 'Front (+X)', keys: ['C', '3'] },
  { label: 'Back (-X)', keys: ['C', '4'] },
  { label: 'Right (+Y)', keys: ['C', '5'] },
  { label: 'Left (-Y)', keys: ['C', '6'] },
  { label: 'Reset camera', keys: ['R'] },
];

export function KeyboardShortcutsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] border-none">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
        </DialogHeader>
        <div className="py-0 mt-4">
          <Label className="font-normal text-muted-foreground mb-3">Camera</Label>
          <div className="divide-y border-t">
            {shortcuts.map((s) => (
              <ShortcutRow key={s.label} label={s.label} keys={s.keys} />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
