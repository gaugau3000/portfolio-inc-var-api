FROM node:16-alpine3.14 as builder

ENV NODE_ENV build

USER node
WORKDIR /home/node

COPY package*.json ./

COPY --chown=node:node . .
RUN yarn install && yarn run build && yarn install --production --ignore-scripts --prefer-offline

FROM node:16-alpine3.14

ENV NODE_ENV production

USER node
WORKDIR /home/node

COPY --from=builder --chown=node:node /home/node/package*.json ./
COPY --from=builder --chown=node:node /home/node/node_modules/ ./node_modules/
COPY --from=builder --chown=node:node /home/node/dist/ ./dist/
COPY --from=builder --chown=node:node /home/node/prisma/ ./prisma

CMD [ "npm", "run", "start:prod"]