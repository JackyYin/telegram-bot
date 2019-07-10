FROM node:slim as builder
WORKDIR /usr/app/src

COPY package.json ./

RUN yarn install \
    && yarn cache clean

FROM builder as app
ARG PORT=3001
COPY . .
EXPOSE $PORT
CMD [ "yarn", "start" ]
