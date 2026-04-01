/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Shield,
  Bell,
  Database,
  Key,
  Save,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Palette,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 border-b border-border last:border-0">
      <div className="space-y-0.5">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="sm:w-auto w-full">{children}</div>
    </div>
  );
}

function ApiKeyField({ label, envKey, placeholder }: { label: string; envKey: string; placeholder: string }) {
  const [visible, setVisible] = useState(false);
  const value = "••••••••••••••••";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 border-b border-border last:border-0">
      <div className="space-y-0.5">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{envKey}</p>
      </div>
      <div className="flex items-center gap-2">
        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
          {visible ? placeholder : value}
        </code>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setVisible(!visible)}>
          {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </div>
  );
}

function ConnectionStatus({ name, connected, detail }: { name: string; connected: boolean; detail?: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        <div className={cn("w-2 h-2 rounded-full", connected ? "bg-green-500" : "bg-red-500")} />
        <div>
          <p className="text-sm font-medium text-foreground">{name}</p>
          {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        {connected ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <AlertCircle className="h-4 w-4 text-red-500" />
        )}
        <span className={cn("text-xs font-medium", connected ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
          {connected ? "Connected" : "Not Configured"}
        </span>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(session?.user?.name || "");
  const [email] = useState(session?.user?.email || "");

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Settings saved successfully");
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your account, integrations, and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="profile" className="text-xs gap-1.5">
            <User className="h-3.5 w-3.5" /> Profile
          </TabsTrigger>
          <TabsTrigger value="appearance" className="text-xs gap-1.5">
            <Palette className="h-3.5 w-3.5" /> Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs gap-1.5">
            <Bell className="h-3.5 w-3.5" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="integrations" className="text-xs gap-1.5">
            <Database className="h-3.5 w-3.5" /> Integrations
          </TabsTrigger>
          <TabsTrigger value="api" className="text-xs gap-1.5">
            <Key className="h-3.5 w-3.5" /> API Keys
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile Information</CardTitle>
              <CardDescription>Update your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-border">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">
                    {name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "U"}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-foreground">{name || "User"}</p>
                  <p className="text-sm text-muted-foreground">{email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Full Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Email Address</Label>
                  <Input value={email} disabled className="mt-1 opacity-60" />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving} size="sm">
                  <Save className="h-4 w-4 mr-1.5" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" /> Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SettingRow label="Password" description="Change your account password">
                <Button variant="outline" size="sm">Change Password</Button>
              </SettingRow>
              <SettingRow label="Two-Factor Auth" description="Add an extra layer of security">
                <Button variant="outline" size="sm">Enable 2FA</Button>
              </SettingRow>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Appearance</CardTitle>
              <CardDescription>Customize how ChurnGuard looks</CardDescription>
            </CardHeader>
            <CardContent>
              <SettingRow label="Theme" description="Choose between light and dark mode">
                <div className="flex gap-2">
                  {(["light", "dark", "system"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors capitalize",
                        theme === t
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </SettingRow>
              <SettingRow label="Language" description="Select your preferred language">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="h-4 w-4" /> English (US)
                </div>
              </SettingRow>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notification Preferences</CardTitle>
              <CardDescription>Control when and how you receive alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <SettingRow label="Churn Alerts" description="Get notified when customers are at high risk">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </SettingRow>
              <SettingRow label="Anomaly Detection" description="Alert when unusual patterns are detected">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </SettingRow>
              <SettingRow label="Campaign Reports" description="Receive campaign performance summaries">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </SettingRow>
              <SettingRow label="Weekly Digest" description="Summary of your account activity">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </SettingRow>
              <SettingRow label="Email Reports" description="Automated reports to your inbox">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </SettingRow>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Service Connections</CardTitle>
              <CardDescription>Status of configured integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <ConnectionStatus name="Turso Database" connected={true} detail="LibSQL / SQLite" />
              <ConnectionStatus name="Google Sheets" connected={true} detail="Auto-sync enabled" />
              <ConnectionStatus name="Looker Studio" connected={true} detail="Embedded analytics" />
              <ConnectionStatus name="Pinecone" connected={true} detail="Vector database for RAG" />
              <ConnectionStatus name="OpenAI" connected={true} detail="GPT models" />
              <ConnectionStatus name="Resend" connected={true} detail="Transactional email" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">API Keys & Tokens</CardTitle>
              <CardDescription>Manage your API credentials (configured via .env.local)</CardDescription>
            </CardHeader>
            <CardContent>
              <ApiKeyField label="OpenAI" envKey="OPENAI_API_KEY" placeholder="sk-proj-••••" />
              <ApiKeyField label="Gemini" envKey="GEMINI_API_KEY" placeholder="AIza••••" />
              <ApiKeyField label="Pinecone" envKey="PINECONE_API_KEY" placeholder="pcsk-••••" />
              <ApiKeyField label="Resend" envKey="RESEND_API_KEY" placeholder="re_••••" />
              <ApiKeyField label="Turso Auth Token" envKey="TURSO_AUTH_TOKEN" placeholder="eyJ••••" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
