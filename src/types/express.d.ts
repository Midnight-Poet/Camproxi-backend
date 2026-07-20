declare namespace Express {
  interface Request {
    admin?: Record<string, any>;
    agent?: Record<string, any>;
    user?: Record<string, any>;
  }
}
