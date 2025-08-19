import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Bell, Mail, Smartphone, Calendar } from 'lucide-react';

interface NotificationPreferences {
  id?: string;
  userId: string;
  messageInApp: boolean;
  messageEmail: boolean;
  messagePush: boolean;
  likeInApp: boolean;
  likeEmail: boolean;
  likePush: boolean;
  commentInApp: boolean;
  commentEmail: boolean;
  commentPush: boolean;
  feedbackInApp: boolean;
  feedbackEmail: boolean;
  feedbackPush: boolean;
  weeklyDigest: boolean;
}

export function NotificationPreferences() {
  const queryClient = useQueryClient();
  
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['/api/notification-preferences'],
  });

  const [localPreferences, setLocalPreferences] = useState<NotificationPreferences | null>(null);

  // Use local preferences if available, otherwise use server data with defaults
  const currentPreferences = localPreferences || preferences || {
    messageInApp: true,
    messageEmail: false,
    messagePush: false,
    likeInApp: true,
    likeEmail: false,
    likePush: false,
    commentInApp: true,
    commentEmail: false,
    commentPush: false,
    feedbackInApp: true,
    feedbackEmail: false,
    feedbackPush: false,
    weeklyDigest: true,
  };

  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: Partial<NotificationPreferences>) => {
      const response = await fetch('/api/notification-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newPreferences),
      });
      if (!response.ok) throw new Error('Failed to update preferences');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notification-preferences'] });
      setLocalPreferences(null); // Clear local state
      toast({
        title: 'Preferences updated',
        description: 'Your notification preferences have been saved.',
      });
    },
  });

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean) => {
    const updated = { ...currentPreferences, [key]: value } as NotificationPreferences;
    setLocalPreferences(updated);
  };

  const handleSave = () => {
    if (localPreferences) {
      updatePreferencesMutation.mutate(localPreferences);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Loading your preferences...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const notificationTypes = [
    {
      key: 'message',
      title: 'New Messages',
      description: 'When someone sends you a private message',
      icon: <Bell className="h-4 w-4" />,
    },
    {
      key: 'like',
      title: 'Post Likes',
      description: 'When someone likes your posts',
      icon: <Bell className="h-4 w-4" />,
    },
    {
      key: 'comment',
      title: 'Post Comments',
      description: 'When someone comments on your posts',
      icon: <Bell className="h-4 w-4" />,
    },
    {
      key: 'feedback',
      title: 'Feedback Received',
      description: 'When someone leaves you feedback',
      icon: <Bell className="h-4 w-4" />,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose how you want to be notified about different activities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {notificationTypes.map((type) => (
          <div key={type.key} className="space-y-4">
            <div className="flex items-center gap-3">
              {type.icon}
              <div>
                <h4 className="font-medium">{type.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{type.description}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 ml-7">
              <div className="flex items-center space-x-2">
                <Switch
                  id={`${type.key}-app`}
                  checked={(currentPreferences as any)?.[`${type.key}InApp`] ?? true}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange(`${type.key}InApp` as keyof NotificationPreferences, checked)
                  }
                />
                <Label htmlFor={`${type.key}-app`} className="flex items-center gap-2">
                  <Bell className="h-3 w-3" />
                  In-app
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id={`${type.key}-email`}
                  checked={(currentPreferences as any)?.[`${type.key}Email`] ?? false}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange(`${type.key}Email` as keyof NotificationPreferences, checked)
                  }
                />
                <Label htmlFor={`${type.key}-email`} className="flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  Email
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id={`${type.key}-push`}
                  checked={(currentPreferences as any)?.[`${type.key}Push`] ?? false}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange(`${type.key}Push` as keyof NotificationPreferences, checked)
                  }
                />
                <Label htmlFor={`${type.key}-push`} className="flex items-center gap-2">
                  <Smartphone className="h-3 w-3" />
                  Push
                </Label>
              </div>
            </div>
            
            <Separator />
          </div>
        ))}
        
        {/* Weekly Digest */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4" />
            <div>
              <h4 className="font-medium">Weekly Digest</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive a weekly summary of your activity and connections
              </p>
            </div>
          </div>
          
          <div className="ml-7">
            <div className="flex items-center space-x-2">
              <Switch
                id="weekly-digest"
                checked={(currentPreferences as any)?.weeklyDigest ?? true}
                onCheckedChange={(checked) => handlePreferenceChange('weeklyDigest', checked)}
              />
              <Label htmlFor="weekly-digest" className="flex items-center gap-2">
                <Mail className="h-3 w-3" />
                Weekly email digest
              </Label>
            </div>
          </div>
        </div>

        {localPreferences && (
          <div className="flex gap-2">
            <Button 
              onClick={handleSave} 
              disabled={updatePreferencesMutation.isPending}
            >
              {updatePreferencesMutation.isPending ? 'Saving...' : 'Save Preferences'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setLocalPreferences(null)}
            >
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}