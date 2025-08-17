# COMMENT: There is no need to use nginx as part of frontend dockerfile
# Main concern here is responsibility of the container - it should be only for frontend
# Also its great to have hot-reload for development - building frontend disables that and requires rebuild on each change
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

ENTRYPOINT []
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
