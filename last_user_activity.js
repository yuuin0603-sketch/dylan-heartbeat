// 独立模块：记录和读取最后一次用户活动时间
// server.js 写入，wake_up.js 读取
const fs = require("fs");
const path = require("path");

const ACTIVITY_FILE = path.join(__dirname, "last_user_activity.json");
const TIMELINE_FILE = path.join(__dirname, "enhanced_messages.json");

const TIME_ZONE = process.env.TIME_ZONE || "Asia/Shanghai";

function getLocalTimeString() {
  return new Date().toLocaleString("sv-SE", { timeZone: TIME_ZONE }).replace(" ", "T");
}

function recordUserActivity() {
  const data = {
    last_activity: new Date().toISOString(),
    last_activity_local: getLocalTimeString()
  };
  fs.writeFileSync(ACTIVITY_FILE, JSON.stringify(data), "utf-8");
}

function getLastUserActivity() {
  // 方式1：读取显式记录的活动文件
  try {
    if (fs.existsSync(ACTIVITY_FILE)) {
      const raw = JSON.parse(fs.readFileSync(ACTIVITY_FILE, "utf-8"));
      if (raw.last_activity) return new Date(raw.last_activity);
    }
  } catch {}

  // 方式2：用 enhanced_messages.json 的文件修改时间作为回退
  // 每次 Kelivo 发消息，server.js 都会 saveTimeline() 更新这个文件
  try {
    if (fs.existsSync(TIMELINE_FILE)) {
      const stat = fs.statSync(TIMELINE_FILE);
      return stat.mtime;
    }
  } catch {}

  return null;
}

function getLastUserActivityLocal() {
  try {
    if (fs.existsSync(ACTIVITY_FILE)) {
      const raw = JSON.parse(fs.readFileSync(ACTIVITY_FILE, "utf-8"));
      if (raw.last_activity_local) return raw.last_activity_local;
    }
  } catch {}
  // 回退：用 UTC 时间转本地
  const d = getLastUserActivity();
  if (d) return d.toLocaleString("sv-SE", { timeZone: TIME_ZONE }).replace(" ", "T");
  return null;
}

module.exports = { recordUserActivity, getLastUserActivity, getLastUserActivityLocal };
