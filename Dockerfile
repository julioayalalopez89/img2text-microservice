# Imagen del img2text-microservice.
# `canvas` (node-canvas) trae binarios precompilados, pero si no hay uno para la
# plataforma se compila desde código: por eso la etapa de build lleva las
# cabeceras de Cairo/Pango y la de runtime solo las librerías compartidas.

# ---------- build ----------
FROM node:22-bookworm-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends \
      build-essential python3 pkg-config \
      libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---------- runtime ----------
FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
      libcairo2 libpango-1.0-0 libpangocairo-1.0-0 libjpeg62-turbo libgif7 librsvg2-2 \
    && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production \
    PORT=3000 \
    UPLOAD_DIR=/tmp/uploads
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "src/server.js"]
