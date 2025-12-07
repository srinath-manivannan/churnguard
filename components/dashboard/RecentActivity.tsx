/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================
// RECENT ACTIVITY COMPONENT (FIXED)
// ============================================
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { MessageSquare, User, Mail } from "lucide-react";

interface RecentActivityProps {
  userId: string;
}

export default function RecentActivity({ userId }: RecentActivityProps) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch recent activity
    const fetchActivities = async () => {
      try {
        // Placeholder data for now
        const placeholderActivities = [
          {
            id: 1,
            type: "chat",
            message: "Asked about high-risk customers",
            time: new Date(Date.now() - 1000 * 60 * 5),
          },
          {
            id: 2,
            type: "customer",
            message: "New customer added: Acme Corp",
            time: new Date(Date.now() - 1000 * 60 * 30),
          },
          {
            id: 3,
            type: "campaign",
            message: "Campaign 'Win-back Offer' sent to 25 customers",
            time: new Date(Date.now() - 1000 * 60 * 120),
          },
        ];

        setActivities(placeholderActivities);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load activities:", error);
        setLoading(false);
      }
    };

    fetchActivities();
  }, [userId]);

  const getIcon = (type: string) => {
    switch (type) {
      case "chat":
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case "customer":
        return <User className="h-5 w-5 text-green-500" />;
      case "campaign":
        return <Mail className="h-5 w-5 text-purple-500" />;
      default:
        return <MessageSquare className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500">Loading activity...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="mt-1">{getIcon(activity.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(activity.time)}
                  </p>
                </div>
              </div>
            ))}

            {activities.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No recent activity
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}