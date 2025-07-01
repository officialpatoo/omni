"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, ZapOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
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
        description: "Could not access camera. Please ensure permissions are granted.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setHasStream(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);


  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && hasStream) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUri = canvas.toDataURL('image/png');
        onCapture(imageDataUri);
        onClose();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 font-headline">
            <Camera className="h-6 w-6" /> Capture Image
          </DialogTitle>
        </DialogHeader>
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-md flex items-center gap-2">
              <ZapOff className="h-5 w-5"/> {error}
            </div>
          )}
          <div className="aspect-video bg-muted rounded-md overflow-hidden relative">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            {!hasStream && !error && <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">Starting camera...</div>}
          </div>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
        <DialogFooter className="p-6 pt-0">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCapture} disabled={!hasStream || !!error}>
            <Camera className="mr-2 h-4 w-4" /> Capture
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
