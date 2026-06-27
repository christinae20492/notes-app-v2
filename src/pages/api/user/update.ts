import { NextApiRequest, NextApiResponse } from "next";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PATCH") {
    res.setHeader("Allow", ["PATCH"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const supabase = createSupabaseServerClient(req, res);
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (!user) {
    return res.status(401).json({ message: "Unauthorized: No active session." });
  }

  const userId = user.id;
  const { username, email, currentPassword, newPassword } = req.body;

  try {
    const authUpdates: { email?: string; password?: string; data?: Record<string, any> } = {};
    const profileUpdates: { username?: string; email?: string } = {};

    if (username !== undefined) {
      const trimmed = username.trim();
      if (!trimmed) return res.status(400).json({ message: "Username cannot be empty." });
      if (trimmed !== user.user_metadata?.username) {
        authUpdates.data = { ...(authUpdates.data ?? {}), username: trimmed };
        profileUpdates.username = trimmed;
      }
    }

    if (email !== undefined) {
      const trimmed = email.trim().toLowerCase();
      if (!trimmed) return res.status(400).json({ message: "Email cannot be empty." });
      if (trimmed !== user.email) {
        authUpdates.email = trimmed;
        profileUpdates.email = trimmed;
      }
    }

    if (newPassword !== undefined) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required to change password." });
      }
      // Verify current password by re-authenticating
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword,
      });
      if (signInError) {
        return res.status(401).json({ message: "Incorrect current password." });
      }
      const trimmedNew = newPassword.trim();
      if (trimmedNew.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters long." });
      }
      authUpdates.password = trimmedNew;
    }

    if (Object.keys(authUpdates).length === 0 && Object.keys(profileUpdates).length === 0) {
      return res.status(200).json({ message: "No changes detected to update." });
    }

    if (Object.keys(authUpdates).length > 0) {
      const { error: updateError } = await supabase.auth.updateUser(authUpdates);
      if (updateError) {
        if (updateError.message.toLowerCase().includes("already")) {
          return res.status(409).json({ message: "Email is already in use." });
        }
        return res.status(500).json({ message: "Failed to update auth credentials." });
      }
    }

    if (Object.keys(profileUpdates).length > 0) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update(profileUpdates)
        .eq("id", userId);

      if (profileError) {
        if (profileError.code === "23505") {
          const msg = profileError.message.includes("username")
            ? "Username is already taken."
            : "Email is already in use.";
          return res.status(409).json({ message: msg });
        }
        return res.status(500).json({ message: "Failed to update profile." });
      }
    }

    return res.status(200).json({ message: "Profile updated successfully!" });
  } catch (error) {
    console.error("API: Error updating user profile:", error);
    return res.status(500).json({ message: "Internal server error during profile update." });
  }
}
