"use client"

import * as React from "react"
import { Loader2, User as UserIcon, IndianRupee, Settings } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClientItem, CodeItem } from "@/types/referral"
import { PersonalTab } from "./profile-tabs/personal-tab"
import { EarningsTab } from "./profile-tabs/earnings-tab"
import { SettingsTab } from "./profile-tabs/settings-tab"
import { ReferredClientsTab } from "./profile-tabs/referred-clients-tab"


interface UserProfilePanelProps {
  selectedProfileClient: ClientItem | null
  setSelectedProfileClient: (client: ClientItem | null) => void
  profileLoading: boolean
  profileStats: { purchase: number; sale: number; commission: number; cashEarned: number }
  profileCodes: CodeItem[] // Should be properly typed if possible
  handleCopyLink: (code: string) => void
  handleWhatsAppShare: (code: string) => void
  handleToggleProfileCodeStatus: (id: string, status: boolean) => void
  handleGenerateProfileCode: (e: React.FormEvent) => void
  profileNewLinkName: string
  setProfileNewLinkName: (val: string) => void
  profileCreatingCode: boolean
  profileFirstName: string
  setProfileFirstName: (val: string) => void
  profileLastName: string
  setProfileLastName: (val: string) => void
  profileEmail: string
  setProfileEmail: (val: string) => void
  profilePhone: string
  setProfilePhone: (val: string) => void
  profileStatus: string
  setProfileStatus: (val: string) => void
  profilePassword?: string
  setProfilePassword?: (val: string) => void
  profileEmailVerified?: boolean
  setProfileEmailVerified?: (val: boolean) => void
  handleUpdateProfileClient: (e: React.FormEvent) => void
  profileUpdating: boolean
}

export function UserProfilePanel({
  selectedProfileClient,
  setSelectedProfileClient,
  profileLoading,
  profileStats,
  profileCodes,
  handleCopyLink,
  handleWhatsAppShare,
  handleToggleProfileCodeStatus,
  handleGenerateProfileCode,
  profileNewLinkName,
  setProfileNewLinkName,
  profileCreatingCode,
  profileFirstName,
  setProfileFirstName,
  profileLastName,
  setProfileLastName,
  profileEmail,
  setProfileEmail,
  profilePhone,
  setProfilePhone,
  profileStatus,
  setProfileStatus,
  profilePassword = "",
  setProfilePassword = () => {},
  profileEmailVerified = false,
  setProfileEmailVerified = () => {},
  handleUpdateProfileClient,
  profileUpdating,
}: UserProfilePanelProps) {
  const [profileActiveTab, setProfileActiveTab] = React.useState<"personal" | "clients" | "earnings" | "settings">("clients")

  return (
    <Sheet open={!!selectedProfileClient} onOpenChange={(open) => !open && setSelectedProfileClient(null)}>
      <SheetContent side="right" className="w-full sm:max-w-[650px]! overflow-y-auto bg-card border-border/10">
        {selectedProfileClient && (
          <>
            <SheetHeader>
              <SheetTitle className="text-xl font-display font-bold flex items-center gap-2 text-foreground">
                <UserIcon className="h-5 w-5 text-brand" />
                {selectedProfileClient.name}
              </SheetTitle>
              <SheetDescription className="text-xs font-mono">
                ID: {selectedProfileClient._id} | Status: {selectedProfileClient.status}
              </SheetDescription>
            </SheetHeader>

            {profileLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
                <span className="text-xs">Loading profile details...</span>
              </div>
            ) : (
              <div className="m-4 space-y-6">
                <Tabs value={profileActiveTab} onValueChange={(val) => setProfileActiveTab(val as "personal" | "clients" | "earnings" | "settings")}>
                  <TabsList className="bg-card/25 backdrop-blur-xl border border-border/10 w-full justify-start h-auto p-1 rounded-lg">
                    <TabsTrigger value="clients" className="flex-1 data-[state=active]:bg-background">
                      <UserIcon className="h-3.5 w-3.5 mr-1" />
                      Clients
                    </TabsTrigger>
                    <TabsTrigger value="earnings" className="flex-1 data-[state=active]:bg-background">
                      <IndianRupee className="h-3.5 w-3.5 mr-1" />
                      Earnings
                    </TabsTrigger>
                    <TabsTrigger value="personal" className="flex-1 data-[state=active]:bg-background">
                      <UserIcon className="h-3.5 w-3.5 mr-1" />
                      Personal
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="flex-1 data-[state=active]:bg-background">
                      <Settings className="h-3.5 w-3.5 mr-1" />
                      Settings
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="personal">
                    <PersonalTab
                      profileFirstName={profileFirstName}
                      setProfileFirstName={setProfileFirstName}
                      profileLastName={profileLastName}
                      setProfileLastName={setProfileLastName}
                      profileEmail={profileEmail}
                      setProfileEmail={setProfileEmail}
                      profilePhone={profilePhone}
                      setProfilePhone={setProfilePhone}
                      profileStatus={profileStatus}
                      setProfileStatus={setProfileStatus}
                      profilePassword={profilePassword}
                      setProfilePassword={setProfilePassword}
                      profileEmailVerified={profileEmailVerified}
                      setProfileEmailVerified={setProfileEmailVerified}
                      handleUpdateProfileClient={handleUpdateProfileClient}
                      profileUpdating={profileUpdating}
                    />
                  </TabsContent>

                  <TabsContent value="clients">
                    {selectedProfileClient && <ReferredClientsTab clientId={selectedProfileClient._id} />}
                  </TabsContent>

                  <TabsContent value="earnings">
                    <EarningsTab profileStats={profileStats} />
                  </TabsContent>

                  <TabsContent value="settings">
                    <SettingsTab
                      profileCodes={profileCodes}
                      handleCopyLink={handleCopyLink}
                      handleWhatsAppShare={handleWhatsAppShare}
                      handleToggleProfileCodeStatus={handleToggleProfileCodeStatus}
                      handleGenerateProfileCode={handleGenerateProfileCode}
                      profileNewLinkName={profileNewLinkName}
                      setProfileNewLinkName={setProfileNewLinkName}
                      profileCreatingCode={profileCreatingCode}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
