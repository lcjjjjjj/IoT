FROM node:20.18.0

WORKDIR /app

COPY package*.json ./
RUN npm install vuex@3.6.2 --save
RUN npm install

COPY . .

EXPOSE 8080

ENV HOST=0.0.0.0
ENV PORT=8080

CMD ["npm", "run", "dev"]

# docker build -t my-app .