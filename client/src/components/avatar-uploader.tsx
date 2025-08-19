import { useState, useRef } from "react";
import { ObjectUploader } from "./ObjectUploader";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LazyImage } from "@/components/ui/lazy-image";
import { Camera, Crop, RotateCw, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UploadResult } from "@uppy/core";

interface AvatarUploaderProps {
  currentAvatar?: string;
  userName?: string;
  onAvatarUpdate: (avatarUrl: string) => void;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "w-12 h-12",
  md: "w-16 h-16", 
  lg: "w-20 h-20",
  xl: "w-32 h-32"
};

export function AvatarUploader({
  currentAvatar,
  userName,
  onAvatarUpdate,
  className,
  size = "lg"
}: AvatarUploaderProps) {
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cropSettings, setCropSettings] = useState({
    scale: 1,
    rotation: 0,
    x: 0,
    y: 0
  });
  const [isUploading, setIsUploading] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleGetUploadParameters = async () => {
    try {
      const response = await fetch('/api/objects/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }
      
      const data = await response.json();
      return {
        method: 'PUT' as const,
        url: data.uploadURL,
      };
    } catch (error) {
      console.error('Error getting upload parameters:', error);
      throw error;
    }
  };

  const handleUploadComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      setSelectedImage(uploadedFile.uploadURL as string);
      setShowCropDialog(true);
    }
  };

  const cropAndSaveImage = async () => {
    if (!selectedImage || !canvasRef.current || !imageRef.current) return;

    setIsUploading(true);
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const image = imageRef.current;
      
      if (!ctx) return;

      // Set canvas size to 200x200 for avatar
      const outputSize = 200;
      canvas.width = outputSize;
      canvas.height = outputSize;

      // Calculate crop area
      const { scale, rotation, x, y } = cropSettings;
      const imageAspect = image.naturalWidth / image.naturalHeight;
      const canvasAspect = 1; // Square output
      
      let sourceWidth, sourceHeight;
      if (imageAspect > canvasAspect) {
        sourceHeight = image.naturalHeight;
        sourceWidth = sourceHeight * canvasAspect;
      } else {
        sourceWidth = image.naturalWidth;
        sourceHeight = sourceWidth / canvasAspect;
      }

      // Apply transformations
      ctx.save();
      ctx.translate(outputSize / 2, outputSize / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(scale, scale);

      // Draw the cropped image
      ctx.drawImage(
        image,
        (image.naturalWidth - sourceWidth) / 2 + x,
        (image.naturalHeight - sourceHeight) / 2 + y,
        sourceWidth,
        sourceHeight,
        -outputSize / 2,
        -outputSize / 2,
        outputSize,
        outputSize
      );
      
      ctx.restore();

      // Convert to blob and upload
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        try {
          // Get new upload URL for the cropped image
          const uploadParams = await handleGetUploadParameters();
          
          // Upload the cropped image
          const uploadResponse = await fetch(uploadParams.url, {
            method: 'PUT',
            body: blob,
            headers: {
              'Content-Type': 'image/jpeg',
            },
          });

          if (!uploadResponse.ok) {
            throw new Error('Failed to upload cropped image');
          }

          // Update user profile with new avatar URL
          const avatarUrl = uploadParams.url.split('?')[0]; // Remove query params
          
          const updateResponse = await fetch('/api/profile/avatar', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ avatarUrl }),
          });

          if (!updateResponse.ok) {
            throw new Error('Failed to update profile avatar');
          }

          onAvatarUpdate(avatarUrl);
          setShowCropDialog(false);
          setSelectedImage(null);
          
        } catch (error) {
          console.error('Error saving cropped avatar:', error);
        } finally {
          setIsUploading(false);
        }
      }, 'image/jpeg', 0.9);
      
    } catch (error) {
      console.error('Error cropping image:', error);
      setIsUploading(false);
    }
  };

  const resetCrop = () => {
    setCropSettings({
      scale: 1,
      rotation: 0,
      x: 0,
      y: 0
    });
  };

  const getUserInitials = () => {
    if (!userName) return "?";
    return userName
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <div className={cn("relative group", className)}>
        <Avatar className={cn(sizeClasses[size], "border-2 border-slate-200 dark:border-slate-700")}>
          {currentAvatar ? (
            <LazyImage
              src={currentAvatar}
              alt={`${userName}'s avatar`}
              className="w-full h-full object-cover"
            />
          ) : (
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-600/20 text-slate-700 dark:text-slate-300 font-semibold">
              {getUserInitials()}
            </AvatarFallback>
          )}
        </Avatar>
        
        <ObjectUploader
          maxNumberOfFiles={1}
          maxFileSize={5 * 1024 * 1024} // 5MB
          onGetUploadParameters={handleGetUploadParameters}
          onComplete={handleUploadComplete}
          buttonClassName="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full flex items-center justify-center"
        >
          <Camera className="w-4 h-4 text-white" />
        </ObjectUploader>
      </div>

      <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crop className="w-5 h-5" />
              Crop Avatar
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedImage && (
              <>
                <div className="relative w-full h-64 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                  <img
                    ref={imageRef}
                    src={selectedImage}
                    alt="Crop preview"
                    className="w-full h-full object-contain"
                    style={{
                      transform: `scale(${cropSettings.scale}) rotate(${cropSettings.rotation}deg) translate(${cropSettings.x}px, ${cropSettings.y}px)`
                    }}
                  />
                  <div className="absolute inset-0 border-2 border-dashed border-primary/50" />
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Scale</label>
                    <Slider
                      value={[cropSettings.scale]}
                      onValueChange={([value]) => setCropSettings(prev => ({ ...prev, scale: value }))}
                      min={0.5}
                      max={3}
                      step={0.1}
                      className="mt-1"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCropSettings(prev => ({ ...prev, rotation: prev.rotation + 90 }))}
                    >
                      <RotateCw className="w-4 h-4 mr-1" />
                      Rotate
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={resetCrop}
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                <canvas
                  ref={canvasRef}
                  className="hidden"
                  width={200}
                  height={200}
                />
              </>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCropDialog(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={cropAndSaveImage}
                disabled={!selectedImage || isUploading}
              >
                {isUploading ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Avatar"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}