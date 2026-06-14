const crypto = require("crypto");

const ALGO = "aes-256-gcm";
const KEY_LEN = 32;   // 256 bits
const IV_LEN = 12;    // GCM standard

function assertValidKey(key) {
  if (!Buffer.isBuffer(key) || key.length !== KEY_LEN) {
    throw new Error("Invalid encryption key");
  }
}

function encrypt(plainText, key, aad) {
  assertValidKey(key);

  if (typeof plainText !== "string") {
    throw new Error("Plaintext must be a string");
  }

  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, key, iv);

  // Bind metadata (conversationId, senderId, etc.)
  if (aad) {
    cipher.setAAD(Buffer.from(aad));
  }

  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final()
  ]);

  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString("base64"),
    content: encrypted.toString("base64"),
    tag: authTag.toString("base64")
  };
}

function decrypt(payload, key, aad) {
  assertValidKey(key);

  try {
    if (
      !payload ||
      typeof payload.iv !== "string" ||
      typeof payload.content !== "string" ||
      typeof payload.tag !== "string"
    ) {
      throw new Error("Malformed payload");
    }

    const decipher = crypto.createDecipheriv(
      ALGO,
      key,
      Buffer.from(payload.iv, "base64")
    );

    if (aad) {
      decipher.setAAD(Buffer.from(aad));
    }

    decipher.setAuthTag(Buffer.from(payload.tag, "base64"));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(payload.content, "base64")),
      decipher.final()
    ]);

    return decrypted.toString("utf8");
  } catch {
    // Do NOT leak crypto errors
    throw new Error("Unable to decrypt message");
  }
}

module.exports = { encrypt, decrypt };