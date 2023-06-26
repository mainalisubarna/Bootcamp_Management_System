#DOcker file for node application

FROM node:18-alpine

# Working directory of our application
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --silent

COPY . .

EXPOSE 8082

CMD ["npm","start"]