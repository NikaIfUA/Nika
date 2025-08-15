# Use the official Deno image
FROM denoland/deno:alpine-1.35.3

# Set the working directory
WORKDIR /app

# Copy the necessary files for the backend
COPY . .

# Install PostgreSQL client
RUN apk add --no-cache postgresql-client

# Cache the backend dependencies
RUN deno cache /app/backend/main.ts

# Expose the application port
EXPOSE 8000

# Run the backend
CMD ["run", "--allow-net", "--allow-read", "backend/main.ts"]
