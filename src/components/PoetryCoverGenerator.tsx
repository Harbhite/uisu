import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, RefreshCw, ImagePlus, Type, Palette, 
  AlignLeft, AlignCenter, AlignRight, Loader2, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PoetryCoverGeneratorProps {
  title: string;
  authorName: string;
  coverImage?: string | null;
  onGenerated?: (imageDataUrl: string) => void;
  className?: string;
}

type TextPosition = 'top' | 'center' | 'bottom';
type TextAlignment = 'left' | 'center' | 'right';

interface OverlaySettings {
  titleSize: number;
  authorSize: number;
  textColor: string;
  overlayColor: string;
  overlayOpacity: number;
  position: TextPosition;
  alignment: TextAlignment;
  fontFamily: 'serif' | 'sans' | 'mono' | 'display';
  showSubtitle: boolean;
  subtitle: string;
}

const defaultSettings: OverlaySettings = {
  titleSize: 48,
  authorSize: 18,
  textColor: '#FFFFFF',
  overlayColor: '#000000',
  overlayOpacity: 40,
  position: 'center',
  alignment: 'center',
  fontFamily: 'serif',
  showSubtitle: false,
  subtitle: 'A Poem'
};

const fontFamilies: Record<OverlaySettings['fontFamily'], string> = {
  serif: 'Georgia, "Times New Roman", serif',
  sans: 'Inter, system-ui, sans-serif',
  mono: '"Courier New", Courier, monospace',
  display: 'Playfair Display, Georgia, serif'
};

const presetGradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(180deg, #1a365d 0%, #2d3748 100%)',
  'linear-gradient(135deg, #232526 0%, #414345 100%)'
];

