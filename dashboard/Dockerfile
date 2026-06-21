# Use the official Node.js 18 alpine image
FROM node:18-alpine AS runner

# Set working directory inside container
WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install clean dependencies for production
RUN npm ci

# Copy the rest of the source files
COPY . .

# Disable Next.js build-time telemetry warnings
ENV NEXT_TELEMETRY_DISABLED=1

# Compile production assets
RUN npm run build

# Expose server port
EXPOSE 3000

# Set running environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Launch Next.js production server
CMD ["npm", "start"]
