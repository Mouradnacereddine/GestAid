
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { MapPin, Globe } from 'lucide-react';

type ExportFormat = 'french' | 'international';

interface ReportFormatSelectorProps {
  exportFormat: ExportFormat;
  onExportFormatChange: (format: ExportFormat) => void;
}

export function ReportFormatSelector({ exportFormat, onExportFormatChange }: ReportFormatSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Format d'export
      </label>
      <RadioGroup 
        value={exportFormat} 
        onValueChange={(value: ExportFormat) => onExportFormatChange(value)}
        className="grid grid-cols-1 md:grid-cols-2 gap-3"
      >
        <div className="flex items-center space-x-3 p-3 border rounded-lg">
          <RadioGroupItem value="french" id="french" />
          <Label htmlFor="french" className="flex items-center gap-2 cursor-pointer flex-1">
            <MapPin className="h-4 w-4 text-blue-600" />
            <div>
              <div className="font-medium">Format Français</div>
              <div className="text-sm text-gray-600">Séparateur: point-virgule (;) • Décimales: virgule (,)</div>
            </div>
          </Label>
        </div>
        
        <div className="flex items-center space-x-3 p-3 border rounded-lg">
          <RadioGroupItem value="international" id="international" />
          <Label htmlFor="international" className="flex items-center gap-2 cursor-pointer flex-1">
            <Globe className="h-4 w-4 text-green-600" />
            <div>
              <div className="font-medium">Format International</div>
              <div className="text-sm text-gray-600">Séparateur: virgule (,) • Décimales: point (.)</div>
            </div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
