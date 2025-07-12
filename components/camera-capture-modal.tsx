
"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, ZapOff, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUri: string) => void;
}

export function CameraCaptureModal({ isOpen, onClose, onCapture }: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasStream, setHasStream] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const { toast } = useToast();

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setHasStream(false);
  }, []);

  const startCamera = useCallback(async (mode: 'user' | 'environment') => {
    setError(null);
    stopCamera(); 
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: mode }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setHasStream(true);
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access camera. Please ensure permissions are granted.");
        setHasStream(false);
        toast({
          title: "Camera Error",
          description: "Could not access camera. Please ensure permissions are granted or try switching cameras.",
          variant: "destructive",
        });
      }
    } else {
      setError("Camera not supported on this device.");
    }
  }, [stopCamera, toast]);


  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopCamera();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, facingMode]); // Removed startCamera/stopCamera deps because they are stable now

  const handleSwitchCamera = () => {
    setFacingMode(prevMode => prevMode === 'user' ? 'environment' : 'user');
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && hasStream) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        // Flip the image horizontally if it's the front-facing camera for a mirror effect
        if (facingMode === 'user') {
            context.translate(canvas.width, 0);
            context.scale(-1, 1);
        }
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUri = canvas.toDataURL('image/png');
        onCapture(imageDataUri);
        onClose(); // This now implicitly stops the camera via useEffect on `isOpen`
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-6 w-6" /> Capture Image
          </DialogTitle>
        </DialogHeader>
        <div className="p-6 pt-2">
          {error && (
            <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-md flex items-center gap-2">
              <ZapOff className="h-5 w-5"/> {error}
            </div>
          )}
          <div className="aspect-video bg-muted rounded-md overflow-hidden relative">
            <video ref={videoRef} autoPlay playsInline className={cn("w-full h-full object-cover", facingMode === 'user' && 'scale-x-[-1]')} />
            {!hasStream && !error && <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">Starting camera...</div>}
          </div>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
        <DialogFooter className="p-6 pt-0 bg-background/95 flex-row sm:justify-between">
          <Button variant="outline" onClick={handleSwitchCamera} disabled={!hasStream}>
            <RefreshCw className="mr-2 h-4 w-4" /> Switch Camera
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleCapture} disabled={!hasStream || !!error}>
              <Camera className="mr-2 h-4 w-4" /> Capture
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
