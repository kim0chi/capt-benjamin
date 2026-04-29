"use client";

import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Compass,
  LogOut,
  Mail,
  RotateCcw,
  Settings,
  Shield,
  User,
} from "lucide-react";
import { KapitanPortrait } from "@/components/illustrations/KapitanPortrait";
import type { UserProfile } from "@/types";

interface ProfileScreenProps {
  profile: UserProfile;
  onBack: () => void;
  onLogout?: () => void;
  onResetDemo?: () => void;
}

export function ProfileScreen({
  profile,
  onBack,
  onLogout,
  onResetDemo,
}: ProfileScreenProps) {
  const profileLinks = [
    {
      icon: User,
      label: "Captain Details",
      description: `${profile.name} · ${profile.role}`,
    },
    {
      icon: Compass,
      label: "Income Rhythm",
      description: profile.incomeCadence,
    },
    {
      icon: Bell,
      label: "Warning Signals",
      description: "Alerts for leaks, storms, and daily check-ins",
    },
    {
      icon: Shield,
      label: "Security & Lockbox",
      description: "Demo-only flow for this presentation build",
    },
    {
      icon: Mail,
      label: "Communications",
      description: "Captain notes and reminder settings",
    },
    {
      icon: Settings,
      label: "Vessel Settings",
      description: "Currency, app flow, and local demo controls",
    },
  ] as const;

  return (
    <div className="min-h-screen bg-navy pb-8 pirate-page">
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-brass/15 bg-ink/90 px-4 pb-3 pt-safe backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-brass/25 bg-wood-light/45 text-bone transition-colors hover:bg-wood/50"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <p className="pirate-kicker">Captain&apos;s Quarters</p>
            <h1 className="font-display text-2xl font-semibold text-bone">
              Profile
            </h1>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-4 pt-6">
        <div className="rounded-[2rem] pirate-panel px-6 py-8 text-center">
          <div className="mx-auto w-full max-w-[12rem]">
            <KapitanPortrait className="aspect-[4/4.7] w-full rounded-[1.8rem] border border-brass/20" />
          </div>

          <div className="mt-5 space-y-1">
            <h2 className="font-display text-2xl font-bold text-bone">
              {profile.name}
            </h2>
            <p className="text-sm text-sand/80">{profile.role}</p>
          </div>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-brass/20 bg-brass/10 px-4 py-1.5 backdrop-blur-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-brass">
              {profile.incomeCadence}
            </span>
          </div>
        </div>

        <div className="rounded-[28px] pirate-panel p-2">
          {profileLinks.map((link, index) => (
            <button
              key={link.label}
              className={`flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-wood/20 ${
                index !== profileLinks.length - 1
                  ? "border-b border-brass/10"
                  : ""
              }`}
            >
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-wood/30 text-brass">
                  <link.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-bone">
                    {link.label}
                  </p>
                  <p className="truncate text-xs text-sand/60">
                    {link.description}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-sand/40" />
            </button>
          ))}
        </div>

        <div className="space-y-3 px-2 pt-2">
          <button
            onClick={onResetDemo}
            className="flex w-full items-center justify-center gap-2 rounded-3xl border border-brass/24 bg-brass/8 py-4 font-semibold text-brass transition-colors hover:bg-brass/16"
          >
            <RotateCcw className="h-5 w-5" />
            <span>Reset Demo State</span>
          </button>

          <button
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-3xl border border-coral/30 bg-coral/10 py-4 font-semibold text-coral transition-colors hover:bg-coral/20"
          >
            <LogOut className="h-5 w-5" />
            <span>Return to Landing</span>
          </button>
        </div>

        <div className="pb-6 pt-4 text-center">
          <p className="text-xs text-sand/40">Pirate OS Version 1.0.4</p>
          <p className="text-xs text-sand/40">Local guided demo build</p>
        </div>
      </div>
    </div>
  );
}
