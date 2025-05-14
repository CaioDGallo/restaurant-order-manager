import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  const requestLogMessage = `${method} ${originalUrl} - IP: ${ip}`;
  console.log(`[${new Date().toISOString()}] ${requestLogMessage}`);

  res.on('finish', () => {
    const responseTime = Date.now() - start;
    const statusCode = res.statusCode;
    const responseLogMessage = `${method} ${originalUrl} - ${statusCode} - ${responseTime}ms`;
    console.log(`[${new Date().toISOString()}] ${responseLogMessage}`);
  });

  next();
};

export const errorLogger = (err: Error, _req: Request, _res: Response, next: NextFunction) => {
  const errorMessage = `ERROR: ${err.message}`;
  const stackTrace = err.stack || '';

  console.error(`[${new Date().toISOString()}] ${errorMessage}`);
  console.error(stackTrace);

  next(err);
}; 
