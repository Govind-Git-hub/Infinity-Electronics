# Use a small official Node image
FROM node:20-alpine

# Work inside /app in the container
WORKDIR /app

# Copy only package files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend code
COPY . .

# Backend listens on 5000
EXPOSE 5000

# Start the server
CMD ["npm", "run", "dev"]