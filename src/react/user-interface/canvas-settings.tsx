import * as React from 'react';
import { Settings2, Keyboard, Camera, Palette } from 'lucide-react';
import type { ColorProfile } from '@/types/three';
import { Button } from '@/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu';
import { ColorSettingsDialog } from '@/react/settings/color-settings-dialog';
import { CameraSettingsDialog } from '@/react/settings/camera-settings-dialog';
import { KeyboardShortcutsDialog } from '@/react/settings/keyboard-shortcuts-dialog';

interface CanvasSettingsProps {
  showCoordinate: boolean;
  setShowCoordinate: (val: boolean) => void;
  showGrid: boolean;
  setShowGrid: (val: boolean) => void;
  colorProfile: ColorProfile;
  onSaveProfile: (profile: ColorProfile) => void;
  cameraType: 'perspective' | 'isometric';
  onSaveCamera: (type: 'perspective' | 'isometric') => void;
}

export function CanvasSettings({
  showCoordinate, setShowCoordinate,
  showGrid, setShowGrid,
  colorProfile, onSaveProfile,
  cameraType, onSaveCamera,
}: CanvasSettingsProps) {
  const [activeDialog, setActiveDialog] = React.useState<'color' | 'camera' | 'shortcuts' | null>(null);

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon-sm" className="h-8 w-8">
            <Settings2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 text-xs">
          <DropdownMenuCheckboxItem checked={showCoordinate} onCheckedChange={setShowCoordinate}>
            Show coordinate
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={showGrid} onCheckedChange={setShowGrid}>
            Show grid
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setActiveDialog('color')}>
            <Palette className="mr-2 h-4 w-4" />
            <span>Colour profile...</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveDialog('camera')}>
            <Camera className="mr-2 h-4 w-4" />
            <span>Camera Setting...</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveDialog('shortcuts')}>
            <Keyboard className="mr-2 h-4 w-4" />
            <span>Keyboard shortcuts</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ColorSettingsDialog
        open={activeDialog === 'color'}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        colorProfile={colorProfile}
        onSaveProfile={onSaveProfile}
      />
      <CameraSettingsDialog
        open={activeDialog === 'camera'}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        cameraType={cameraType}
        onSaveCamera={onSaveCamera}
      />
      <KeyboardShortcutsDialog
        open={activeDialog === 'shortcuts'}
        onOpenChange={(open) => !open && setActiveDialog(null)}
      />
    </div>
  );
}
