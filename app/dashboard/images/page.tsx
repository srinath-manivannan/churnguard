// /* eslint-disable @typescript-eslint/no-explicit-any */
// // ============================================
// // IMAGE ANALYSIS PAGE
// // ============================================
// // Upload and analyze store/office images with Gemini Vision

// "use client";

// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { useToast } from "@/hooks/use-toast";
// import { Upload, Image as ImageIcon, Loader2 } from "lucide-react";
// import { Alert, AlertDescription } from "@/components/ui/alert";

// export default function ImagesPage() {
//   const { toast } = useToast();

//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [preview, setPreview] = useState<string | null>(null);
//   const [analyzing, setAnalyzing] = useState(false);
//   const [analysis, setAnalysis] = useState<any>(null);

//   // Handle file selection
//   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     // Validate file type
//     if (!file.type.startsWith("image/")) {
//       toast({
//         variant: "destructive",
//         title: "Invalid file type",
//         description: "Please select an image file",
//       });
//       return;
//     }

//     // Validate file size (max 5MB)
//     if (file.size > 5 * 1024 * 1024) {
//       toast({
//         variant: "destructive",
//         title: "File too large",
//         description: "Image must be less than 5MB",
//       });
//       return;
//     }

//     setSelectedFile(file);

//     // Create preview
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       setPreview(reader.result as string);
//     };
//     reader.readAsDataURL(file);

//     // Clear previous analysis
//     setAnalysis(null);
//   };

//   // Analyze image
//   const handleAnalyze = async () => {
//     if (!selectedFile) return;

//     setAnalyzing(true);

//     try {
//       // Convert file to base64
//       const reader = new FileReader();
//       reader.readAsDataURL(selectedFile);

//       reader.onloadend = async () => {
//         const base64 = reader.result as string;
//         const base64Data = base64.split(",")[1]; // Remove data:image/xxx;base64, prefix

//         // Call analysis API
//         const response = await fetch("/api/images/analyze", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             imageData: base64Data,
//             mimeType: selectedFile.type,
//             filename: selectedFile.name,
//           }),
//         });

//         const data = await response.json();

//         if (!response.ok) {
//           throw new Error(data.error || "Analysis failed");
//         }

//         setAnalysis(data.analysis);

//         toast({
//           title: "Analysis complete!",
//           description: "Image has been analyzed successfully",
//         });
//       };
//     } catch (error: any) {
//       console.error("Analysis error:", error);
//       toast({
//         variant: "destructive",
//         title: "Analysis failed",
//         description: error.message,
//       });
//     } finally {
//       setAnalyzing(false);
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto space-y-6">
//       {/* Page Header */}
//       <div>
//         <h1 className="text-3xl font-bold text-gray-900">Image Analysis</h1>
//         <p className="text-gray-500 mt-1">
//           Analyze store or office images for customer activity insights
//         </p>
//       </div>

//       {/* Upload Card */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Upload Image</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           {/* File Input */}
//           <div className="flex items-center justify-center w-full">
//             <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
//               {preview ? (
//                 <img
//                   src={preview}
//                   alt="Preview"
//                   className="h-full object-contain rounded-lg"
//                 />
//               ) : (
//                 <div className="flex flex-col items-center justify-center pt-5 pb-6">
//                   <ImageIcon className="w-12 h-12 mb-3 text-gray-400" />
//                   <p className="mb-2 text-sm text-gray-500">
//                     <span className="font-semibold">Click to upload</span> or
//                     drag and drop
//                   </p>
//                   <p className="text-xs text-gray-500">
//                     PNG, JPG or WEBP (max 5MB)
//                   </p>
//                 </div>
//               )}
//               <input
//                 type="file"
//                 className="hidden"
//                 accept="image/*"
//                 onChange={handleFileSelect}
//               />
//             </label>
//           </div>

//           {/* Analyze Button */}
//           {selectedFile && (
//             <Button
//               onClick={handleAnalyze}
//               disabled={analyzing}
//               className="w-full"
//               size="lg"
//             >
//               {analyzing ? (
//                 <>
//                   <Loader2 className="mr-2 h-5 w-5 animate-spin" />
//                   Analyzing with AI...
//                 </>
//               ) : (
//                 <>
//                   <Upload className="mr-2 h-5 w-5" />
//                   Analyze Image
//                 </>
//               )}
//             </Button>
//           )}
//         </CardContent>
//       </Card>

