import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Camera, Keyboard, X, Flashlight, RotateCcw, ArrowLeft, ScanLine } from "lucide-react";

const OTCScan = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"camera" | "manual">("camera");
  const [upcCode, setUpcCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (mode === "camera") {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [mode]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      setIsScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setCameraError("Unable to access camera. Please use manual entry.");
      setMode("manual");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setIsScanning(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (upcCode.trim()) {
      // Navigate to product report with the UPC
      navigate(`/otc/${upcCode}/report`);
    }
  };

  const handleDemoScan = () => {
    // Demo: simulate finding a product
    navigate("/otc/demo-123/report");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/app")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto"
        >
          <h1 className="text-2xl font-bold mb-2 text-center">Scan OTC Product</h1>
          <p className="text-muted-foreground text-center mb-6">
            Point your camera at the barcode or enter the UPC manually.
          </p>

          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={mode === "camera" ? "default" : "outline"}
              onClick={() => setMode("camera")}
              className="flex-1"
            >
              <Camera className="h-4 w-4 mr-2" />
              Camera
            </Button>
            <Button
              variant={mode === "manual" ? "default" : "outline"}
              onClick={() => setMode("manual")}
              className="flex-1"
            >
              <Keyboard className="h-4 w-4 mr-2" />
              Manual Entry
            </Button>
          </div>

          {mode === "camera" ? (
            <Card className="overflow-hidden">
              {/* Scanner Viewport */}
              <div className="relative aspect-[4/3] bg-black">
                {cameraError ? (
                  <div className="absolute inset-0 flex items-center justify-center text-white text-center p-4">
                    <p>{cameraError}</p>
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
                        <div className="absolute left-2 right-2 h-0.5 bg-primary animate-scan-line" />
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
                  >
                    <Flashlight className="h-5 w-5 text-white" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="rounded-full bg-white/20 backdrop-blur hover:bg-white/30"
                    onClick={startCamera}
                  >
                    <RotateCcw className="h-5 w-5 text-white" />
                  </Button>
                </div>
              </div>

              {/* Scanner Status */}
              <div className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <ScanLine className="h-4 w-4 animate-pulse text-primary" />
                  <span>Scanning for barcode...</span>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6">
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <label htmlFor="upc" className="block text-sm font-medium mb-2">
                    UPC / Barcode Number
                  </label>
                  <Input
                    id="upc"
                    type="text"
                    placeholder="Enter 12-digit UPC code"
                    value={upcCode}
                    onChange={(e) => setUpcCode(e.target.value)}
                    className="text-lg"
                    maxLength={14}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    The UPC is usually found below the barcode on the product packaging.
                  </p>
                </div>

                <Button type="submit" className="w-full gradient-hero text-primary-foreground">
                  Look Up Product
                </Button>
              </form>
            </Card>
          )}

          {/* Demo Button */}
          <div className="mt-6 text-center">
            <Button variant="link" onClick={handleDemoScan}>
              Try with a demo product →
            </Button>
          </div>

          {/* Can't find product? */}
          <Card className="mt-6 p-4 bg-muted/50">
            <h3 className="font-medium mb-2">Can't find your product?</h3>
            <p className="text-sm text-muted-foreground mb-3">
              If the product isn't in our database, you can submit it for review.
            </p>
            <Button variant="outline" size="sm">
              Submit Product for Review
            </Button>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default OTCScan;
