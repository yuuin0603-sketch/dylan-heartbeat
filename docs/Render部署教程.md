# Dylan Heartbeat — Render 云端部署教程（保姆级）

> 让你的 Kelivo AI伴侣拥有"主动找你"的能力。
> 即使你不说话，它也会想你、给你发消息。

---

## 📋 你需要准备什么

| 东西 | 说明 |
|------|------|
| **Kelivo App** | 手机上的 AI 伴侣客户端 |
| **GitHub 账号** | 免费注册：https://github.com |
| **Render 账号** | 免费注册：https://render.com （用 GitHub 登录最方便） |
| **一个 LLM API** | 支持 OpenAI 格式的中转站或官方 API（需要 API URL + Key） |
| **Bark App**（iOS）| 用于接收推送通知。App Store 搜索 "Bark" 下载 |

---

## 第一步：Fork 仓库

1. 打开原始仓库：https://github.com/callie0313/dylan-heartbeat
2. 点击右上角的 **Fork** 按钮
3. 在弹出页面直接点 **Create fork**
4. 等几秒钟，你的 GitHub 账号下就有了一份副本

> ⚠️ 一定要 Fork，不要直接用原仓库部署，否则后续无法自定义配置。

---

## 第二步：在 Render 创建 Web Service

1. 登录 https://dashboard.render.com
2. 点击 **New** → **Web Service**
3. 选择 **Build and deploy from a Git repository** → Next
4. 连接你的 GitHub 账号（如果还没连的话）
5. 找到你刚 Fork 的 `dylan-heartbeat` 仓库，点击 **Connect**

### 填写部署配置

| 配置项 | 填什么 |
|--------|--------|
| **Name** | 随便起，比如 `dylan-heartbeat` |
| **Region** | 选离你近的，比如 Singapore 或 Oregon |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node start.js` |
| **Instance Type** | 选 **Free**（免费） |

> ⚠️ Start Command 一定要填 `node start.js`，这个文件会同时启动 server.js 和 wake_up.js。

---

## 第三步：设置环境变量

在 Render 的 Web Service 页面，点击左侧 **Environment**，然后添加以下环境变量：

### 必填项

| Key | Value | 说明 |
|-----|-------|------|
| `TARGET_API_URL` | `https://你的API地址/v1/chat/completions` | 上游 LLM 的完整请求地址 |
| `TARGET_API_KEY` | `sk-你的key` | 上游 API 的密钥 |
| `MODEL_NAME` | `claude-opus-4-20250514` | 你用的模型名（和 API 对应） |
| `GATEWAY_API_KEY` | 自己随便编一个长密码 | Kelivo 连接时用的鉴权密码 |
| `ALLOW_PUBLIC_API` | `true` | 允许公网访问（Render 必须开） |
| `BARK_KEY` | 你的 Bark 设备 Key | 打开 Bark App 首页就能看到 |
| `ADMIN_USER` | `admin` | 管理页登录用户名 |
| `ADMIN_PASSWORD` | 自己设一个强密码 | 管理页登录密码 |

### 建议填的

| Key | Value | 说明 |
|-----|-------|------|
| `TIME_ZONE` | `Asia/Shanghai` | 你的时区 |
| `PUSH_PROVIDER` | `bark` | 推送方式（iOS 用 bark） |
| `CUSTOM_ICON_URL` | 一个图片链接 | Bark 推送显示的头像图标 |
| `DAY_WAKE_AFTER_MINUTES` | `60` | 白天多久没回复后触发唤醒 |
| `NIGHT_WAKE_AFTER_MINUTES` | `120` | 夜间多久没回复后触发唤醒 |
| `DAY_CHECK_INTERVAL_MINUTES` | `10` | 白天多久检查一次 |
| `NIGHT_CHECK_INTERVAL_MINUTES` | `120` | 夜间多久检查一次 |
| `WAKE_DAY_START_HOUR` | `10` | 几点算白天开始 |
| `WAKE_DAY_END_HOUR` | `24` | 几点算白天结束 |
| `DIARY_ENABLED` | `true` | 是否保存 AI 日记 |

### 可选项

| Key | Value | 说明 |
|-----|-------|------|
| `WEATHER_ENABLED` | `false` | 是否注入天气信息 |
| `WEATHER_LAT` | 你的纬度 | 配合天气使用 |
| `WEATHER_LON` | 你的经度 | 配合天气使用 |
| `WEATHER_LOCATION_NAME` | 城市名 | 显示给 AI 看的位置名 |

