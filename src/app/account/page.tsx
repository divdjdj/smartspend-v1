"use client";

import { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  KeyRound, 
  Shield, 
  Calendar, 
  DollarSign, 
  Loader2, 
  Save, 
  Lock,
  UserCheck
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface ProfileData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  role: 'customer' | 'admin';
  status: string;
  accountBalance: number;
  createdAt: string;
}

export default function AccountSettingsPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'personal' | 'security'>('personal');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/customer/profile");
        const data = await res.json();
        
        if (res.ok && data.user) {
          setProfile(data.user);
          setFirstName(data.user.firstName);
          setLastName(data.user.lastName);
          setPhone(data.user.phone);
        } else {
          throw new Error(data.error || "Failed to retrieve profile data.");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error loading profile details.";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      toast.error("First name is required.");
      return;
    }

    setSavingProfile(true);
    try {
      const res = await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
        }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Profile information updated successfully!");
        if (profile) {
          setProfile({
            ...profile,
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            fullName: data.user.fullName,
            phone: data.user.phone,
          });
        }
      } else {
        throw new Error(data.error || "Failed to update profile.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error saving profile.";
      toast.error(message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        throw new Error(data.error || "Failed to change password.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error changing password.";
      toast.error(message);
    } finally {
      setSavingPassword(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-40 gap-3 text-muted-foreground bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
        <span>Loading account settings...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-40 text-center text-muted-foreground bg-background">
        <Shield className="h-12 w-12 opacity-30 text-destructive mb-3" />
        <h4 className="font-semibold text-lg text-foreground">Failed to Load Profile</h4>
        <p className="text-sm max-w-sm mt-1">Please log in again or refresh to view your profile settings.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-10 space-y-8 bg-background relative overflow-y-auto">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-15%] w-[40%] h-[40%] bg-brand/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[40%] h-[40%] bg-teal-mid/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10">
        <h2 className="text-3xl font-display font-bold tracking-tight text-foreground">
          Account Settings
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your personal details, secure your account credentials, and check your profile status.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 max-w-6xl">
        {/* Left Side: Profile Summary Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-3xl p-6 shadow-elegant flex flex-col items-center text-center relative overflow-hidden">
            {/* Overlay glow */}
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-brand/10 blur-xl pointer-events-none" />

            {/* Initials Avatar */}
            <div className="h-20 w-20 rounded-2xl bg-brand/10 text-brand flex items-center justify-center font-extrabold text-2xl uppercase shadow-soft border border-brand/10 mb-4">
              {profile.firstName ? profile.firstName[0] : ""}{profile.lastName ? profile.lastName[0] : ""}
            </div>

            {/* Profile Info */}
            <h3 className="text-lg font-bold text-foreground">{profile.fullName}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{profile.email}</p>

            <div className="flex gap-2 mt-3.5">
              <Badge variant="outline" className={`capitalize font-semibold border ${
                profile.role === 'admin' 
                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                  : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
              }`}>
                {profile.role}
              </Badge>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 capitalize font-medium">
                {profile.status}
              </Badge>
            </div>

            {/* Metadata metrics */}
            <div className="w-full border-t border-border/10 mt-6 pt-5 grid grid-cols-2 gap-4 text-left">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Wallet Balance</span>
                <span className="text-base font-bold text-emerald-400 flex items-center"><DollarSign className="h-4 w-4 shrink-0 -ml-1 text-emerald-400" /> ₹{profile.accountBalance}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Member Since</span>
                <span className="text-xs font-semibold text-foreground flex items-center gap-1 mt-0.5"><Calendar className="h-3.5 w-3.5 opacity-60" /> {formatDate(profile.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Settings Forms Tabs Container */}
        <div className="lg:col-span-8 space-y-6">
          {/* Form Tabs selectors */}
          <div className="flex border-b border-border/10 gap-6">
            <button
              onClick={() => setActiveTab('personal')}
              className={`pb-3 text-sm font-semibold transition-all relative cursor-pointer ${
                activeTab === 'personal' 
                  ? 'text-brand font-bold' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Personal Details
              {activeTab === 'personal' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`pb-3 text-sm font-semibold transition-all relative cursor-pointer ${
                activeTab === 'security' 
                  ? 'text-brand font-bold' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In & Security
              {activeTab === 'security' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-full" />
              )}
            </button>
          </div>

          {/* Settings forms panels */}
          <div className="bg-card/20 backdrop-blur-xl border border-border/10 rounded-3xl p-6 sm:p-8 shadow-elegant">
            {activeTab === 'personal' ? (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* First Name */}
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 opacity-60" /> First Name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      required
                      placeholder="e.g. John"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      className="w-full bg-soft/40 border border-border/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand/40 focus:ring-1 focus:ring-brand/40 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Last Name */}
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 opacity-60" /> Last Name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      placeholder="e.g. Doe"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      className="w-full bg-soft/40 border border-border/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand/40 focus:ring-1 focus:ring-brand/40 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Phone */}
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 opacity-60" /> Mobile / WhatsApp
                    </label>
                    <input
                      id="phone"
                      type="text"
                      placeholder="e.g. +91 9999999999"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full bg-soft/40 border border-border/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand/40 focus:ring-1 focus:ring-brand/40 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Email (Read-Only) */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 opacity-40" /> Email Address
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        type="email"
                        disabled
                        value={profile.email}
                        className="w-full bg-soft/20 border border-border/5 rounded-xl px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed select-none"
                      />
                      <Badge className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-foreground/10 text-muted-foreground hover:bg-foreground/15 border-0 font-normal py-0 px-2 text-[10px] flex items-center gap-1 select-none">
                        <Lock className="h-2.5 w-2.5 opacity-55" /> Locked
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Account Role (Read-Only) */}
                  <div className="space-y-2">
                    <label htmlFor="role" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5 opacity-40" /> Account Role
                    </label>
                    <div className="relative">
                      <input
                        id="role"
                        type="text"
                        disabled
                        value={profile.role.toUpperCase()}
                        className="w-full bg-soft/20 border border-border/5 rounded-xl px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed select-none font-semibold"
                      />
                      <Badge className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-foreground/10 text-muted-foreground hover:bg-foreground/15 border-0 font-normal py-0 px-2 text-[10px] flex items-center gap-1 select-none">
                        <Lock className="h-2.5 w-2.5 opacity-55" /> Locked
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Save button */}
                <div className="flex justify-end pt-2 border-t border-border/10 mt-6">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md hover:brightness-110 active:scale-[0.99] disabled:opacity-50 cursor-pointer transition-all"
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
                        Saving Profile...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" /> Save Information
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleUpdatePassword} className="space-y-6">
                {/* Current Password */}
                <div className="space-y-2">
                  <label htmlFor="currentPass" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5 opacity-60" /> Current Password
                  </label>
                  <input
                    id="currentPass"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full bg-soft/40 border border-border/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand/40 focus:ring-1 focus:ring-brand/40 focus:outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* New Password */}
                  <div className="space-y-2">
                    <label htmlFor="newPass" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <KeyRound className="h-3.5 w-3.5 opacity-60 text-brand" /> New Password
                    </label>
                    <input
                      id="newPass"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full bg-soft/40 border border-border/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand/40 focus:ring-1 focus:ring-brand/40 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label htmlFor="confirmPass" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <KeyRound className="h-3.5 w-3.5 opacity-60" /> Confirm New Password
                    </label>
                    <input
                      id="confirmPass"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full bg-soft/40 border border-border/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand/40 focus:ring-1 focus:ring-brand/40 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Save button */}
                <div className="flex justify-end pt-2 border-t border-border/10 mt-6">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md hover:brightness-110 active:scale-[0.99] disabled:opacity-50 cursor-pointer transition-all"
                  >
                    {savingPassword ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
                        Changing Password...
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4" /> Change Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
