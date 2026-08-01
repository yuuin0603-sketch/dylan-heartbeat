/**
 * start.js — 入口文件，替代直接运行 server.js
 * 作用：在 server.js 启动前，monkey-patch normalizeMessageForTimeline 函数，
 * 让网关自动给没有时间前缀的 user 消息补上当前时间。
 * 
 * Render 启动命令改为：node start.js
 */

const fs = require("fs");
const path = require("path");

// 读取 server.js 源码
const serverPath = path.join(__dirname, "server.js");
let serverCode = fs.readFileSync(serverPath, "utf-8");

// 替换 normalizeMessageForTimeline 函数
const oldFn = `function normalizeMessageForTimeline(msg) {
  return { ...msg, content: normalizeContentToText(msg.content) };
}`;

const newFn = `function normalizeMessageForTimeline(msg) {
  const text = normalizeContentToText(msg.content);
  // 批注 2026-08-01：Kelivo 不注入时间前缀时，Gateway 自动补上当前时间
  if (msg.role === "user" && !parseTimestampLabel(text)) {
    const now = new Date();
    const tz = process.env.TIME_ZONE || "Asia/Shanghai";
    const formatter = new Intl.DateTimeFormat("sv-SE", {
      timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    });
    const parts = Object.fromEntries(formatter.formatToParts(now).map(p => [p.type, p.value]));
    const timePrefix = parts.year + "-" + parts.month + "-" + parts.day + " " + parts.hour + ":" + parts.minute;
    return { ...msg, content: timePrefix + " " + text };
  }
  return { ...msg, content: text };
}`;

if (serverCode.includes(oldFn)) {
  serverCode = serverCode.replace(oldFn, newFn);
  // 写回临时修改后的版本（不改原文件，写到临时路径）
  const patchedPath = path.join(__dirname, "_server_patched.js");
  fs.writeFileSync(patchedPath, serverCode, "utf-8");
  console.log("✅ 已应用时间前缀补丁，启动 patched server...");
  require(patchedPath);
} else {
  // 如果找不到旧函数（可能已经手动改过了），直接启动原版
  console.log("⚠️ 未找到需要 patch 的函数，直接启动原版 server.js");
  require(serverPath);
}
