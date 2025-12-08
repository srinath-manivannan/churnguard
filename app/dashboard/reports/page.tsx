/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Download, ExternalLink, BarChart3, TrendingUp, Users, Mail } from "lucide-react";

export default function ReportsPage() {
  const [embedUrl, setEmbedUrl] = useState("");
  const [savedUrl, setSavedUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingReport, setSendingReport] = useState(false);
  // Load saved URL on mount
  useEffect(() => {
    const saved = localStorage.getItem("looker_studio_url");
    if (saved) setSavedUrl(saved);
  }, []);

  const handleExportToSheets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/export/sheets");
      const data = await res.json();
      
      // Convert to CSV
      const csv = convertToCSV(data.customers);
      
      // Download CSV
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "churnguard-customers.csv";
      a.click();
      
      toast.success("Data exported! Now upload to Google Sheets");
    } catch (error) {
      toast.error("Failed to export data");
    } finally {
      setLoading(false);
    }
  };
  const handleSendReport = async () => {
    setSendingReport(true);
    try {
      const res = await fetch("/api/reports/send", {
        method: "POST",
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success("📧 Report sent to your email!");
      } else {
        toast.error(data.error || "Failed to send report");
      }
    } catch (error) {
      toast.error("Failed to send report");
    } finally {
      setSendingReport(false);
    }
  };
  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return "";
    
    const headers = Object.keys(data[0]);
    const rows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === "string" && value.includes(",") 
          ? `"${value}"` 
          : value;
      }).join(",")
    );
    
    return [headers.join(","), ...rows].join("\n");
  };

  const handleSave = () => {
    if (!embedUrl) {
      toast.error("Please enter a Looker Studio URL");
      return;
    }
    
    // Convert embed URL to view URL
    const viewUrl = embedUrl.includes("/embed/")
      ? embedUrl.replace("/embed/reporting/", "/reporting/")
      : embedUrl;
    
    localStorage.setItem("looker_studio_url", viewUrl);
    setSavedUrl(viewUrl);
    toast.success("Looker Studio connected!");
  };

  const openLookerStudio = () => {
    if (savedUrl) {
      window.open(savedUrl, "_blank");
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Connect Looker Studio for advanced analytics
        </p>
      </div>
      <div className="flex gap-2">
          <Button 
            onClick={handleSendReport} 
            disabled={sendingReport}
            variant="default"
          >
            <Mail className="h-4 w-4 mr-2" />
            {sendingReport ? "Sending..." : "Email Report"}
          </Button>
        </div>
      {!savedUrl ? (
        <div className="space-y-6 max-w-4xl">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              📊 Connect Looker Studio in 4 Easy Steps
            </h2>
            
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Export Your Data</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Download your customer data as a CSV file
                  </p>
                  <Button onClick={handleExportToSheets} disabled={loading}>
                    <Download className="h-4 w-4 mr-2" />
                    {loading ? "Exporting..." : "Export to CSV"}
                  </Button>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Upload to Google Sheets</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    1. Go to Google Sheets<br/>
                    2. File → Import → Upload<br/>
                    3. Upload the downloaded CSV
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => window.open("https://sheets.google.com", "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Google Sheets
                  </Button>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Create Looker Studio Report</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    1. Go to Looker Studio<br/>
                    2. Click "Create" → "Report"<br/>
                    3. Select "Google Sheets" as data source<br/>
                    4. Choose your uploaded sheet<br/>
                    5. Design your dashboard
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => window.open("https://lookerstudio.google.com", "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Looker Studio
                  </Button>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Save Dashboard Link</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Copy your Looker Studio report URL and paste it below
                  </p>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="embedUrl">Looker Studio URL</Label>
                      <Input
                        id="embedUrl"
                        placeholder="https://lookerstudio.google.com/reporting/..."
                        value={embedUrl}
                        onChange={(e) => setEmbedUrl(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <Button onClick={handleSave}>
                      Connect Looker Studio
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Tips */}
          <Card className="p-6 bg-blue-50 border-blue-200">
            <h3 className="font-semibold mb-2">💡 Quick Tips</h3>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• Make sure your Google Sheet is set to &quot;Anyone with link can view&quot;</li>
              <li>• In Looker Studio, use charts like: Pie Chart (risk levels), Table (customer list)</li>
              <li>• Your dashboard will open in a new tab for the best experience</li>
              <li>• You can update the data by re-exporting and replacing the Google Sheet</li>
            </ul>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your Analytics Dashboard</h2>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={handleExportToSheets}
                disabled={loading}
              >
                <Download className="h-4 w-4 mr-2" />
                Update Data
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSavedUrl("")}
              >
                Change Report
              </Button>
            </div>
          </div>

          {/* Beautiful Card to Open Dashboard */}
          <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all cursor-pointer">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500 rounded-full p-3">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Looker Studio Dashboard
                    </h3>
                    <p className="text-sm text-gray-600">
                      Connected & Ready
                    </p>
                  </div>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                  <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Risk Trends</p>
                  <p className="text-xs text-gray-500 mt-1">Track over time</p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                  <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Visual Charts</p>
                  <p className="text-xs text-gray-500 mt-1">Interactive data</p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                  <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Customer List</p>
                  <p className="text-xs text-gray-500 mt-1">Full details</p>
                </div>
              </div>

              {/* CTA */}
              <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Ready to View Your Analytics
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Click below to open your complete dashboard with all charts and insights
                </p>
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={openLookerStudio}
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Open Looker Studio Dashboard
                </Button>
              </div>

              {/* Info Note */}
              <div className="bg-blue-100 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Your dashboard will open in a new tab for the best viewing experience. 
                  This ensures all interactive features, filters, and full-screen options work perfectly.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}