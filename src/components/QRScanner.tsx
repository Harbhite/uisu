import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { X, RefreshCw, Camera } from 'lucide-react';
import { toast } from 'sonner';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onError?: (errorMessage: string) => void;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onError, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerId = "html5-qrcode-scanner-container";

  useEffect(() => {
    let isMounted = true;

    const startScanner = async () => {
      try {
        // Initialize if not already done
        if (!scannerRef.current) {
          scannerRef.current = new Html5Qrcode(scannerId, {
            verbose: false,
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
          });
        }

        // Check if already scanning to avoid double start
        if (scannerRef.current.isScanning) {
           return;
        }

        await scannerRef.current.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          (decodedText) => {
            if (isMounted) {
              onScan(decodedText);
            }
          },
          (errorMessage) => {
            // We ignore frame errors as they happen frequently when no QR is found
          }
        );

        if (isMounted) {
          setIsScanning(true);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        console.error("Error starting scanner", err);
        if (isMounted) {
           toast.error("Failed to access camera. Please ensure permissions are granted.");
           if (onError) onError(errorMessage);
        }
      }
    };

    // Small timeout to ensure DOM is ready
    const timer = setTimeout(() => {
        startScanner();
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
           scannerRef.current.stop()
            .then(() => scannerRef.current?.clear())
            .catch(err => console.error("Failed to stop scanner", err));
        } else {
            scannerRef.current.clear();
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-background rounded-2xl overflow-hidden shadow-2xl border border-border">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start pointer-events-none">
           <div className="bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 pointer-events-auto">
              <Camera size={14} />
              <span>Scanning...</span>
           </div>
           <Button
             variant="ghost"
             size="icon"
             onClick={onClose}
             className="bg-black/60 backdrop-blur-md text-white hover:bg-black/80 hover:text-white rounded-full h-8 w-8 pointer-events-auto"
           >
             <X size={18} />
           </Button>
        </div>

        {/* Scanner Viewport */}
        <div className="relative aspect-square bg-black overflow-hidden">
            <div id={scannerId} className="w-full h-full [&>video]:object-cover"></div>

            {/* Overlay Guides */}
            <div className="absolute inset-0 pointer-events-none border-[40px] border-black/50 z-10">
                <div className="w-full h-full border-2 border-white/50 rounded-lg relative">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg -mt-[2px] -ml-[2px]"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg -mt-[2px] -mr-[2px]"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg -mb-[2px] -ml-[2px]"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg -mb-[2px] -mr-[2px]"></div>
                </div>
            </div>

            {!isScanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 text-white p-4 text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mb-4 text-primary" />
                    <p className="text-sm font-medium">Starting camera...</p>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-card text-center space-y-4">
             <div>
                <h3 className="font-serif text-lg font-medium text-foreground">Scan QR Code</h3>
                <p className="text-sm text-muted-foreground mt-1">Point your camera at the attendee's ticket</p>
             </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
