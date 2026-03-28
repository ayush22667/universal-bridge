FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
# Copy all server source files (server.js + lib/ + routes/)
COPY server.js .
COPY lib/ ./lib/
COPY routes/ ./routes/
EXPOSE 8080
CMD ["node", "server.js"]
