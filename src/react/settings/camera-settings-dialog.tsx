import { useEffect, useState } from 'react';
import { Button } from '@/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/ui/radio-group';
import { Label } from '@/ui/label';

export function CameraSettingsDialog({
  open,
  onOpenChange,
  cameraType,
  onSaveCamera,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cameraType: 'perspective' | 'isometric';
  onSaveCamera: (type: 'perspective' | 'isometric') => void;
}) {
  const [pendingType, setPendingType] = useState<'perspective' | 'isometric'>(cameraType);

  useEffect(() => {
    if (open) setPendingType(cameraType);
  }, [open, cameraType]);

  const handleSave = () => {
    onSaveCamera(pendingType);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] border-none">
        <DialogHeader>
          <DialogTitle>Camera settings</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Label className="font-normal text-muted-foreground mb-3">Select camera mode</Label>
          <RadioGroup
            value={pendingType}
            onValueChange={(val) => setPendingType(val as 'perspective' | 'isometric')}
            className="border rounded-none divide-y gap-0"
          >
            {(['perspective', 'isometric'] as const).map((type) => (
              <div key={type} className="flex items-center space-x-3 p-3">
                <RadioGroupItem value={type} id={type} />
                <Label htmlFor={type} className="font-normal text-base cursor-pointer capitalize">{type}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <DialogFooter className="flex row items-center justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="px-5" onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
