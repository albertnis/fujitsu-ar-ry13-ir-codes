FROM node:18-alpine

WORKDIR /project

COPY package.json .
COPY yarn.lock .

RUN yarn install --production

COPY src-js src-js

EXPOSE 8080
CMD [ "yarn", "start" ]