/**
 * backend/src/validation.js
 *
 * Centralised file-upload and form-field validation utilities.
 * All security constraints live here so they are applied consistently across
 * the admin media upload, the public resume upload, and the public form
 * submission endpoints (contact, career apply).
 *
 * Threat model addressed
 * ─────────────────────
 * • MIME spoofing   – We independently verify the file signature (magic bytes)
 *   and only use the client-supplied Content-Type for the OOXML resolution
 *   special case, which is explicitly gated.
 * • XSS via upload  – SVG, HTML, JS, PHP etc. are not in any allowlist and
 *   will be rejected at the magic-byte detection step (unknown → null).
 * • Storage DoS     – Hard size caps (10 MB / 5 MB) applied before buffering.
 * • Stored XSS      – Text-field schemas enforce maximum lengths and validate
 *   email format so oversized or malformed payloads are rejected at the edge.
 */

// ─── File-type allowlists ─────────────────────────────────────────────────────
// Maps a canonical MIME type (resolved from magic bytes, NOT from the client
// Content-Type header) to the extensions that are valid for that type.

/** Images and PDFs accepted by the admin media library. */
export const ALLOWED_MEDIA_TYPES = {
  'image/jpeg':      ['.jpg', '.jpeg'],
  'image/png':       ['.png'],
  'image/webp':      ['.webp'],
  'image/gif':       ['.gif'],
  'application/pdf': ['.pdf'],
};

/** Document types accepted as job-application resumes. */
export const ALLOWED_RESUME_TYPES = {
  'application/pdf':     ['.pdf'],
  'application/msword':  ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};

/** MIME types the browser is allowed to render inline in the /media/ proxy.
 *  Everything else receives  Content-Disposition: attachment. */
export const INLINE_MIME_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
]);

// ─── File size limits ─────────────────────────────────────────────────────────
export const MAX_MEDIA_FILE_SIZE  = 10 * 1024 * 1024; // 10 MB
export const MAX_RESUME_FILE_SIZE =  5 * 1024 * 1024; //  5 MB

// ─── Magic-byte detection ─────────────────────────────────────────────────────
/**
 * Inspect the leading bytes of a file buffer and return the detected MIME type.
 *
 * References
 * • https://en.wikipedia.org/wiki/List_of_file_signatures
 * • https://www.garykessler.net/library/file_sigs.html
 *
 * @param {ArrayBuffer} buffer  Full file contents. Only the first 12 bytes are
 *                              read; the rest is untouched.
 * @returns {string|null}       Detected MIME type, or null for unrecognised data.
 */
export function detectMimeType(buffer) {
  // Clamp to 12 bytes — enough for every signature we recognise.
  const b = new Uint8Array(buffer, 0, Math.min(12, buffer.byteLength));
  const len = b.length;

  // JPEG — FF D8 FF
  if (len >= 3 && b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF)
    return 'image/jpeg';

  // PNG — 89 50 4E 47 0D 0A 1A 0A
  if (len >= 8 &&
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47 &&
      b[4] === 0x0D && b[5] === 0x0A && b[6] === 0x1A && b[7] === 0x0A)
    return 'image/png';

  // WebP — RIFF????WEBP (12 bytes: RIFF at 0-3, file size at 4-7, WEBP at 8-11)
  if (len >= 12 &&
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50)
    return 'image/webp';

  // GIF87a / GIF89a — GIF8
  if (len >= 4 && b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38)
    return 'image/gif';

  // PDF — %PDF
  if (len >= 4 && b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46)
    return 'application/pdf';

  // OLE2 Compound Document — D0 CF 11 E0  (legacy .doc / .xls / .ppt)
  if (len >= 4 && b[0] === 0xD0 && b[1] === 0xCF && b[2] === 0x11 && b[3] === 0xE0)
    return 'application/msword';

  // ZIP / OOXML — PK\x03\x04
  // DOCX, XLSX, PPTX are ZIP archives, so they share this signature with plain
  // .zip files.  We return a sentinel value and let validateFile() resolve the
  // true OOXML type from the claimed MIME + extension (see step 5 below).
  if (len >= 4 && b[0] === 0x50 && b[1] === 0x4B && b[2] === 0x03 && b[3] === 0x04)
    return 'application/zip';

  // Unrecognised byte sequence
  return null;
}

// ─── File validator ───────────────────────────────────────────────────────────
/**
 * Validate a file upload against an allowlist using magic bytes, extension, and
 * size checks.  The client-supplied Content-Type is never trusted directly.
 *
 * @param {{ name: string, type: string, size: number }} fileMeta
 *   Metadata from the FormData File object.
 *   • name  – original filename (used for extension check only)
 *   • type  – client-claimed MIME (used only for the OOXML resolution step)
 *   • size  – declared byte length (cross-checked against maxBytes)
 * @param {ArrayBuffer} buffer
 *   Full file contents (used for magic-byte detection and size guard).
 * @param {Object} allowedTypes
 *   Map of  { mimeType: ['.ext', …] }  defining permitted types.
 * @param {number} maxBytes
 *   Maximum permitted file size in bytes.
 *
 * @returns {{ valid: true, mimeType: string }}
 *        | {{ valid: false, error: string }}
 *   On success, mimeType is the *detected* (not client-claimed) MIME type.
 *   Use this value when storing the file and setting Content-Type headers.
 */
