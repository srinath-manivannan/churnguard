/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================
// CSV UPLOAD PAGE
// ============================================
// Page for uploading customer CSV files

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Dropzone from "@/components/upload/Dropzone";
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function UploadPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  // Handle file selection
  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setUploadResult(null); // Clear previous results
  };

  // Handle upload
  const handleUpload = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a CSV file to upload",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create form data
      const formData = new FormData();
      formData.append("file", file);

      // Upload file
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      // Check if response is OK before parsing JSON
      if (!response.ok) {
        let errorMessage = "Upload failed";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = `${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Show success message
      toast({
        title: "Upload successful!",
        description: data.message,
      });

      // Store results
      setUploadResult(data.results);

      // Clear file
      setFile(null);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message,
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Trigger churn analysis
  const handleAnalyze = async () => {
    setIsUploading(true);

    try {
      const response = await fetch("/api/customers/analyze", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      toast({
        title: "Analysis complete!",
        description: `Analyzed ${data.stats.totalAnalyzed} customers. ${data.stats.highRiskCount} are at high risk.`,
      });

      // Redirect to customers page
      router.push("/dashboard/customers");
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: error.message,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload Customer Data</h1>
        <p className="text-gray-500 mt-1">
          Import customer data from CSV to start analyzing churn risk
        </p>
      </div>

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileSpreadsheet className="h-5 w-5" />
            <span>CSV Format Requirements</span>
          </CardTitle>
          <CardDescription>
            Your CSV file should include the following columns:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium text-sm mb-2">Required:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• name (or customer_name)</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-sm mb-2">Optional:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• email</li>
                <li>• phone</li>
                <li>• company</li>
                <li>• segment</li>
                <li>• last_activity_date</li>
                <li>• total_revenue</li>
                <li>• support_tickets</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle>Upload File</CardTitle>
          <CardDescription>
            Select a CSV file to upload (max 10MB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Dropzone */}
          <Dropzone onFileSelect={handleFileSelect} selectedFile={file} />

          {/* Upload Button */}
          {file && (
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full"
              size="lg"
            >
              {isUploading ? (
                <>
                  <Upload className="mr-2 h-5 w-5 animate-pulse" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Upload and Import
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Results Card */}
      {uploadResult && (
        <Card>
          <CardHeader>
            <CardTitle>Import Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">
                  {uploadResult.total}
                </p>
                <p className="text-sm text-gray-600">Total Rows</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">
                  {uploadResult.imported}
                </p>
                <p className="text-sm text-gray-600">Imported</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-3xl font-bold text-red-600">
                  {uploadResult.failed}
                </p>
                <p className="text-sm text-gray-600">Failed</p>
              </div>
            </div>

            {/* Errors */}
            {uploadResult.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium mb-2">
                    {uploadResult.errors.length} rows failed to import:
                  </p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {uploadResult.errors.slice(0, 5).map((err: any, i: number) => (
                      <p key={i} className="text-xs">
                        Row {err.row}: {err.error}
                      </p>
                    ))}
                    {uploadResult.errors.length > 5 && (
                      <p className="text-xs">
                        ...and {uploadResult.errors.length - 5} more
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Analyze Button */}
            {uploadResult.imported > 0 && (
              <Button
                onClick={handleAnalyze}
                disabled={isUploading}
                className="w-full"
                variant="outline"
              >
                Analyze Churn Risk with AI
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}