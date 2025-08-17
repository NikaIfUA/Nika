# Use the latest stable Node.js image for building the frontend
FROM node:20-alpine as build

# Set the working directory
WORKDIR /app/frontend

# Copy package.json and package-lock.json first to leverage Docker cache
COPY frontend/package.json frontend/package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend files
COPY frontend ./

# Build the frontend
RUN npm run build

# Use Nginx to serve the built frontend
FROM nginx:alpine

# Copy the built frontend files to Nginx's default html directory
COPY --from=build /app/frontend/dist /usr/share/nginx/html

# Expose the default Nginx port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
