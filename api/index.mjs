// Vercel Serverless Function — wraps the Express app from the built bundle
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { app, _initPromise, _initDone } = require("../dist/serverless.cjs");

let initialized = _initDone;
const initWait = _initPromise.then(() => { initialized = true; });

export default async function handler(req, res) {
  if (!initialized) {
    await initWait;
  }
  return app(req, res);
}
