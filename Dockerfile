FROM node:14
WORKDIR /home/node/app
COPY app /home/node/app
RUN npm install
CMD npm run app