//       {/* Analysis Results */}
//       {analysis && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Analysis Results</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             {/* Key Metrics */}
//             <div className="grid grid-cols-3 gap-4">
//               <div className="text-center p-4 bg-blue-50 rounded-lg">
//                 <p className="text-3xl font-bold text-blue-600">
//                   {analysis.peopleCount}
//                 </p>
//                 <p className="text-sm text-gray-600">People</p>
//               </div>
//               <div className="text-center p-4 bg-green-50 rounded-lg">
//                 <p className="text-xl font-bold text-green-600 capitalize">
//                   {analysis.engagementLevel}
//                 </p>
//                 <p className="text-sm text-gray-600">Engagement</p>
//               </div>
//               <div className="text-center p-4 bg-purple-50 rounded-lg">
//                 <p className="text-xl font-bold text-purple-600 capitalize">
//                   {analysis.mood}
//                 </p>
//                 <p className="text-sm text-gray-600">Mood</p>
//               </div>
//             </div>

//             {/* Activities */}
//             {analysis.activities && analysis.activities.length > 0 && (
//               <div>
//                 <h3 className="font-semibold mb-2">Observed Activities:</h3>
//                 <div className="flex flex-wrap gap-2">
//                   {analysis.activities.map((activity: string, i: number) => (
//                     <span
//                       key={i}
//                       className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
//                     >
//                       {activity}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Insights */}
//             {analysis.insights && analysis.insights.length > 0 && (
//               <div>
//                 <h3 className="font-semibold mb-2">💡 Insights:</h3>
//                 <ul className="space-y-2">
//                   {analysis.insights.map((insight: string, i: number) => (
//                     <li key={i} className="text-sm text-gray-700">
//                       • {insight}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}

//             {/* Recommendations */}
//             {analysis.recommendations && analysis.recommendations.length > 0 && (
//               <Alert>
//                 <AlertDescription>
//                   <h3 className="font-semibold mb-2">✅ Recommendations:</h3>
//                   <ul className="space-y-1">
//                     {analysis.recommendations.map((rec: string, i: number) => (
//                       <li key={i} className="text-sm">
//                         {i + 1}. {rec}
//                       </li>
//                     ))}
//                   </ul>
//                 </AlertDescription>
//               </Alert>
//             )}
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, Image as ImageIcon, Loader2, Cloud } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webViewLink?: string;
};

