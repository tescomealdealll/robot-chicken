FROM node:20

WORKDIR /usr/src/chicken-bot
VOLUME ["/usr/src/chicken-bot"]
COPY .babelrc .
COPY env.js .
COPY package.json .
COPY package-lock.json .
COPY chicken-bot.js .
COPY blacklist.json .
COPY database.json .
COPY env.js .
RUN npm install
RUN npm install @babel/core @babel/cli @babel/preset-env --save-dev
RUN npx babel chicken-bot.js --out-file transpiled-source.js
CMD ["node", "transpiled-source.js"]
