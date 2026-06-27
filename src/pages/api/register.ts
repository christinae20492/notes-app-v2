import { NextApiRequest, NextApiResponse } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields (username, email, password) are required." });
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long." });
  }

  const normalizedUsername = username.toLowerCase().trim();
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const admin = createSupabaseAdminClient();

    // Check for duplicate username via the RPC helper (bypasses RLS)
    const { data: existingEmail } = await admin.rpc("get_email_by_username", {
      input_username: normalizedUsername,
    });
    if (existingEmail) {
      return res.status(409).json({ message: "Username is already taken." });
    }

    // Create Supabase auth user; the DB trigger auto-creates the profile row
    const { data, error } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: { username: normalizedUsername },
    });

    if (error) {
      if (
        error.message.toLowerCase().includes("already registered") ||
        error.message.toLowerCase().includes("already exists")
      ) {
        return res.status(409).json({ message: "Email address is already registered." });
      }
      console.error("Supabase registration error:", error);
      return res.status(500).json({ message: "Registration failed. Please try again." });
    }

    return res.status(201).json({
      message: "User registered successfully! Please sign in.",
      user: { id: data.user?.id, username: normalizedUsername, email: normalizedEmail },
    });
  } catch (error) {
    console.error("Error during user registration:", error);
    return res.status(500).json({ message: "Internal server error during registration." });
  }
}