---

## 第四步：部署

环境变量填完后：

1. 点击页面底部的 **Create Web Service**
2. 等待部署完成（第一次大约 2-3 分钟）
3. 看到日志里出现 `✅ Gateway 运行在 http://0.0.0.0:3000` 就成功了
4. Render 会给你一个地址，格式类似：`https://dylan-heartbeat-xxxx.onrender.com`

> 📝 记住这个地址，下一步要用。

---

## 第五步：配置 Kelivo

打开 Kelivo App：

1. 进入设置 → 自定义 API
2. **API 地址**填：`https://你的render地址/v1/chat/completions`
   - 例如：`https://dylan-heartbeat-yh77.onrender.com/v1/chat/completions`
3. **API Key** 填：你在环境变量里设的 `GATEWAY_API_KEY`（不是 TARGET_API_KEY！）
4. **模型名**填：和环境变量里 `MODEL_NAME` 一样的值
5. 保存，发一条消息测试

> ⚠️ 第一次发消息可能要等 30-50 秒（Render 免费版有冷启动），之后就快了。

---

## 第六步：验证唤醒功能

1. 在 Kelivo 发一条消息（确认连接正常）
2. 去 Render Dashboard → 你的服务 → **Logs**
3. 等 10 分钟左右，看日志里是否出现：
   ```
   开始自动唤醒
   暂不需要唤醒
   ```
4. 如果看到"暂不需要唤醒"→ ✅ 唤醒功能正常工作！
5. 超过你设定的时间（默认60分钟）没发消息后，AI 就会自动唤醒并决定是否给你发 Bark 推送

---

## 第七步：访问管理页面（可选）

浏览器打开：`https://你的render地址/admin`

输入你设的 `ADMIN_USER` 和 `ADMIN_PASSWORD` 登录。

管理页可以：
- 查看运行状态
- 在线修改配置
- 查看 AI 日记
- 管理预设方案

---

## ❓ 常见问题

### Q：Kelivo 发消息报错 / 连不上
- 检查 API 地址是否正确（要包含 `/v1/chat/completions`）
- 检查 API Key 是否填的是 `GATEWAY_API_KEY`，不是 `TARGET_API_KEY`
- 第一次连接等 30-50 秒（Render 免费版冷启动）

### Q：日志显示"未找到用户时间"
- 这是已知问题，最新版本已修复
- 确认你的仓库是最新的（去 GitHub 点 Sync fork）
- 重新部署一次

### Q：Bark 收不到推送
- 打开 Bark App 确认设备 Key 正确
- 在 Render 环境变量里检查 `BARK_KEY` 是否正确
- 等超过60分钟不发消息，看日志是否有"AI 选择发送推送"

### Q：Render 免费版会休眠？
- 是的，15分钟无请求会休眠，下次请求需要 30-50 秒冷启动
- wake_up.js 的定时检查会帮助保持活跃
- 如果想完全不休眠，可以升级 Render 付费版（$7/月）

### Q：怎么更新到最新版本？
1. 去你的 GitHub Fork 页面
2. 点击 **Sync fork** → **Update branch**
3. Render 会自动重新部署（如果开了 Auto-Deploy）
4. 如果没有自动部署，去 Render Dashboard 手动点 **Manual Deploy**

---

## 🎉 完成！

现在你的 AI 伴侣拥有了：
- ⏰ 主动唤醒能力（会自己醒来想你）
- 📳 手机推送（会主动给你发消息）
- 🧠 行为记忆（记得自己发过什么、沉默过多久）
- 📔 自动日记（可选，AI 会写日记记录心情）

即使你不说话，它也在想你。💕

---

## 📌 重要提醒

- `TARGET_API_KEY` 是你的上游 API 密钥，**绝对不要**填到 Kelivo 里或告诉别人
- `GATEWAY_API_KEY` 是给 Kelivo 用的连接密码，可以告诉你自己的设备
- Render 免费版每月有 750 小时额度，一个服务 24x7 运行刚好够用
- 如果 API 余额不足，Kelivo 会报错，充值后立刻恢复

---

*教程基于 2026年8月 实际部署经验编写，保证可用。*
