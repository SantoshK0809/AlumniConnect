const DEFAULT_KEEP = 20;
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Internal state
const _lastMessages = new Map();   // Map<conversationId, { data: [], ts }>
const _unreadCounts = new Map();   // Map<userId, Map<conversationId, { count, ts }>>

let _keep = DEFAULT_KEEP;
let _ttl = DEFAULT_TTL_MS;

// Helpers
function now() {
  return Date.now();
}

function isExpired(ts) {
  return now() - ts > _ttl;
}

function normalize(id) {
  return String(id);
}

// Configuration
function setKeep(n) {
  const v = parseInt(n, 10);
  if (!Number.isNaN(v) && v > 0) _keep = v;
}

function getKeep() {
  return _keep;
}

function setTTL(ms) {
  const v = parseInt(ms, 10);
  if (!Number.isNaN(v) && v > 0) _ttl = v;
}

function getTTL() {
  return _ttl;
}

// Message cache (best-effort)
function getCachedMessages(conversationId) {
  try {
    const key = normalize(conversationId);
    const entry = _lastMessages.get(key);
    if (!entry) return null;

    if (isExpired(entry.ts)) {
      _lastMessages.delete(key);
      return null;
    }

    // defensive copy
    return entry.data.slice();
  } catch {
    return null;
  }
}

function setCachedMessages(conversationId, messages) {
  try {
    const key = normalize(conversationId);
    const arr = Array.isArray(messages)
      ? messages.slice(-_keep)
      : [];

    _lastMessages.set(key, {
      data: arr,
      ts: now()
    });
  } catch {
    // cache failure must be invisible
  }
}

function pushCachedMessage(conversationId, message) {
  try {
    const key = normalize(conversationId);
    const entry = _lastMessages.get(key);

    let arr = entry && !isExpired(entry.ts)
      ? entry.data
      : [];

    arr.push(message);

    if (arr.length > _keep) {
      arr.splice(0, arr.length - _keep);
    }

    _lastMessages.set(key, {
      data: arr,
      ts: now()
    });
  } catch {
    // ignore cache failures
  }
}

function clearCachedMessages(conversationId) {
  try {
    if (conversationId) {
      _lastMessages.delete(normalize(conversationId));
    } else {
      _lastMessages.clear();
    }
  } catch {
    // ignore
  }
}

// Unread counters (ephemeral, UI-only hint)
function incrementUnread(userId, conversationId) {
  try {
    const user = normalize(userId);
    const conv = normalize(conversationId);

    let userMap = _unreadCounts.get(user);
    if (!userMap) {
      userMap = new Map();
      _unreadCounts.set(user, userMap);
    }

    const entry = userMap.get(conv);
    const count =
      entry && !isExpired(entry.ts) ? entry.count : 0;

    userMap.set(conv, {
      count: count + 1,
      ts: now()
    });
  } catch {
    // ignore
  }
}

function resetUnread(userId, conversationId) {
  try {
    const user = normalize(userId);
    const conv = normalize(conversationId);

    let userMap = _unreadCounts.get(user);
    if (!userMap) {
      userMap = new Map();
      _unreadCounts.set(user, userMap);
    }

    userMap.set(conv, {
      count: 0,
      ts: now()
    });
  } catch {
    // ignore
  }
}

/**
 * IMPORTANT:
 * This is NOT authoritative.
 * Use only for real-time UI hints.
 */
function getUnread(userId, conversationId) {
  try {
    const user = normalize(userId);
    const conv = normalize(conversationId);

    const userMap = _unreadCounts.get(user);
    if (!userMap) return 0;

    const entry = userMap.get(conv);
    if (!entry || isExpired(entry.ts)) {
      userMap.delete(conv);
      return 0;
    }

    return entry.count;
  } catch {
    return 0;
  }
}

// Maintenance
function clearAll() {
  _lastMessages.clear();
  _unreadCounts.clear();
}

module.exports = {
  // config
  setKeep,
  getKeep,
  setTTL,
  getTTL,

  // messages
  getCachedMessages,
  setCachedMessages,
  pushCachedMessage,
  clearCachedMessages,

  // unread (best-effort)
  incrementUnread,
  resetUnread,
  getUnread,

  // dev / ops
  clearAll,
};
