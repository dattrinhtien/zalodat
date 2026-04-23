"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, X, Image, File, Loader2 } from "lucide-react";

interface FileUploadProps {
  roomId: string;
  onFileUploaded: (
    type: "image" | "file",
    fileUrl: string,
    fileName: string,
    fileSize: number
  ) => Promise<void>;
  onClose: () => void;
}

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function FileUpload({ roomId, onFileUploaded, onClose }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setError(null);

    if (file.size > MAX_FILE_SIZE) {
      setError("File quá lớn. Tối đa 50MB.");
      return;
    }

    setSelectedFile(file);

    // Show preview for images
    if (IMAGE_TYPES.includes(file.type)) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const supabase = createClient();
      const isImage = IMAGE_TYPES.includes(selectedFile.type);
      const fileExt = selectedFile.name.split(".").pop();
      const uniqueName = `${roomId}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

      // Simulate progress (Supabase JS client doesn't expose upload progress)
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const { data, error: uploadError } = await supabase.storage
        .from("chat-attachments")
        .upload(uniqueName, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      clearInterval(progressInterval);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("chat-attachments")
        .getPublicUrl(data.path);

      setProgress(100);

      await onFileUploaded(
        isImage ? "image" : "file",
        urlData.publicUrl,
        selectedFile.name,
        selectedFile.size
      );

      // Reset state
      setSelectedFile(null);
      setPreview(null);
      setProgress(0);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Lỗi upload. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(null);
    setProgress(0);
    setError(null);
    onClose();
  };

  return (
    <div className="w-80 bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-sm font-medium">Đính kèm</span>
        <button
          onClick={handleCancel}
          className="p-1 rounded-lg hover:bg-accent transition-colors"
          type="button"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3 space-y-3">
        {!selectedFile ? (
          /* File type selection */
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => imageInputRef.current?.click()}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:bg-accent transition-colors"
              type="button"
            >
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Image className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-xs font-medium">Hình ảnh</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:bg-accent transition-colors"
              type="button"
            >
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <File className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-xs font-medium">File</span>
            </button>
          </div>
        ) : (
          /* File preview & upload */
          <div className="space-y-3">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-40 object-cover rounded-xl"
              />
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                <File className="w-8 h-8 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            )}

            {/* Progress bar */}
            {uploading && (
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {error && (
              <p className="text-xs text-red-500">{error}</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="flex-1 py-2 px-3 rounded-xl border border-border text-sm hover:bg-accent transition-colors"
                disabled={uploading}
                type="button"
              >
                Hủy
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 py-2 px-3 rounded-xl bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                type="button"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang tải...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Gửi
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
      />
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
      />
    </div>
  );
}
