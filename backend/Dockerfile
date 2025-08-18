# COMMENT: Why to use so old version of Deno?
FROM denoland/deno:alpine-2.1.4

# Set the working directory
WORKDIR /app

# COMMENT: We are not using PostgreSQL now, why to install the client?
# Install PostgreSQL client
RUN apk add --no-cache postgresql-client

# Copy deno.json and deno.lock first to leverage Docker cache
COPY deno.json deno.lock* ./

# Cache the dependencies without lockfile initially
RUN deno cache --reload main.ts || true

# Copy the rest of the backend files
COPY . ./

# Cache the backend dependencies again with all files
RUN deno cache main.ts

# Expose the application port
EXPOSE 8000

# Run the backend with watch mode for hot reload
CMD ["deno", "run", "--allow-net", "--allow-write", "--allow-read", "--allow-env", "--watch", "main.ts"]
