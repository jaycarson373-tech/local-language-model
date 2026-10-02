# Vercel deployment

Both repository root and `release/` are supported. The root `vercel.json` installs and builds only the verified standalone source in `release/`; output is `release/dist`. The release-local config uses `dist`. Runtime: Node 24. Redeploy the latest commit.

The GitHub integration should trigger a Vercel deployment after these configuration files arrive. If project-level command overrides exist, remove them or use:
- Root Directory: repository root (empty).
- Install Command: `npm install --prefix release`.
- Build Command: `npm run build --prefix release`.
- Output Directory: `release/dist`.
- Framework: Vite.

All eight application routes use SPA fallback. No fake account, credit balance, model response, payment, or burn is added. Without a backend, availability reports preview / model not connected, and account operations return an explicit 503.

## Connect the actual account service

Vercel hosts the interface and a stateless same-origin API relay. It does not host the SQLite ledger. Run the existing `release/Dockerfile` backend as one persistent Node 24 instance, with durable storage mounted for `DB_PATH`. Configure secrets on that backend, never in browser environment variables.

Set the Vercel server-side environment variable `LLM_BACKEND_URL=https://YOUR-PERSISTENT-BACKEND-ORIGIN` and redeploy. It must be an HTTPS origin with no path, credentials, query or fragment. Set backend `PUBLIC_URL` to the exact HTTPS Vercel/custom-domain origin used by customers. Keep `NODE_ENV=production`. If using a custom domain, use that same domain throughout wallet signing and session access.

The relay preserves bearer authentication, HttpOnly wallet cookies and browser Origin for the existing CSRF checks. Provider execution, reservations, settlement, maintenance and recovery remain on the durable backend. It streams actual backend responses. Redirects are rejected to protect secrets; financial data is never cached. Disconnects do not automatically refund reservations. Proxy duration is 60 seconds (55-second upstream timeout); the backend continues its own accounting. Check request history before retrying a timed-out generation.

Provider credentials, cleared funding and canonical-chain configuration are still required to activate chat or financial operations. See OPERATOR.md. Do not run this ledger on Vercel's ephemeral filesystem. Production database migration to a durable external database is a separate implementation if a persistent backend is not wanted.

## Evidence

The Vercel tests exercise HTTP preview failure, authentication/cookie/origin forwarding, streamed upstream bytes, route/redirect safety and request size limits. They use a controlled test upstream; they do not claim paid-model or production-chain verification.

The public interface is deployed at https://local-language-model.vercel.app. Public-browser checks verify the actual homepage and API preview states. Production compute still requires the durable backend, verified custom endpoint, mint configuration and cleared funds. See LAUNCH.md for exact Railway and Vercel settings.
