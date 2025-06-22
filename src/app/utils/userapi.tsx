export interface UserProfileUpdates {
  username?: string;
  email?: string;
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

import { Session } from 'next-auth';
import { signOut} from 'next-auth/react';
import { warnToast, failToast, successToast } from './toast';

export const updateUserProfile = async (
  updates: UserProfileUpdates,
  session: Session | null,
  status: string
): Promise<boolean> => {
  if (status === "loading") {
    warnToast("Authentication status is still loading. Please wait.");
    return false;
  }
  if (status === "unauthenticated" || !session?.user?.id) {
    failToast("Please sign in to update your profile.");
    return false;
  }
  if (Object.keys(updates).length === 0) {
    warnToast("No profile changes provided.");
    return false;
  }

  try {
    const response = await fetch('/api/user/update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
      credentials: 'include',
    });

    const result = await response.json();

    if (response.ok) {
      successToast(result.message || "Profile updated successfully!");
      if (updates.username || updates.email) {
        await signOut();
      }
      return true;
    } else {
      failToast(result.message || "Failed to update profile.");
      return false;
    }
  } catch (error) {
    console.error("Client-side error updating profile:", error);
    failToast("An unexpected error occurred during profile update.");
    return false;
  }
};

export const changeUserPassword = async (
  data: PasswordChangeData,
  session: Session | null,
  status: string
): Promise<boolean> => {
  if (status === "loading") {
    warnToast("Authentication status is still loading. Please wait.");
    return false;
  }
  if (status === "unauthenticated" || !session?.user?.id) {
    failToast("Please sign in to change your password.");
    return false;
  }
  if (!data.currentPassword || !data.newPassword) {
    warnToast("Both current and new passwords are required.");
    return false;
  }

  try {
    const response = await fetch('/api/user/update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }),
      credentials: 'include',
    });

    const result = await response.json();

    if (response.ok) {
      successToast(result.message || "Password updated successfully!");
      return true;
    } else {
      failToast(result.message || "Failed to change password.");
      return false;
    }
  } catch (error) {
    console.error("Client-side error changing password:", error);
    failToast("An unexpected error occurred during password change.");
    return false;
  }
};
