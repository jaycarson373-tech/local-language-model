# Repository-root Railway deployments always run the canonical release.
FROM node:24-bookworm-slim
WORKDIR /app
COPY release/package*.json ./
RUN npm install
COPY release/ ./
RUN npm run build
ENV NODE_ENV=production PORT=3000 DB_PATH=/data/llm.sqlite PUBLIC_URL=https://local-language-model.vercel.app
EXPOSE 3000
# Railway mounts the persistent /data volume through service configuration.
CMD ["npm","start"]
