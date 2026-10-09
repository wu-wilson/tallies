import { Router } from 'express';
import { fromBuffer } from 'file-type';
import multer from 'multer';

import { config } from '../config';
import { writeLimiter } from '../middleware/rateLimiter';
import { isAllowedMime, readReceipt } from '../services/ocr';

import type { NextFunction, Request, Response } from 'express';

/** OCR route: `POST /api/ocr` checks the uploaded image and returns the receipt `readReceipt` reads from it. */
export const ocrRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxImageSizeBytes },
});

/**
 * Wrap `upload.single('file')` and convert multer errors into user-safe responses (413 for size, 400 otherwise).
 * @param req - The multipart upload; multer attaches its `file` field as `req.file`
 * @param res - Express response (written directly on multer errors)
 * @param next - Express next callback (called when upload succeeds or a non-multer error needs to bubble)
 */
function uploadReceipt(req: Request, res: Response, next: NextFunction): void {
  upload.single('file')(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        const mb = Math.round(config.maxImageSizeBytes / 1024 / 1024);
        res.status(413).json({ error: `This image is too large. Upload one under ${mb} MB.` });
        return;
      }
      console.error(`Multer upload error: ${err.code} — ${err.message}`);
      res.status(400).json({ error: "Couldn't upload this photo. Try again." });
      return;
    }
    if (err) {
      next(err);
      return;
    }
    next();
  });
}

ocrRouter.post('/ocr', writeLimiter, uploadReceipt, async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const mime = (await fromBuffer(req.file.buffer))?.mime;
    if (!isAllowedMime(mime)) {
      res.status(400).json({ error: 'Upload a JPEG, PNG, or WebP image.' });
      return;
    }

    const reading = await readReceipt(req.file.buffer, mime);
    if ('error' in reading) {
      res.status(reading.status).json({ error: reading.error });
      return;
    }
    res.json(reading.receipt);
  } catch (err) {
    next(err);
  }
});
