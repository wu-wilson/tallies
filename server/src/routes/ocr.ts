import { Router } from 'express';
import multer from 'multer';

import { config } from '../config';
import { writeLimiter } from '../middleware/rateLimiter';
import { detectImageType, readReceipt } from '../services/ocr';

import { describeError } from '../lib/describeError';

import type { NextFunction, Request, Response } from 'express';

/** OCR route: `POST /api/ocr` checks the uploaded image and returns the receipt `readReceipt` reads from it. */
export const ocrRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  // One file and no text fields, so extra parts are refused rather than buffered in memory.
  limits: { fileSize: config.maxImageSizeBytes, files: 1, fields: 0 },
});

/**
 * Wrap `upload.single('file')` and turn any upload failure into a user-safe response (413 for size, 400 otherwise).
 * @param req - The multipart upload; multer attaches its `file` field as `req.file`
 * @param res - Express response (written directly when the upload fails)
 * @param next - Express next callback, called once the upload succeeds
 */
function uploadReceipt(req: Request, res: Response, next: NextFunction): void {
  upload.single('file')(req, res, (err: unknown) => {
    if (!err) {
      next();
      return;
    }
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      // Rounded down to a tenth, so the stated limit never exceeds the real one.
      const mb = Math.floor((config.maxImageSizeBytes / 1024 / 1024) * 10) / 10;
      res.status(413).json({ error: `This image is too large. Upload one under ${mb} MB.` });
      return;
    }
    // Memory storage can't fail on its own, so anything else is a refused or malformed upload.
    console.error(`Upload error: ${describeError(err)}`);
    res.status(400).json({ error: "Couldn't upload this photo. Try again." });
  });
}

ocrRouter.post('/ocr', writeLimiter, uploadReceipt, async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const mime = detectImageType(req.file.buffer);
    if (!mime) {
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
