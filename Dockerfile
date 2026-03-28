# Stage 1: Build the Vite app from client/
FROM node:20-alpine AS build
WORKDIR /app
COPY client/package*.json ./
RUN npm ci
COPY client/ .
# VITE_API_URL is baked into the JS bundle at build time
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