export const PoetryCoverGenerator: React.FC<PoetryCoverGeneratorProps> = ({
  title,
  authorName,
  coverImage,
  onGenerated,
  className
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [settings, setSettings] = useState<OverlaySettings>(defaultSettings);
  const [customImage, setCustomImage] = useState<string | null>(coverImage || null);
  const [selectedGradient, setSelectedGradient] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateSetting = useCallback(<K extends keyof OverlaySettings>(
    key: K, 
    value: OverlaySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas dimensions (OG image size)
    const width = 1200;
    const height = 630;
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    if (customImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Cover-fit the image
        const scale = Math.max(width / img.width, height / img.height);
        const x = (width - img.width * scale) / 2;
        const y = (height - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        
        // Draw overlay and text
        drawOverlayAndText(ctx, width, height);
      };
      img.onerror = () => {
        // Fallback to gradient
        drawGradient(ctx, width, height);
        drawOverlayAndText(ctx, width, height);
      };
      img.src = customImage;
    } else if (selectedGradient) {
      drawGradient(ctx, width, height);
      drawOverlayAndText(ctx, width, height);
    } else {
      // Default gradient
      const grd = ctx.createLinearGradient(0, 0, width, height);
      grd.addColorStop(0, '#667eea');
      grd.addColorStop(1, '#764ba2');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, width, height);
      drawOverlayAndText(ctx, width, height);
    }
  }, [customImage, selectedGradient, settings, title, authorName]);

  const drawGradient = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Parse gradient string and create canvas gradient
    const gradient = selectedGradient || presetGradients[0];
    const match = gradient.match(/(\d+)deg/);
    const angle = match ? parseInt(match[1]) : 135;
    
    const colorMatches = [...gradient.matchAll(/(#[a-fA-F0-9]{6}|rgba?\([^)]+\))/g)];
    const colors = colorMatches.map(m => m[0]);
    
    if (colors.length < 2) {
      ctx.fillStyle = colors[0] || '#667eea';
      ctx.fillRect(0, 0, width, height);
      return;
    }

    const angleRad = (angle - 90) * (Math.PI / 180);
    const x1 = width / 2 - Math.cos(angleRad) * width;
    const y1 = height / 2 - Math.sin(angleRad) * height;
    const x2 = width / 2 + Math.cos(angleRad) * width;
    const y2 = height / 2 + Math.sin(angleRad) * height;

    const grd = ctx.createLinearGradient(x1, y1, x2, y2);
    colors.forEach((color, i) => {
      grd.addColorStop(i / (colors.length - 1), color);
    });
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, width, height);
  };

  const drawOverlayAndText = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Draw overlay
    ctx.fillStyle = settings.overlayColor;
    ctx.globalAlpha = settings.overlayOpacity / 100;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;

    // Calculate text position
    let textY: number;
    switch (settings.position) {
      case 'top':
        textY = height * 0.25;
        break;
      case 'bottom':
        textY = height * 0.75;
        break;
      default:
        textY = height / 2;
    }

    // Calculate text X
    let textX: number;
    let textAlign: CanvasTextAlign;
    const padding = 80;
    switch (settings.alignment) {
      case 'left':
        textX = padding;
        textAlign = 'left';
        break;
      case 'right':
        textX = width - padding;
        textAlign = 'right';
        break;
      default:
        textX = width / 2;
        textAlign = 'center';
    }

    ctx.textAlign = textAlign;
    ctx.fillStyle = settings.textColor;

    // Draw subtitle (if enabled)
    if (settings.showSubtitle && settings.subtitle) {
      ctx.font = `300 ${settings.authorSize}px ${fontFamilies[settings.fontFamily]}`;
      ctx.fillText(settings.subtitle.toUpperCase(), textX, textY - settings.titleSize - 20);
    }

    // Draw title
    ctx.font = `600 ${settings.titleSize}px ${fontFamilies[settings.fontFamily]}`;
    
    // Word wrap title
    const maxWidth = width - padding * 2;
    const words = title.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) lines.push(currentLine);

    // Draw title lines
    const lineHeight = settings.titleSize * 1.2;
    const totalTitleHeight = lines.length * lineHeight;
    const titleStartY = textY - totalTitleHeight / 2;
    
    lines.forEach((line, i) => {
      ctx.fillText(line, textX, titleStartY + i * lineHeight + settings.titleSize / 2);
    });

    // Draw author
    ctx.font = `italic ${settings.authorSize}px ${fontFamilies[settings.fontFamily]}`;
    ctx.fillText(`— ${authorName}`, textX, titleStartY + totalTitleHeight + settings.authorSize + 20);
  };

  // Redraw when settings change
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setCustomImage(event.target?.result as string);
      setSelectedGradient(null);
    };
    reader.readAsDataURL(file);
  };

  const downloadCover = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setGenerating(true);
    
    // Small delay to ensure canvas is fully rendered
    setTimeout(() => {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-cover.png`;
      link.href = dataUrl;
      link.click();
      
      onGenerated?.(dataUrl);
      toast.success('Cover image downloaded!');
      setGenerating(false);
    }, 100);
  };

  const copyToClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const blob = await new Promise<Blob | null>(resolve => 
        canvas.toBlob(resolve, 'image/png')
      );
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        toast.success('Copied to clipboard!');
      }
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Preview */}
      <div className="border border-border rounded-lg overflow-hidden bg-muted/30">
        <div className="aspect-[1200/630] relative">
          <canvas 
            ref={canvasRef}
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Background Selection */}
        <div className="space-y-3">
          <Label className="text-xs font-medium text-muted-foreground">Background</Label>
          
          {/* Upload custom image */}
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
            >
              <ImagePlus size={14} className="mr-2" />
              Upload Image
            </Button>
            {customImage && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCustomImage(null)}
              >
                <RefreshCw size={14} />
              </Button>
            )}
          </div>

          {/* Gradient presets */}
          <div className="grid grid-cols-4 gap-2">
            {presetGradients.map((gradient, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setSelectedGradient(gradient);
                  setCustomImage(null);
                }}
                className={cn(
                  "aspect-square rounded-md transition-all",
                  selectedGradient === gradient && !customImage 
                    ? "ring-2 ring-accent ring-offset-2" 
                    : "hover:ring-2 hover:ring-border"
                )}
                style={{ background: gradient }}
              />
            ))}
          </div>
        </div>

        {/* Text Settings */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Title Size</Label>
            <Slider
              value={[settings.titleSize]}
              onValueChange={([v]) => updateSetting('titleSize', v)}
              min={24}
              max={72}
              step={2}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Font Style</Label>
            <Select
              value={settings.fontFamily}
              onValueChange={(v) => updateSetting('fontFamily', v as OverlaySettings['fontFamily'])}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="serif">Serif (Classic)</SelectItem>
                <SelectItem value="sans">Sans-serif (Modern)</SelectItem>
                <SelectItem value="mono">Monospace (Typewriter)</SelectItem>
                <SelectItem value="display">Display (Elegant)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Position */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Position</Label>
            <div className="flex gap-1">
              {(['top', 'center', 'bottom'] as TextPosition[]).map(pos => (
                <Button
                  key={pos}
                  type="button"
                  variant={settings.position === pos ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateSetting('position', pos)}
                  className="flex-1 capitalize"
                >
                  {pos}
                </Button>
              ))}
            </div>
          </div>

          {/* Alignment */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Alignment</Label>
            <div className="flex gap-1">
              <Button
                type="button"
                variant={settings.alignment === 'left' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateSetting('alignment', 'left')}
              >
                <AlignLeft size={14} />
              </Button>
              <Button
                type="button"
                variant={settings.alignment === 'center' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateSetting('alignment', 'center')}
              >
                <AlignCenter size={14} />
              </Button>
              <Button
                type="button"
                variant={settings.alignment === 'right' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateSetting('alignment', 'right')}
              >
                <AlignRight size={14} />
              </Button>
            </div>
          </div>
        </div>

        {/* Overlay Settings */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Overlay Opacity</Label>
            <Slider
              value={[settings.overlayOpacity]}
              onValueChange={([v]) => updateSetting('overlayOpacity', v)}
              min={0}
              max={80}
              step={5}
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1 space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Text Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.textColor}
                  onChange={(e) => updateSetting('textColor', e.target.value)}
                  className="w-10 h-10 rounded border border-border cursor-pointer"
                />
                <Input
                  value={settings.textColor}
                  onChange={(e) => updateSetting('textColor', e.target.value)}
                  className="flex-1 h-10 font-mono text-sm"
                />
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Overlay Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.overlayColor}
                  onChange={(e) => updateSetting('overlayColor', e.target.value)}
                  className="w-10 h-10 rounded border border-border cursor-pointer"
                />
                <Input
                  value={settings.overlayColor}
                  onChange={(e) => updateSetting('overlayColor', e.target.value)}
                  className="flex-1 h-10 font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Subtitle */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="show-subtitle"
              checked={settings.showSubtitle}
              onChange={(e) => updateSetting('showSubtitle', e.target.checked)}
              className="rounded border-border"
            />
            <Label htmlFor="show-subtitle" className="text-xs font-medium text-muted-foreground cursor-pointer">
              Show Subtitle
            </Label>
          </div>
          
          {settings.showSubtitle && (
            <Input
              value={settings.subtitle}
              onChange={(e) => updateSetting('subtitle', e.target.value)}
              placeholder="A Poem"
              className="h-9"
            />
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          type="button"
          onClick={downloadCover}
          disabled={generating}
          className="flex-1"
        >
          {generating ? (
            <Loader2 size={16} className="mr-2 animate-spin" />
          ) : (
            <Download size={16} className="mr-2" />
          )}
          Download Cover
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={copyToClipboard}
        >
          <Sparkles size={16} className="mr-2" />
          Copy
        </Button>
      </div>
    </div>
  );
};

export default PoetryCoverGenerator;
