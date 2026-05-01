type KeepAliveOptions = {
  enabled: boolean;
  url: string;
  intervalMs: number;
};

export function startKeepAlive({ enabled, url, intervalMs }: KeepAliveOptions): void {
  if (!enabled) return;

  const safeInterval = Number.isFinite(intervalMs) && intervalMs >= 30_000 ? intervalMs : 240_000;

  const ping = async () => {
    try {
      const response = await fetch(url, { method: 'GET' });
      if (!response.ok) {
        console.warn(`[keep-alive] ping falhou com status ${response.status} em ${url}`);
      }
    } catch (error) {
      console.warn(`[keep-alive] erro ao pingar ${url}:`, error);
    }
  };

  void ping();
  const timer = setInterval(() => {
    void ping();
  }, safeInterval);

  timer.unref();
  console.log(`[keep-alive] ativo em ${url} a cada ${safeInterval}ms`);
}
