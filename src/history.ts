import { Request, Response } from "express";

interface UploadHistoryItem {
  url: string;
  filename: string;
  size?: number;
  timestamp: number;
  source: "web" | "telegram";
  telegramUserId?: number;
}

// Client-side only history - no server persistence needed
// History is stored in browser localStorage

// GET /api/history - Return empty for now, client uses localStorage
export async function getHistory(_req: Request, res: Response): Promise<void> {
  res.json({ history: [], total: 0 });
}

// POST /api/history - Accept but don't store server-side
export async function addToHistory(
  _req: Request,
  res: Response,
): Promise<void> {
  res.json({ success: true });
}

// DELETE /api/history/:url - Accept but don't do anything
export async function removeFromHistory(
  _req: Request,
  res: Response,
): Promise<void> {
  res.json({ success: true });
}

// DELETE /api/history - Accept but don't do anything
export async function clearHistory(
  _req: Request,
  res: Response,
): Promise<void> {
  res.json({ success: true });
}
