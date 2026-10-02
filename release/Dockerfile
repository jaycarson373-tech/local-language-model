FROM node:24-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
ENV NODE_ENV=production PORT=3000 DB_PATH=/data/llm.sqlite PUBLIC_URL=https://local-language-model.vercel.app
EXPOSE 3000
VOLUME ["/data"]
CMD ["npm","start"]
