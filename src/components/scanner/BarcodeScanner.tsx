import { useEffect, useRef, useState, useCallback } from "react";
import { BrowserMultiFormatReader, NotFoundException, Result } from "@zxing/library";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flashlight, RotateCcw, ScanLine, Camera, AlertCircle } from "lucide-react";

interface BarcodeScannerProps {
  onScan: (code: string, format: string) => void;
  onError?: (error: string) => void;
  expectedFormats?: string[];
  className?: string;
}

export function BarcodeScanner({ 
  onScan, 
  onError,
  expectedFormats,
  className 
}: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  const startScanning = useCallback(async () => {
    try {
      setCameraError(null);
      setIsScanning(true);

      if (!readerRef.current) {
        readerRef.current = new BrowserMultiFormatReader();
      }

      const videoInputDevices = await readerRef.current.listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        throw new Error("No camera found on this device");
      }

      // Prefer back camera
      const backCamera = videoInputDevices.find(
        device => device.label.toLowerCase().includes("back") || 
                  device.label.toLowerCase().includes("rear")
      );
      const selectedDevice = backCamera || videoInputDevices[0];

      await readerRef.current.decodeFromVideoDevice(
        selectedDevice.deviceId,
        videoRef.current!,
        (result: Result | null, error) => {
          if (result) {
            const code = result.getText();
            const format = result.getBarcodeFormat().toString();
            
            // Prevent duplicate scans
            if (code !== lastScanned) {
              setLastScanned(code);
              onScan(code, format);
            }
          }
          
          if (error && !(error instanceof NotFoundException)) {
            console.error("Scan error:", error);
          }
        }
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to access camera";
      setCameraError(errorMessage);
      onError?.(errorMessage);
      setIsScanning(false);
    }
  }, [onScan, onError, lastScanned]);

  const stopScanning = useCallback(() => {
    if (readerRef.current) {
      readerRef.current.reset();
    }
    setIsScanning(false);
  }, []);

  const restartScanning = useCallback(() => {
    stopScanning();
    setLastScanned(null);
    setTimeout(() => startScanning(), 100);
  }, [stopScanning, startScanning]);

  useEffect(() => {
    startScanning();
    
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <Card className={`overflow-hidden ${className}`}>
      {/* Scanner Viewport */}
      <div className="relative aspect-[4/3] bg-black">
        {cameraError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4 gap-4">
            <AlertCircle className="h-12 w-12 text-amber-400" />
            <p>{cameraError}</p>
            <Button 
              variant="secondary" 
              onClick={restartScanning}
              className="mt-2"
            >
              <Camera className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {/* Scanner Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Scanning Frame */}
              <div className="relative w-64 h-32 border-2 border-primary rounded-lg">
                {/* Corner Accents */}
                <div className="absolute -top-0.5 -left-0.5 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                <div className="absolute -top-0.5 -right-0.5 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                <div className="absolute -bottom-0.5 -left-0.5 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
                
                {/* Scanning Line */}
                {isScanning && (
                  <div className="absolute left-2 right-2 h-0.5 bg-primary animate-scan-line" />
                )}
              </div>
            </div>

            {/* Vignette */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50 pointer-events-none" />
          </>
        )}

        {/* Camera Controls */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full bg-white/20 backdrop-blur hover:bg-white/30"
            title="Toggle flashlight"
          >
            <Flashlight className="h-5 w-5 text-white" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full bg-white/20 backdrop-blur hover:bg-white/30"
            onClick={restartScanning}
            title="Restart scanner"
          >
            <RotateCcw className="h-5 w-5 text-white" />
          </Button>
        </div>
      </div>

      {/* Scanner Status */}
      <div className="p-4 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <ScanLine className="h-4 w-4 animate-pulse text-primary" />
          <span>
            {lastScanned 
              ? `Scanned: ${lastScanned}` 
              : "Position barcode in the frame"}
          </span>
        </div>
      </div>
    </Card>
  );
}