export default function ImagesPage() {
  const { toast } = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDriveFile, setSelectedDriveFile] = useState<DriveFile | null>(
    null
  );
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [loadingDrive, setLoadingDrive] = useState(false);
  const [driveConnected, setDriveConnected] = useState<boolean | null>(null);

  // -----------------------------
  // File selection (local upload)
  // -----------------------------
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please select an image file",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Image must be less than 5MB",
      });
      return;
    }

    setSelectedFile(file);
    setSelectedDriveFile(null); // clear Drive selection

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setAnalysis(null);
  };

  // -----------------------------
  // Connect Google Drive
  // -----------------------------
  const connectDrive = () => {
    window.location.href = "/api/google/auth";
  };

  const loadDriveImages = async () => {
    setLoadingDrive(true);
    try {
      const res = await fetch("/api/google/images");
      if (res.status === 401) {
        setDriveConnected(false);
        setDriveFiles([]);
        return;
      }
      const data = await res.json();
      setDriveFiles(data.files || []);
      setDriveConnected(true);
    } catch (err: any) {
      console.error("Load Drive images error:", err);
      setDriveConnected(false);
    } finally {
      setLoadingDrive(false);
    }
  };

  useEffect(() => {
    // Try to load Drive images on mount
    loadDriveImages();
  }, []);

  // -----------------------------
  // Pick image from Drive
  // -----------------------------
  const handleSelectDriveFile = (file: DriveFile) => {
    setSelectedDriveFile(file);
    setSelectedFile(null); // clear local file
    setAnalysis(null);

    // Preview from Drive
    const url = `https://drive.google.com/uc?export=view&id=${file.id}`;
    setPreview(url);
  };

  // helper to convert File -> base64 (without prefix)
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64.split(",")[1]); // strip "data:...;base64,"
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // -----------------------------
  // Analyze (local OR Drive)
  // -----------------------------
  const handleAnalyze = async () => {
    if (!selectedFile && !selectedDriveFile) return;

    setAnalyzing(true);
    try {
      let analysisResponse: any;

      if (selectedFile) {
        // Local file -> base64 -> /api/images/analyze
        const base64Data = await fileToBase64(selectedFile);
        const res = await fetch("/api/images/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageData: base64Data,
            mimeType: selectedFile.type,
            filename: selectedFile.name,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Analysis failed");
        analysisResponse = data.analysis;
      } else if (selectedDriveFile) {
        // Drive file -> /api/images/analyze-from-drive
        const res = await fetch("/api/images/analyze-from-drive", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileId: selectedDriveFile.id,
            mimeType: selectedDriveFile.mimeType,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Analysis failed");
        analysisResponse = data.analysis;
      }

      setAnalysis(analysisResponse);
      toast({
        title: "Analysis complete!",
        description: "Image has been analyzed successfully",
      });
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: error.message,
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Image Analysis</h1>
          <p className="text-gray-500 mt-1">
            Analyze store or office images for customer activity insights
          </p>
        </div>

        {/* Connect Google Drive */}
        <Button
          variant={driveConnected ? "outline" : "default"}
          onClick={connectDrive}
          disabled={loadingDrive}
        >
          {loadingDrive ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking Drive...
            </>
          ) : (
            <>
              <Cloud className="mr-2 h-4 w-4" />
              {driveConnected ? "Reconnect Google Drive" : "Connect Google Drive"}
            </>
          )}
        </Button>
      </div>

      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Local File Input */}
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="h-full object-contain rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImageIcon className="w-12 h-12 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG or WEBP (max 5MB)
                  </p>
                </div>
              )}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
              />
            </label>
          </div>

          {/* Google Drive Picker */}
          {driveConnected && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">
                Or pick an image from your Google Drive:
              </p>
              {driveFiles.length === 0 ? (
                <p className="text-xs text-gray-500">
                  No recent images found in your Drive.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {driveFiles.map((file) => (
                    <button
                      key={file.id}
                      type="button"
                      onClick={() => handleSelectDriveFile(file)}
                      className={`border rounded-lg p-2 text-left text-xs hover:border-blue-500 ${
                        selectedDriveFile?.id === file.id
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="truncate font-medium mb-1">
                        {file.name}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {file.mimeType}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Analyze Button */}
          {(selectedFile || selectedDriveFile) && (
            <Button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full"
              size="lg"
            >
              {analyzing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Analyze Image
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results (same as your old code) */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">
                  {analysis.peopleCount}
                </p>
                <p className="text-sm text-gray-600">People</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-xl font-bold text-green-600 capitalize">
                  {analysis.engagementLevel}
                </p>
                <p className="text-sm text-gray-600">Engagement</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-xl font-bold text-purple-600 capitalize">
                  {analysis.mood}
                </p>
                <p className="text-sm text-gray-600">Mood</p>
              </div>
            </div>

            {analysis.activities && analysis.activities.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Observed Activities:</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.activities.map((activity: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {activity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {analysis.insights && analysis.insights.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">💡 Insights:</h3>
                <ul className="space-y-2">
                  {analysis.insights.map((insight: string, i: number) => (
                    <li key={i} className="text-sm text-gray-700">
                      • {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.recommendations &&
              analysis.recommendations.length > 0 && (
                <Alert>
                  <AlertDescription>
                    <h3 className="font-semibold mb-2">
                      ✅ Recommendations:
                    </h3>
                    <ul className="space-y-1">
                      {analysis.recommendations.map((rec: string, i: number) => (
                        <li key={i} className="text-sm">
                          {i + 1}. {rec}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
