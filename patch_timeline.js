// 这个文件不运行，仅用于记录需要在 server.js 中替换的函数
// 将 server.js 中的 normalizeMessageForTimeline 函数替换为以下内容：

/*
找到这行：
function normalizeMessageForTimeline(msg) {
  return { ...msg, content: normalizeContentToText(msg.content) };
}

替换为：
*/

function normalizeMessageForTimeline(msg) {
  const text = normalizeContentToText(msg.content);
  // 批注 2026-08-01：如果 user 消息没有自带时间前缀（如 Kelivo 不注入时间），
  // Gateway 自动补上当前服务器时间，确保 wake_up.js 能解析最后用户活跃时间。
  if (msg.role === "user" && !parseTimestampLabel(text)) {
    const now = new Date();
    const tz = process.env.TIME_ZONE || "Asia/Shanghai";
    const formatter = new Intl.DateTimeFormat("sv-SE", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    });
    const parts = Object.fromEntries(
      formatter.formatToParts(now).map(p => [p.type, p.value])
    );
    const timePrefix = `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`;
    return { ...msg, content: `${timePrefix} ${text}` };
  }
  return { ...msg, content: text };
}
