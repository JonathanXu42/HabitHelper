# ---------- Base stage ----------
FROM node:22.13.1-alpine AS base
WORKDIR /app

# Install ca-certificates and openssl for Prisma to access MongoDB Atlas
RUN apk add --no-cache ca-certificates openssl

# Copy dependencies files
COPY package*.json ./

# Copy your Prisma schema location
COPY server/prisma ./server/prisma

# Install production dependencies
ENV NODE_ENV=production
RUN npm ci --omit=dev

# Generate Prisma client using custom schema path
RUN npx prisma generate --schema=server/prisma/schema.prisma

# ---------- Final image ----------
FROM node:22.13.1-alpine
WORKDIR /app

# Install ca-certificates and openssl in final image too
RUN apk add --no-cache ca-certificates openssl

# Copy only production dependencies and Prisma client
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=base /app/node_modules/@prisma ./node_modules/@prisma

# Copy app code (including server/ which contains built frontend and prisma schema)
COPY . .

# Expose port (optional — use your actual server port)
EXPOSE 8080

# Start backend
CMD ["node", "server/index.js"]