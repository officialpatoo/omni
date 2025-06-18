
"use client";

import React, { useState, useEffect, ChangeEvent } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCircle, Edit3, Save, Loader2, Bell, Palette, Cpu, CreditCard, ShieldCheck, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile, AppSettings } from '@/types';
import { useTheme, type PreferredTheme } from '@/hooks/use-theme'; 

const LOCAL_STORAGE_PROFILE_KEY_PREFIX = 'patoovision_profile_';
const LOCAL_STORAGE_APP_SETTINGS_KEY_PREFIX = 'patoovision_app_settings_';

export default function ProfilePage() {
  const { user, isLoading: isLoadingAuth } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [_activeTheme, setPreferredThemeGlobal, preferredThemeFromHook] = useTheme();


  const [profile, setProfile] = useState<UserProfile>({ displayName: '', bio: '' });
  const [appSettings, setAppSettings] = useState<AppSettings>({
    aiModel: 'googleai/gemini-2.0-flash',
    theme: preferredThemeFromHook, // Initialize with theme from global hook
    notificationsEnabled: true,
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [_isSavingSettings, _setIsSavingSettings] = useState(false); // isSavingSettings not used, can be removed if not planned

  const getProfileStorageKey = React.useCallback(() => user ? `${LOCAL_STORAGE_PROFILE_KEY_PREFIX}${user.uid}` : null, [user]);
  const getAppSettingsStorageKey = React.useCallback(() => user ? `${LOCAL_STORAGE_APP_SETTINGS_KEY_PREFIX}${user.uid}` : null, [user]);

  useEffect(() => {
    if (!isLoadingAuth && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoadingAuth, router]);

  useEffect(() => {
    if (user) {
      const profileKey = getProfileStorageKey();
      if (profileKey) {
        const storedProfile = localStorage.getItem(profileKey);
        if (storedProfile) {
          setProfile(JSON.parse(storedProfile));
        } else {
          setProfile({
            displayName: user.displayName || '',
            bio: '',
            photoURL: user.photoURL || '',
            email: user.email || ''
          });
        }
      }
      
      const settingsKey = getAppSettingsStorageKey();
      if (settingsKey) {
        const storedSettingsData = localStorage.getItem(settingsKey);
        if (storedSettingsData) {
          const parsedSettings = JSON.parse(storedSettingsData) as AppSettings;
          const effectiveThemePreference = parsedSettings.theme || preferredThemeFromHook;
          
          setAppSettings({
            ...appSettings, // keep defaults for other settings if not in parsedSettings
            ...parsedSettings,
            theme: effectiveThemePreference
          });
          
          setPreferredThemeGlobal(effectiveThemePreference);
        } else {
          // No specific app settings stored, ensure local appSettings.theme matches hook's default
           setAppSettings(prev => ({...prev, theme: preferredThemeFromHook }));
        }
      }
    }
  }, [user, isLoadingAuth, preferredThemeFromHook, setPreferredThemeGlobal, getAppSettingsStorageKey, getProfileStorageKey]);


  const handleProfileChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = () => {
    const profileKey = getProfileStorageKey();
    if (user && profileKey) {
      setIsSavingProfile(true);
      localStorage.setItem(profileKey, JSON.stringify(profile));
      setTimeout(() => { 
        setIsSavingProfile(false);
        toast({ title: "Profile Updated", description: "Your profile information has been saved." });
      }, 1000);
    }
  };

  const handleSettingsChange = (key: keyof AppSettings, value: any) => {
    setAppSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      const settingsKey = getAppSettingsStorageKey();
      if (user && settingsKey) {
        localStorage.setItem(settingsKey, JSON.stringify(newSettings));
        if (key === 'theme') {
          setPreferredThemeGlobal(value as PreferredTheme); 
        }
      }
      return newSettings;
    });
  };

  if (isLoadingAuth || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Profile & Settings</h1>
        <p className="mt-2 text-lg text-muted-foreground">Manage your account details and application preferences.</p>
      </header>

      <div className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <UserCircle className="mr-3 h-6 w-6 text-primary" />
              Profile Information
            </CardTitle>
            <CardDescription>View and update your personal details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.photoURL || undefined} alt={profile.displayName || user.email || "User"} data-ai-hint="profile avatar"/>
                <AvatarFallback className="text-2xl">
                    {profile.displayName ? profile.displayName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : <UserCircle/>)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-muted-foreground">Logged in as</p>
                <p className="font-medium text-foreground">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input 
                  id="displayName" 
                  name="displayName"
                  value={profile.displayName || ''} 
                  onChange={handleProfileChange} 
                  placeholder="Your Name"
                />
              </div>
               <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea 
                  id="bio" 
                  name="bio"
                  value={profile.bio || ''} 
                  onChange={handleProfileChange} 
                  placeholder="Tell us a little about yourself" 
                  rows={3} 
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                {isSavingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Settings className="mr-3 h-6 w-6 text-primary" />
              Application Preferences
            </CardTitle>
            <CardDescription>Customize your experience within the application.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="aiModel" className="flex items-center"><Cpu className="mr-2 h-4 w-4 text-muted-foreground" /> AI Model</Label>
              <Select 
                value={appSettings.aiModel} 
                onValueChange={(value) => handleSettingsChange('aiModel', value)}
              >
                <SelectTrigger id="aiModel" className="w-full sm:w-[280px]">
                  <SelectValue placeholder="Select AI Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="googleai/gemini-2.0-flash">Gemini 2.0 Flash (Default)</SelectItem>
                  <SelectItem value="googleai/gemini-pro">Gemini Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme" className="flex items-center"><Palette className="mr-2 h-4 w-4 text-muted-foreground" /> Theme</Label>
              <Select
                value={appSettings.theme}
                onValueChange={(value) => handleSettingsChange('theme', value as PreferredTheme)}
              >
                <SelectTrigger id="theme" className="w-full sm:w-[280px]">
                  <SelectValue placeholder="Select Theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System Default</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="notificationsEnabled" className="text-base flex items-center"><Bell className="mr-2 h-4 w-4 text-muted-foreground" /> Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable app notifications.
                </p>
              </div>
              <Switch
                id="notificationsEnabled"
                checked={!!appSettings.notificationsEnabled}
                onCheckedChange={(checked) => handleSettingsChange('notificationsEnabled', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Separator />
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <CreditCard className="mr-3 h-6 w-6 text-primary" />
              Subscription Management
            </CardTitle>
            <CardDescription>View your current plan and manage your subscription.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-foreground">Current Plan</p>
              <p className="text-lg font-semibold text-primary">Free Tier</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" disabled>Upgrade Plan</Button>
              <Button variant="ghost" disabled>Manage Subscription</Button>
            </div>
             <p className="text-xs text-muted-foreground pt-2">Subscription management is not yet implemented.</p>
          </CardContent>
        </Card>

         <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <ShieldCheck className="mr-3 h-6 w-6 text-primary" />
              Security
            </CardTitle>
            <CardDescription>Manage your account security settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" disabled>Change Password</Button>
            <p className="text-xs text-muted-foreground pt-2">Advanced security features are planned for future updates.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
