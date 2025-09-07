# ---- Build the SPA ----
# If your Pi is 32-bit and this fails, switch to: node:20-bullseye-slim
FROM node:20-alpine AS build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/. .
# For Vite/React this creates "dist/"
RUN npm run build

# ---- Serve with Nginx ----
FROM nginx:1.27-alpine
# Copy our Nginx config
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Optional: smaller image, enable gzip module already in nginx-alpine
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
