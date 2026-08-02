// Keep-alive: 每4分钟 ping 自己，防止 Render 免费版休眠
const KEEP_ALIVE_INTERVAL_MS = 4 * 60 * 1000; // 4分钟

function startKeepAlive(port) {
  const url = `http://localhost:${port}/v1/models`;

  async function ping() {
    try {
      await fetch(url);
    } catch {}
  }

  setInterval(ping, KEEP_ALIVE_INTERVAL_MS);
  console.log(`🫀 Keep-alive 已启动，每4分钟 ping localhost:${port}`);
}

module.exports = { startKeepAlive };
