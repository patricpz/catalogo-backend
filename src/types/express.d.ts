declare global {
  namespace Express {
    interface Request {
      auth?: { sub: string; email: string; role: 'ADMIN' | 'LOJISTA' | 'CLIENTE' };
    }
  }
}

export {};
