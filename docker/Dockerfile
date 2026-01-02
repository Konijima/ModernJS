# Stage 1: Build the application
FROM node:18-alpine as build

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy workspace package files
COPY packages/core/package.json ./packages/core/
COPY packages/app/package.json ./packages/app/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=build /app/packages/app/dist /usr/share/nginx/html

# Copy custom Nginx config
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
