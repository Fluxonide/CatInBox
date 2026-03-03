import express, { Request, Response } from "express";
import axios from "axios";
import FormData from "form-data";
import cors from "cors";
import multer from "multer";
import path from "path";

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 200 * 1024 * 1024 } });

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from the 'public' directory (Vite build output)
app.use(express.static(path.join(__dirname, "..", "public")));

// Map content-type to file extension
function getExtension(contentType: string | undefined): string {
    const map: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/gif": "gif",
        "image/webp": "webp",
        "image/svg+xml": "svg",
        "image/bmp": "bmp",
        "image/tiff": "tiff",
        "video/mp4": "mp4",
        "video/webm": "webm",
        "application/pdf": "pdf",
        "application/zip": "zip",
        "application/x-rar-compressed": "rar",
        "application/x-7z-compressed": "7z",
        "audio/mpeg": "mp3",
        "audio/ogg": "ogg",
        "audio/flac": "flac",
    };
    return map[(contentType || "").split(";")[0].trim().toLowerCase()] || "bin";
}

interface UploadResult {
    url: string;
    filename: string;
    size?: number;
}

// Upload via URL
app.post("/api/upload/url", async (req: Request, res: Response): Promise<void> => {
    const { imageUrl, userhash } = req.body as { imageUrl?: string; userhash?: string };

    if (!imageUrl) {
        res.status(400).json({ error: "No URL provided." });
        return;
    }

    try {
        const downloadResponse = await axios({
            method: "GET",
            url: imageUrl,
            responseType: "stream",
        });

        const ext = getExtension(downloadResponse.headers["content-type"]);
        // Extract filename from URL path, fallback to upload.ext
        const urlPath = new URL(imageUrl).pathname;
        const urlFilename = urlPath.split("/").pop();
        const filename = urlFilename && urlFilename.includes(".") ? urlFilename : `upload.${ext}`;

        const form = new FormData();
        form.append("reqtype", "fileupload");
        if (userhash) {
            form.append("userhash", userhash);
        }
        form.append("fileToUpload", downloadResponse.data, { filename });

        const uploadResponse = await axios({
            method: "POST",
            url: "https://catbox.moe/user/api.php",
            data: form,
            headers: form.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        });

        const resultUrl = String(uploadResponse.data).trim();
        console.log("Upload Response:", resultUrl);
        const result: UploadResult = { url: resultUrl, filename, size: undefined };
        res.json(result);
    } catch (error: unknown) {
        const err = error as { message: string; response?: { data: unknown }; stack?: string };
        console.error("Error during URL upload:", {
            message: err.message,
            response: err.response ? err.response.data : "No response data",
        });
        res.status(500).json({ error: err.message });
    }
});

// Upload via direct file
app.post("/api/upload/file", upload.single("file"), async (req: Request, res: Response): Promise<void> => {
    const userhash = req.body?.userhash as string | undefined;

    if (!req.file) {
        res.status(400).json({ error: "No file provided." });
        return;
    }

    try {
        const form = new FormData();
        form.append("reqtype", "fileupload");
        if (userhash) {
            form.append("userhash", userhash);
        }
        form.append("fileToUpload", req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });

        const uploadResponse = await axios({
            method: "POST",
            url: "https://catbox.moe/user/api.php",
            data: form,
            headers: form.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        });

        const resultUrl = String(uploadResponse.data).trim();
        console.log("Upload Response:", resultUrl);
        const result: UploadResult = {
            url: resultUrl,
            filename: req.file.originalname,
            size: req.file.size,
        };
        res.json(result);
    } catch (error: unknown) {
        const err = error as { message: string; response?: { data: unknown } };
        console.error("Error during file upload:", {
            message: err.message,
            response: err.response ? err.response.data : "No response data",
        });
        res.status(500).json({ error: err.message });
    }
});

// Legacy endpoint for backward compatibility
app.post("/upload", async (req: Request, res: Response): Promise<void> => {
    const { imageUrl, userhash } = req.body as { imageUrl?: string; userhash?: string };

    if (!imageUrl) {
        res.status(400).json({ error: "No image URL provided." });
        return;
    }

    try {
        const downloadResponse = await axios({
            method: "GET",
            url: imageUrl,
            responseType: "stream",
        });

        const ext = getExtension(downloadResponse.headers["content-type"]);
        const urlPath = new URL(imageUrl).pathname;
        const urlFilename = urlPath.split("/").pop();
        const filename = urlFilename && urlFilename.includes(".") ? urlFilename : `upload.${ext}`;

        const form = new FormData();
        form.append("reqtype", "fileupload");
        if (userhash) {
            form.append("userhash", userhash);
        }
        form.append("fileToUpload", downloadResponse.data, { filename });

        const uploadResponse = await axios({
            method: "POST",
            url: "https://catbox.moe/user/api.php",
            data: form,
            headers: form.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        });

        const resultUrl = String(uploadResponse.data).trim();
        res.json({ url: resultUrl });
    } catch (error: unknown) {
        const err = error as { message: string; response?: { data: unknown } };
        res.status(500).send(`Error: ${err.message}`);
    }
});

// SPA fallback — serve index.html for all non-API routes
app.get("*", (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
});

export default app;
