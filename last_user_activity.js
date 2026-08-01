// 独立模块：记录和读取最后一次用户活动时间
// server.js 写入，wake_up.js 读取
const fs = require("fs");
const path = require("path");

const ACTIVITY_FILE = path.join(__dirname, "last_user_activity.json");

function recordUserActivity() {
  const data = { last_activity: new Date().toISOString() };
  fs.writeFileSync(ACTIVITY_FILE, JSON.stringify(data), "utf-8");
}

function getLastUserActivity() {
  try {
    if (!fs.existsSync(ACTIVITY_FILE)) return null;
    const raw = JSON.parse(fs.readFileSync(ACTIVITY_FILE, "utf-8"));
    if (raw.last_activity) return new Date(raw.last_activity);
  } catch {}
  return null;
}

module.exports = { recordUserActivity, getLastUserActivity };
