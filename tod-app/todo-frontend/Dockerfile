# Stage 1: Build Angular app
FROM node:20 AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build 

# Stage 2: Serve with Nginx
FROM nginx:alpine
# Remove default nginx page
RUN rm -rf /usr/share/nginx/html/*

# Copy Angular dist output (adjust name if different)
COPY --from=build /app/dist/todo-frontend/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
