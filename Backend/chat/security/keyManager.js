const crypto = require("crypto");
const { encrypt, decrypt } = require("../utils/crypto");

const MASTER_KEY = Buffer.from(
  process.env.MESSAGE_MASTER_KEY,
  "base64"
);

if (MASTER_KEY.length !== 32) {
  throw new Error("Invalid MESSAGE_MASTER_KEY");
}

// Generate a new conversation key
function generateConversationKey() {
  return crypto.randomBytes(32);
}

// Encrypt conversation key using MASTER key
function encryptConversationKey(conversationKey) {
  return encrypt(
    conversationKey.toString("base64"),
    MASTER_KEY
  );
}

// Decrypt conversation key using MASTER key
function decryptConversationKey(encryptedKeyPayload) {
  const keyBase64 = decrypt(
    encryptedKeyPayload,
    MASTER_KEY
  );

  return Buffer.from(keyBase64, "base64");
}

module.exports = {
  generateConversationKey,
  encryptConversationKey,
  decryptConversationKey
};
