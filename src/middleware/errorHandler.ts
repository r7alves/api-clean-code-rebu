import * as express from 'express';
import * as fs from 'fs';
import debug from 'debug';

debug.enable('app:*');
const logError = debug('app:error');
const logFile = 'error.log';

function errorHandler(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
  logError(err);
  fs.appendFileSync(logFile, `${new Date().toISOString()} - ${err.stack}\n`);
  res.status(500).json({ error: 'Internal Server Error' });
}

export default errorHandler;
