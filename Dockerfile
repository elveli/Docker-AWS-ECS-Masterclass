# Stage 1: Build the React Application
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve via Nginx (Production microservice approach)
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 3000 to match the Terraform configuration
EXPOSE 3000

# Overwrite Nginx default config to listen on 3000 instead of 80
RUN sed -i 's/listen  *80;/listen 3000;/g' /etc/nginx/conf.d/default.conf

# Run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
