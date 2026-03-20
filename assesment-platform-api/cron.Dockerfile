# Use an official Node.js runtime as a parent image
FROM node:20-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and yarn.lock to the working directory
COPY package.json yarn.lock ./

# Install any needed packages
RUN yarn install --frozen-lockfile

# Bundle app source
COPY . .


# Define the command to run the app
CMD [ "node", "cron/index.js" ]
