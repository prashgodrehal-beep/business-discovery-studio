"use client";

import { BusinessProfile } from "@/lib/types";
import ProfileForm from "../ProfileForm";
import { StepHeading } from "../ResultsPrimitives";

interface Props {
  profile: BusinessProfile;
  setProfile: (updater: (prev: BusinessProfile) => BusinessProfile) => void;
}

export default function BusinessProfileStep({ profile, setProfile }: Props) {
  return (
    <div>
      <StepHeading
        eyebrow="Step 2"
        title="Business profile"
        lead="Capture enough context to understand the business model, customers, scale, and where it hurts today."
      />
      <ProfileForm profile={profile} setProfile={setProfile} />
    </div>
  );
}
