"use client";

import { Button } from "@/components/ui/button";
import { FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { uploadImageInIMGBB } from "@/lib/helper/serverHelperFunc";
import { useEffect, useState } from "react";
import { toast } from "sonner";
// import { FileInputUpload } from "./FileInputUpload";

interface ImageInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  currentImageUrl?: string;
  showCurrentImage?: boolean;
  className?: string;
}

export const ImageInput = ({
  value = "",
  onChange,
  placeholder = "https://example.com/image.jpg",
  currentImageUrl,
  showCurrentImage = false,
  className = "",
}: ImageInputProps) => {
  // input mode
  const [imageInputType, setImageInputType] = useState<
    "url" | "imgbb" | "site"
  >("url");

  // uploaded file (for preview before sending to imgbb)
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // processing flag
  const [isProcessing, setIsProcessing] = useState(false);

  // create + revoke preview object URL to avoid memory leaks
  useEffect(() => {
    if (uploadedImage) {
      const url = URL.createObjectURL(uploadedImage);
      setPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
        setPreviewUrl(null);
      };
    } else {
      setPreviewUrl(null);
    }
  }, [uploadedImage]);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsProcessing(true);
    setUploadedImage(file);
    try {
      const uploadedUrl = await uploadImageInIMGBB(file);
      // pass resulting url up
      onChange(uploadedUrl);
      toast.success("Image uploaded to ImgBB successfully!");
    } catch (error) {
      toast.error("Failed to upload image to ImgBB");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputTypeChange = (type: "url" | "imgbb" | "site") => {
    setImageInputType(type);

    // Ensure callers always receive a string value (never undefined)
    if (type === "url") {
      onChange(value ?? "");
    } else {
      // Clear the value for upload modes so parent knows there's no URL set
      onChange("");
      // Also clear any local preview state for safety
      setUploadedImage(null);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Input Type Selection */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          type="button"
          variant={imageInputType === "url" ? "default" : "outline"}
          onClick={() => handleInputTypeChange("url")}
          className="flex-1"
        >
          Use URL
        </Button>
        <Button
          type="button"
          variant={imageInputType === "imgbb" ? "default" : "outline"}
          onClick={() => handleInputTypeChange("imgbb")}
          className="flex-1"
        >
          ImgBB(Image)
        </Button>
        {/* <Button
          type="button"
          variant={imageInputType === "site" ? "default" : "outline"}
          onClick={() => handleInputTypeChange("site")}
          className="flex-1"
        >
          Upload Local
        </Button> */}
      </div>

      {/* Input Controls */}
      {imageInputType === "url" ? (
        <FormControl>
          <Input
            placeholder={placeholder}
            // Always provide a string (never undefined) so input remains controlled
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
            aria-label="Image URL"
          />
        </FormControl>
      ) : imageInputType === "imgbb" ? (
        <FormControl>
          {/* file inputs should remain uncontrolled; do NOT pass a value prop */}
          <Input
            // use a changing key to reset native file input when switching modes or uploading
            key={`imgbb-file-${uploadedImage ? uploadedImage.name : "none"}`}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleFileUpload(file);
              }
            }}
            className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
            disabled={isProcessing}
            aria-label="Upload image to ImgBB"
          />
        </FormControl>
      ) : (
        <></>
        // <FileInputUpload
        //   onUploadSuccess={(url) => {
        //     const constructUrl = SITE_URL + url;
        //     onChange(constructUrl);
        //   }}
        //   accept="image/*"
        //   placeholder="Select an image to upload to your site"
        //   className="w-full"
        // />
      )}

      {/* Uploaded Image Preview (for ImgBB) */}
      {uploadedImage && imageInputType === "imgbb" && previewUrl && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {uploadedImage.name}
          </p>
          <img
            src={previewUrl}
            alt="Preview"
            className="mt-2 max-h-48 rounded border border-gray-300 dark:border-gray-600"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}

      {/* Current Image Display */}
      {showCurrentImage && currentImageUrl && imageInputType === "url" && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Current Image:
          </p>
          <img
            src={currentImageUrl}
            alt="Current"
            className="max-h-48 rounded border border-gray-300 dark:border-gray-600"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}

      {/* URL Image Preview */}
      {imageInputType === "url" && value && value !== currentImageUrl && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Preview:
          </p>
          <img
            src={value}
            alt="URL Preview"
            className="max-h-48 rounded border border-gray-300 dark:border-gray-600"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}

      <FormMessage />
    </div>
  );
};

export default ImageInput;
