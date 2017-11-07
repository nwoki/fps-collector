FROM node:8.9

USER node
WORKDIR /home/node/app
COPY ./package.json ./.env ./
COPY ./src ./src/
COPY ./node_modules ./src/node_modules

EXPOSE 6666

CMD ["npm", "start"]
