/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================
// CREATE CAMPAIGN PAGE
// ============================================
// Multi-step wizard to create retention campaigns

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, ArrowLeft, Send, Wand2 } from "lucide-react";

export default function CreateCampaignPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [campaignData, setCampaignData] = useState({
    name: "",
    type: "email",
    targetRiskLevel: "high",
    targetSegment: "all",
    emailSubject: "",
    emailTemplate: "",
    smsTemplate: "",
  });

  // Update form data
  const updateField = (field: string, value: any) => {
    setCampaignData((prev) => ({ ...prev, [field]: value }));
  };

  // AI personalization
  const handlePersonalize = async () => {
    setLoading(true);
    try {
      // This would call the personalization API
      // For now, just show a toast
      toast({
        title: "AI Personalization",
        description: "Feature coming soon! Messages will be personalized for each customer.",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Personalization failed",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create campaign
  const handleCreate = async () => {
    setLoading(true);
    try {
      // Validate
      if (!campaignData.name) {
        throw new Error("Campaign name is required");
      }

      if (campaignData.type === "email" && !campaignData.emailTemplate) {
        throw new Error("Email template is required");
      }

      // Create campaign
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...campaignData,
          targetFilter: JSON.stringify({
            riskLevel: campaignData.targetRiskLevel,
            segment: campaignData.targetSegment,
          }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create campaign");
      }

      toast({
        title: "Campaign created!",
        description: "Your retention campaign is ready to send.",
      });

      router.push("/dashboard/campaigns");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to create campaign",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Campaign</h1>
        <p className="text-gray-500 mt-1">
          Build a retention campaign to engage at-risk customers
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                currentStep >= step
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {step}
            </div>
            {step < 4 && (
              <div
                className={`w-12 h-1 ${
                  currentStep > step ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {/* STEP 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Campaign Details</h2>

                {/* Campaign Name */}
                <div className="space-y-2 mb-4">
                  <Label htmlFor="name">Campaign Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Win-back Offer Q4"
                    value={campaignData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                  />
                </div>

                {/* Campaign Type */}
                <div className="space-y-2">
                  <Label>Campaign Type</Label>
                  <Select
                    value={campaignData.type}
                    onValueChange={(value) => updateField("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email Only</SelectItem>
                      <SelectItem value="sms">SMS Only</SelectItem>
                      <SelectItem value="both">Email + SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Target Audience */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Target Audience</h2>

                {/* Risk Level */}
                <div className="space-y-2 mb-4">
                  <Label>Customer Risk Level</Label>
                  <Select
                    value={campaignData.targetRiskLevel}
                    onValueChange={(value) =>
                      updateField("targetRiskLevel", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Risk Levels</SelectItem>
                      <SelectItem value="critical">Critical Risk Only</SelectItem>
                      <SelectItem value="high">High Risk Only</SelectItem>
                      <SelectItem value="medium">Medium Risk Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Segment */}
                <div className="space-y-2">
                  <Label>Customer Segment</Label>
                  <Select
                    value={campaignData.targetSegment}
                    onValueChange={(value) => updateField("targetSegment", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Segments</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                      <SelectItem value="smb">SMB</SelectItem>
                      <SelectItem value="startup">Startup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Preview Count */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">Estimated Recipients:</span>{" "}
                    This campaign will target customers matching your criteria.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Message Content */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Message Content</h2>
                <Button
                  variant="outline"
                  onClick={handlePersonalize}
                  disabled={loading}
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  AI Personalize
                </Button>
              </div>

              <Tabs defaultValue="email">
                <TabsList>
                  <TabsTrigger value="email">Email</TabsTrigger>
                  {campaignData.type !== "email" && (
                    <TabsTrigger value="sms">SMS</TabsTrigger>
                  )}
                </TabsList>

                {/* Email Tab */}
                <TabsContent value="email" className="space-y-4">
                  {/* Subject */}
                  <div className="space-y-2">
                    <Label htmlFor="subject">Email Subject</Label>
                    <Input
                      id="subject"
                      placeholder="We miss you at..."
                      value={campaignData.emailSubject}
                      onChange={(e) =>
                        updateField("emailSubject", e.target.value)
                      }
                    />
                  </div>

                  {/* Template */}
                  <div className="space-y-2">
                    <Label htmlFor="template">Email Template</Label>
                    <Textarea
                      id="template"
                      placeholder="Hi {{name}},&#10;&#10;We noticed you haven't been active lately...&#10;&#10;Variables: {{name}}, {{company}}, {{churn_score}}"
                      value={campaignData.emailTemplate}
                      onChange={(e) =>
                        updateField("emailTemplate", e.target.value)
                      }
                      rows={10}
                    />
                    <p className="text-xs text-gray-500">
                      Use variables like {"{"}
                      {"{"}name{"}"} {"}"}to personalize messages
                    </p>
                  </div>
                </TabsContent>

                {/* SMS Tab */}
                {campaignData.type !== "email" && (
                  <TabsContent value="sms" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="smsTemplate">SMS Message</Label>
                      <Textarea
                        id="smsTemplate"
                        placeholder="Hi {{name}}! We have a special offer..."
                        value={campaignData.smsTemplate}
                        onChange={(e) =>
                          updateField("smsTemplate", e.target.value)
                        }
                        rows={5}
                        maxLength={160}
                      />
                      <p className="text-xs text-gray-500">
                        SMS messages are limited to 160 characters
                      </p>
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          )}

          {/* STEP 4: Review & Send */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Review Campaign</h2>

              <div className="space-y-4">
                {/* Campaign Summary */}
                <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Campaign Name:</span>
                    <span className="text-sm font-medium">{campaignData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Type:</span>
                    <span className="text-sm font-medium capitalize">
                      {campaignData.type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Target:</span>
                    <span className="text-sm font-medium">
                      {campaignData.targetRiskLevel} risk,{" "}
                      {campaignData.targetSegment} segment
                    </span>
                  </div>
                </div>

                {/* Preview */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <p className="text-sm font-medium mb-2">Email Preview:</p>
                  <p className="text-sm text-gray-600">
                    Subject: {campaignData.emailSubject || "(No subject)"}
                  </p>
                  <div className="mt-3 p-3 bg-gray-50 rounded text-sm whitespace-pre-wrap">
                    {campaignData.emailTemplate || "(No content)"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={currentStep === 1 || loading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep < 4 ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={loading}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleCreate} disabled={loading}>
                {loading ? (
                  "Creating..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Create Campaign
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

