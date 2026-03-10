import { Request, Response } from "express";
import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import FormData from "form-data";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const bot = new TelegramBot(BOT_TOKEN);
const ALLOWED_USER_ID = 1328917774;

interface TelegramUpdate {
  message?: {
    chat: { id: number };
    text?: string;
    photo?: Array<{ file_id: string; file_size?: number }>;
    document?: {
      file_id: string;
      file_name?: string;
      mime_type?: string;
      file_size?: number;
    };
    video?: {
      file_id: string;
      file_name?: string;
      mime_type?: string;
      file_size?: number;
    };
  };
}

async function uploadToCatbox(
  fileBuffer: Buffer,
  filename: string,
): Promise<string> {
  const form = new FormData();
  form.append("reqtype", "fileupload");
  form.append("fileToUpload", fileBuffer, { filename });

  const userhash = process.env.CATBOX_USERHASH;
  if (userhash) {
    form.append("userhash", userhash);
  }

  const response = await axios({
    method: "POST",
    url: "https://catbox.moe/user/api.php",
    data: form,
    headers: form.getHeaders(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  return String(response.data).trim();
}

export default async function handler(
  req: Request,
  res: Response,
): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!BOT_TOKEN) {
    res.status(500).json({ error: "Bot token not configured" });
    return;
  }

  try {
    const update: TelegramUpdate = req.body;

    if (!update.message) {
      res.status(200).json({ ok: true });
      return;
    }

    const chatId = update.message.chat.id;

    // Only allow specific user
    if (chatId !== ALLOWED_USER_ID) {
      res.status(200).json({ ok: true });
      return;
    }

    // Handle text messages
    if (update.message.text) {
      const text = update.message.text;

      if (text === "/start") {
        await bot.sendMessage(
          chatId,
          "Welcome! Send me a file, photo, video, or a URL and I'll upload it to Catbox for you.",
        );
      } else if (text.startsWith("http://") || text.startsWith("https://")) {
        // Handle URL upload
        try {
          const downloadResponse = await axios({
            method: "GET",
            url: text,
            responseType: "arraybuffer",
            maxContentLength: 200 * 1024 * 1024,
          });

          const buffer = Buffer.from(downloadResponse.data);
          const urlPath = new URL(text).pathname;
          const filename = urlPath.split("/").pop() || "file";

          const catboxUrl = await uploadToCatbox(buffer, filename);
          await bot.sendMessage(chatId, `[‎](${catboxUrl})\`${catboxUrl}\``, {
            parse_mode: "Markdown",
          });
        } catch (error) {
          await bot.sendMessage(
            chatId,
            `❌ Error: ${(error as Error).message}`,
          );
        }
      } else {
        await bot.sendMessage(
          chatId,
          "Send me a file, photo, video, or a valid URL to upload to Catbox.",
        );
      }
    }

    // Handle photo uploads
    if (update.message.photo && update.message.photo.length > 0) {
      try {
        const photo = update.message.photo[update.message.photo.length - 1];
        const file = await bot.getFile(photo.file_id);
        const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`;

        const downloadResponse = await axios({
          method: "GET",
          url: fileUrl,
          responseType: "arraybuffer",
        });

        const buffer = Buffer.from(downloadResponse.data);
        const filename = file.file_path?.split("/").pop() || "photo.jpg";

        const catboxUrl = await uploadToCatbox(buffer, filename);
        await bot.sendMessage(chatId, `[‎](${catboxUrl})\`${catboxUrl}\``, {
          parse_mode: "Markdown",
        });
      } catch (error) {
        await bot.sendMessage(chatId, `❌ Error: ${(error as Error).message}`);
      }
    }

    // Handle document/video uploads
    if (update.message.document || update.message.video) {
      try {
        const fileData = update.message.document || update.message.video;
        const file = await bot.getFile(fileData!.file_id);
        const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`;

        const downloadResponse = await axios({
          method: "GET",
          url: fileUrl,
          responseType: "arraybuffer",
        });

        const buffer = Buffer.from(downloadResponse.data);
        const filename =
          fileData!.file_name || file.file_path?.split("/").pop() || "file";

        const catboxUrl = await uploadToCatbox(buffer, filename);
        await bot.sendMessage(chatId, `[‎](${catboxUrl})\`${catboxUrl}\``, {
          parse_mode: "Markdown",
        });
      } catch (error) {
        await bot.sendMessage(chatId, `❌ Error: ${(error as Error).message}`);
      }
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    res.status(500).json({ error: (error as Error).message });
  }
}