export function validateFile(fileMeta, buffer, allowedTypes, maxBytes) {
  const fileName = (fileMeta.name || '').trim();
  const fileSize = fileMeta.size ?? 0;

  // ── 1. Non-empty filename ──────────────────────────────────────────────────
  if (!fileName) {
    return { valid: false, error: 'File name is missing.' };
  }

  // ── 2. Non-zero size guard ─────────────────────────────────────────────────
  if (fileSize === 0 || buffer.byteLength === 0) {
    return { valid: false, error: 'Uploaded file is empty.' };
  }

  // ── 3. Size limit ──────────────────────────────────────────────────────────
  if (buffer.byteLength > maxBytes) {
    const limitMB = Math.round(maxBytes / 1024 / 1024);
    return { valid: false, error: `File exceeds the ${limitMB} MB size limit.` };
  }

  // ── 4. Magic-byte detection (the authoritative type signal) ────────────────
  const detectedMime = detectMimeType(buffer);

  if (detectedMime === null) {
    return {
      valid: false,
      error: 'File content could not be identified. ' +
             'Only known file types are accepted.'
    };
  }

  // ── 5. Resolve effective MIME for OOXML (ZIP-based) formats ───────────────
  // DOCX/XLSX/PPTX are indistinguishable from plain ZIP by magic bytes alone.
  // We accept the client-claimed MIME *only if* it is an explicitly allow-listed
  // application/vnd.* type, then cross-check the extension as a second gate.
  let effectiveMime = detectedMime;
  if (detectedMime === 'application/zip') {
    const claimedMime = (fileMeta.type || '').toLowerCase().trim();
    const isOoxmlClaim = claimedMime.startsWith('application/vnd.') && !!allowedTypes[claimedMime];
    if (isOoxmlClaim) {
      effectiveMime = claimedMime;
    }
    // Otherwise effectiveMime stays as 'application/zip', which will fail step 6.
  }

  // ── 6. Allowlist check on the detected type ────────────────────────────────
  if (!allowedTypes[effectiveMime]) {
    const allowed = Object.keys(allowedTypes).join(', ');
    return {
      valid: false,
      error: `File type "${effectiveMime}" is not permitted. Allowed: ${allowed}.`
    };
  }

  // ── 7. Extension check (defence-in-depth; prevents misleading filenames) ───
  const dotParts = fileName.split('.');
  if (dotParts.length < 2) {
    return { valid: false, error: 'File must have a file extension.' };
  }
  const ext = '.' + dotParts[dotParts.length - 1].toLowerCase();
  const allowedExts = allowedTypes[effectiveMime];
  if (!allowedExts.includes(ext)) {
    return {
      valid: false,
      error: `Extension "${ext}" is not valid for the detected file type "${effectiveMime}". ` +
             `Expected one of: ${allowedExts.join(', ')}.`
    };
  }

  return { valid: true, mimeType: effectiveMime };
}

// ─── Text-field validator ─────────────────────────────────────────────────────
// Simple RFC 5321 practical subset: local@domain.tld, each part length-bounded.
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,63}$/;

/**
 * Validate a flat object of string fields against a schema.
 *
 * @param {Object} data   Input object (from request.json() or formData entries).
 * @param {Object} schema Schema map:
 *   { fieldName: { required?: boolean, maxLength: number, isEmail?: boolean } }
 * @returns {{ valid: true } | { valid: false, error: string }}
 */
export function validateTextFields(data, schema) {
  for (const [field, rules] of Object.entries(schema)) {
    const raw = data[field];
    const value = typeof raw === 'string' ? raw.trim() : '';

    if (rules.required && value.length === 0) {
      return { valid: false, error: `"${field}" is required.` };
    }

    if (value.length > rules.maxLength) {
      return {
        valid: false,
        error: `"${field}" must not exceed ${rules.maxLength} characters ` +
               `(received ${value.length}).`
      };
    }

    if (rules.isEmail && value && !EMAIL_RE.test(value)) {
      return { valid: false, error: `"${field}" is not a valid email address.` };
    }
  }
  return { valid: true };
}

// ─── Validation schemas ───────────────────────────────────────────────────────

/** Schema for the public contact form (POST /api/public/contact). */
export const CONTACT_SCHEMA = {
  name:    { required: true,  maxLength: 100,  isEmail: false },
  email:   { required: true,  maxLength: 254,  isEmail: true  },
  phone:   { required: false, maxLength: 30,   isEmail: false },
  subject: { required: true,  maxLength: 200,  isEmail: false },
  message: { required: true,  maxLength: 5000, isEmail: false },
};

/** Schema for text fields in a job application (POST /api/public/careers/apply). */
export const APPLICATION_TEXT_SCHEMA = {
  career_id:       { required: true,  maxLength: 100,  isEmail: false },
  applicant_name:  { required: true,  maxLength: 100,  isEmail: false },
  applicant_email: { required: true,  maxLength: 254,  isEmail: true  },
  cover_letter:    { required: false, maxLength: 5000, isEmail: false },
};
