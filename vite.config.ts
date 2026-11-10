import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import { summarizeEpisodeForPharmacist, organizeSymptomDescription } from './server/geminiHandler.ts';
import {
  uploadToGoogleDrive,
  appendToGoogleSheet,
  readFromGoogleSheet,
  setGasEndpoint,
  getGasEndpoint,
  proxyToGas,
} from './server/googleIntegration.ts';

function geminiApiPlugin(): Plugin {
  return {
    name: 'gemini-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // 1. Gemini AI summarize
        if (req.method === 'POST' && req.url === '/api/gemini/summarize') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const parsed = JSON.parse(body || '{}');
              const summary = await summarizeEpisodeForPharmacist(parsed);
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, summary }));
            } catch (err: any) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err.message || 'Gemini error' }));
            }
          });
          return;
        }

        // 2. Gemini AI organize symptoms
        if (req.method === 'POST' && req.url === '/api/gemini/organize-symptoms') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const parsed = JSON.parse(body || '{}');
              const organized = await organizeSymptomDescription(parsed.text || '');
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, text: organized }));
            } catch (err: any) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err.message || 'Gemini error' }));
            }
          });
          return;
        }

        // 3. Drive File Upload to folder 16NAYAa6rlefbnTlIObqgdIePdG0207Dn
        if (req.method === 'POST' && req.url === '/api/drive/upload') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const payload = JSON.parse(body || '{}');
              const result = await uploadToGoogleDrive(payload);
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify(result));
            } catch (err: any) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err.message || 'Upload error' }));
            }
          });
          return;
        }

        // 4. Save Record to Sheet 1hRAW8P6_zWD-pGDxXohn7kOisp_QQlm8dsA8N8iFGiE
        if (req.method === 'POST' && req.url === '/api/sheets/save-record') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const payload = JSON.parse(body || '{}');
              const result = await appendToGoogleSheet(
                payload.action,
                payload.data,
                payload.userEmail || 'system',
                payload.role || 'Patient'
              );
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify(result));
            } catch (err: any) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              res.end(JSON.stringify({ status: 'error', message: err.message || 'Sheet error' }));
            }
          });
          return;
        }

        // 5. Read all data from Sheet
        if (req.method === 'GET' && req.url === '/api/sheets/fetch-all') {
          try {
            const result = await readFromGoogleSheet();
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify(result));
          } catch (err: any) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
          return;
        }

        // 6. Set / Get backend connector config (silent)
        if (req.url === '/api/sheets/config') {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const parsed = JSON.parse(body || '{}');
                if (parsed.gasUrl !== undefined) setGasEndpoint(parsed.gasUrl);
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, isConnected: Boolean(getGasEndpoint()) }));
              } catch (e: any) {
                res.statusCode = 400;
                res.end(JSON.stringify({ success: false, error: e.message }));
              }
            });
            return;
          } else {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, isConnected: Boolean(getGasEndpoint()) }));
            return;
          }
        }

        // 7. Proxy to Google Apps Script (CORS-free server fetch)
        if (req.url === '/api/sheets/proxy') {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                const parsed = JSON.parse(body || '{}');
                const targetUrl = parsed.targetUrl || getGasEndpoint();
                const method = parsed.method || 'GET';
                const payload = parsed.payload;

                const result = await proxyToGas(targetUrl, method, payload);
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 200;
                res.end(JSON.stringify(result));
              } catch (e: any) {
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 500;
                res.end(JSON.stringify({ status: 'error', message: e.message }));
              }
            });
            return;
          }
        }

        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), geminiApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

