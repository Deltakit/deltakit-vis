import { useEffect, useState } from 'react';
import { Button } from '@/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/ui/radio-group';
import { Label } from '@/ui/label';
import { STANDARD_PALETTE, ACCESSIBLE_PALETTE, BW_PALETTE } from '@/config/colours';
import type { ColorProfile } from '@/types/three';

const toHexStr = (num: number) => `#${num.toString(16).padStart(6, '0').toUpperCase()}`;

export function ColorSettingsDialog({
  open,
  onOpenChange,
  colorProfile,
  onSaveProfile,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  colorProfile: ColorProfile;
  onSaveProfile: (profile: ColorProfile) => void;
}) {
  const [pendingSelection, setPendingSelection] = useState<ColorProfile>(colorProfile);

  useEffect(() => {
    if (open) setPendingSelection(colorProfile);
  }, [open, colorProfile]);

  const handleSave = () => {
    onSaveProfile(pendingSelection);
    onOpenChange(false);
  };

  const standardColors = [STANDARD_PALETTE.RED, STANDARD_PALETTE.GREEN, STANDARD_PALETTE.BLUE, STANDARD_PALETTE.YELLOW].map(toHexStr);
  const accessibleColors = [ACCESSIBLE_PALETTE.RED, ACCESSIBLE_PALETTE.GREEN, ACCESSIBLE_PALETTE.BLUE, ACCESSIBLE_PALETTE.YELLOW].map(toHexStr);
  const bwColors = [BW_PALETTE.RED, BW_PALETTE.GREEN, BW_PALETTE.BLUE, BW_PALETTE.YELLOW].map(toHexStr);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] border-none">
        <DialogHeader>
          <DialogTitle>Colour profile</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Label className="font-normal text-muted-foreground mb-3">Select preset</Label>
          <RadioGroup
            value={pendingSelection}
            onValueChange={(val: ColorProfile) => setPendingSelection(val)}
            className="border rounded-none gap-0 divide-y"
          >
            {[
              { value: 'standard' as ColorProfile, label: 'Standard', colors: standardColors },
              { value: 'accessible' as ColorProfile, label: 'Accessible', colors: accessibleColors },
              { value: 'bw' as ColorProfile, label: 'Black & White', colors: bwColors },
            ].map(({ value, label, colors }) => (
              <div key={value} className="flex items-center gap-3 p-3 hover:bg-slate-50">
                <RadioGroupItem value={value} id={value} />
                <Label htmlFor={value} className="flex justify-between items-center w-full cursor-pointer">
                  <span className="font-normal">{label}</span>
                  <div className="flex gap-1.5">
                    {colors.map((hex, i) => (
                      <div key={i} className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: hex }} />
                    ))}
                  </div>
                </Label>
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
