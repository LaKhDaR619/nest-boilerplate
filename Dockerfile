FROM node:14

WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
COPY yarn.lock ./
RUN yarn install --frozen-lockfile

# Bundle app source
COPY . .
RUN yarn build

# RUN yarn global add pm2

EXPOSE 80
CMD [ "node", "./dist/main.js" ]