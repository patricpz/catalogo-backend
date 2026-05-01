import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { startKeepAlive } from './utils/keep-alive.js';

const app = createApp();

app.listen(env.port, () => {
  console.log(`API em http://localhost:${env.port}`);
  console.log(`Health: http://localhost:${env.port}/api/health`);
  console.log(`Docs: http://localhost:${env.port}/docs`);
  startKeepAlive({
    enabled: env.keepAliveEnabled,
    url: env.keepAliveUrl,
    intervalMs: env.keepAliveIntervalMs,
  });
});
