# Dockerfile
FROM node:22

# Set the working directory
WORKDIR /usr/src

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

RUN npm install -g @nestjs/cli

# Copy the rest of the application code
COPY . .

# Compile TypeScript code
RUN npm run build

# Expose the application port
EXPOSE 4000

# Start the application
CMD ["npm", "run", "start:prod"]