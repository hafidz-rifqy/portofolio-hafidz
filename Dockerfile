FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy all application files (including the dist folder built locally)
COPY . .

# Make the start script executable
RUN chmod +x /app/start.sh

# Environment variables for production SQLite and Uploads paths
ENV NODE_ENV=production
ENV DB_PATH=/data/database.sqlite
ENV UPLOAD_DIR=/data/uploads
ENV PORT=3000

# Expose the standard port
EXPOSE 3000

# Start the application using the wrapper script
CMD ["/app/start.sh"]
