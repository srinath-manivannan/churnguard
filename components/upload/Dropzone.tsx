/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================
// DROPZONE COMPONENT
// ============================================
// Drag-and-drop file upload component for CSV files

"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
}

export default function Dropzone({ onFileSelect, selectedFile }: DropzoneProps) {
  // Handle file drop
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  // Setup dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  // Handle file removal
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null as any);
  };

  return (
    <div
      {...getRootProps()}
      className={cn(
        // Base styles
        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
        // Hover state
        "hover:border-blue-400 hover:bg-blue-50",
        // Active drag state
        isDragActive && "border-blue-500 bg-blue-50",
        // Default state
        !isDragActive && "border-gray-300 bg-gray-50"
      )}
    >
      <input {...getInputProps()} />

      {/* If file selected, show file info */}
      {selectedFile ? (
        <div className="flex items-center justify-center space-x-4">
          {/* File icon */}
          <div className="p-3 bg-blue-100 rounded-lg">
            <File className="h-8 w-8 text-blue-600" />
          </div>

          {/* File details */}
          <div className="flex-1 text-left">
            <p className="font-medium text-gray-900">{selectedFile.name}</p>
            <p className="text-sm text-gray-500">
              {(selectedFile.size / 1024).toFixed(2)} KB
            </p>
          </div>

          {/* Remove button */}
          <button
            onClick={handleRemove}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      ) : (
        // If no file, show upload prompt
        <div className="space-y-4">
          {/* Upload icon */}
          <div className="flex justify-center">
            <div className="p-4 bg-blue-100 rounded-full">
              <Upload className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          {/* Text */}
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragActive ? "Drop your CSV file here" : "Drop CSV file here"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              or click to browse (max 10MB)
            </p>
          </div>

          {/* Supported format */}
          <p className="text-xs text-gray-400">Supported format: .csv</p>
        </div>
      )}
    </div>
  );
}