import { NextApiRequest, NextApiResponse } from "next";

// Auth is now handled by Supabase. This route is no longer used.
export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(410).json({ message: "NextAuth has been replaced by Supabase Auth." });
}
