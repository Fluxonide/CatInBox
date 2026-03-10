import { Request, Response } from "express";
import fs from "fs";
import path from "path";

const HISTORY_FILE = path.join(process.cwd(), "upload_history.json");

interface UploadHistoryItem {
  url: string;
  filename: string;
  size?: number;
  timestamp: number;
  source: "web" | "telegram";
  telegramUserId?: number;
}

// Load history from file
function loadHistory(): UploadHistoryItem[] {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      const data = fs.readFileSync(HISTORY_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error loading history:", error);
  }
  return [];
}

// Save history to file
function saveHistory(history: UploadHistoryItem[]): void {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error("Error saving history:", error);
  }
}

// GET /api/history - Fetch upload history
export async function getHistory(req: Request, res: Response): Promise<void> {
  try {
    const history = loadHistory();
    res.json({ history, total: history.length });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

// POST /api/history - Add item to history
export async function addToHistory(req: Request, res: Response): Promise<void> {
  try {
    const { url, filename, size, source, telegramUserId } = req.body;

    if (!url || !filename) {
      res.status(400).json({ error: "url and filename are required" });
      return;
    }

    const history = loadHistory();
    
    // Check if URL already exists
    if (history.some((item) => item.url === url)) {
      res.json({ success: true, duplicate: true });
      return;
    }

    const newItem: UploadHistoryItem = {
      url,
      filename,
      size,
      timestamp: Date.now(),
      source: source || "web",
      telegramUserId,
    };

    // Add to beginning and keep last 200 items
    history.unshift(newItem);
    const trimmed = history.slice(0, 200);
    saveHistory(trimmed);

    res.json({ success: true, item: newItem });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

// DELETE /api/history/:url - Remove item from history
export async function removeFromHistory(req: Request, res: Response): Promise<void> {
  try {
    const urlToRemove = decodeURIComponent(req.params.url);
    const history = loadHistory();
    const filtered = history.filter((item) => item.url !== urlToRemove);
    saveHistory(filtered);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

// DELETE /api/history - Clear all history
export async function clearHistory(req: Request, res: Response): Promise<void> {
  try {
    saveHistory([]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}
