import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { executeYearlyOperationalReset, getDhakaDateTime } from './src/server/yearlyResetService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Global protection against unexpected process death from unhandled rejections or uncaught exceptions
process.on('unhandledRejection', (reason) => {
  console.warn('[Server] Unhandled Promise Rejection (non-fatal):', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[Server] Uncaught Exception (captured):', err);
});

/**
 * Resolve the listening port:
 * 1. CLI argument: --port <num> or -p <num> (highest precedence)
 * 2. In development mode (NODE_ENV !== 'production'), always default to 3000 to match AI Studio iframe & proxy requirements
 * 3. In production mode, respect process.env.PORT if specified (except 8080 when running behind nginx)
 */
function resolvePort(): number {
  for (let i = 0; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if ((arg === '--port' || arg === '-p') && process.argv[i + 1]) {
      const p = parseInt(process.argv[i + 1], 10);
      if (!isNaN(p)) return p;
    } else if (arg.startsWith('--port=')) {
      const p = parseInt(arg.split('=')[1], 10);
      if (!isNaN(p)) return p;
    }
  }

  if (process.env.NODE_ENV === 'production' && process.env.PORT) {
    const p = parseInt(process.env.PORT, 10);
    if (!isNaN(p)) return p;
  }

  // If PORT env var is present and not the container's NGINX_PORT (8080)
  if (process.env.PORT && process.env.PORT !== '8080' && process.env.PORT !== '8000') {
    const p = parseInt(process.env.PORT, 10);
    if (!isNaN(p)) return p;
  }

  return 3000;
}

async function startServer() {
  const app = express();
  const PORT = resolvePort();

  app.use(express.json());

  // API Health status endpoint - used by Cloud Run & AI Studio health checks
  app.get('/api/health', (_req, res) => {
    try {
      const dhaka = getDhakaDateTime();
      res.json({
        status: 'healthy',
        timezone: 'Asia/Dhaka',
        dhakaTime: dhaka.dateStr,
        dhakaYear: dhaka.year,
        serverTime: new Date().toISOString(),
      });
    } catch (e: any) {
      res.status(500).json({ status: 'error', error: e?.message });
    }
  });

  // Backend endpoint to execute yearly reset (protected by admin authorization key)
  app.post('/api/system/yearly-reset', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const expectedKey = process.env.SYSTEM_RESET_SECRET;
      if (!expectedKey) {
        res.status(500).json({ error: 'Server configuration error: SYSTEM_RESET_SECRET environment variable is required.' });
        return;
      }
      if (!authHeader || authHeader !== `Bearer ${expectedKey}`) {
        res.status(401).json({ error: 'Unauthorized: Admin authorization key required for yearly reset' });
        return;
      }

      const targetYear = req.body?.targetYear ? parseInt(req.body.targetYear, 10) : undefined;
      const result = await executeYearlyOperationalReset(targetYear);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Failed to execute yearly reset' });
    }
  });

  // Mount Vite or static dist
  const distDir = path.resolve(__dirname, 'dist');
  const indexHtml = path.resolve(distDir, 'index.html');

  if (process.env.NODE_ENV === 'production' && fs.existsSync(indexHtml)) {
    app.use(express.static(distDir));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(indexHtml);
    });
  } else {
    // Development mode with Vite middleware
    // Explicitly set hmr: false to prevent port 24678 conflicts in multi-process/pre-warming setups
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);

    // SPA fallback: transform and serve index.html for non-API client routes
    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      try {
        const url = req.originalUrl;
        const rootIndexHtml = path.resolve(__dirname, 'index.html');
        if (fs.existsSync(rootIndexHtml)) {
          let template = fs.readFileSync(rootIndexHtml, 'utf-8');
          template = await vite.transformIndexHtml(url, template);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        } else {
          next();
        }
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Production-hardened server running on http://0.0.0.0:${PORT}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[Server] Port ${PORT} already in use. A process is already listening.`);
    } else {
      console.error('[Server] Server error:', err);
    }
  });

  // Graceful termination handling
  const gracefulShutdown = () => {
    console.log('[Server] Gracefully shutting down...');
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}

startServer().catch((err) => {
  console.error('[Server Start Error]', err);
  process.exit(1);
});
