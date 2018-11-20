FROM node:9 as builder
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app
RUN npm install
COPY . /usr/src/app
RUN $(npm bin)/ng build

FROM nginx:1.13.3-alpine
## Copy our default nginx config
COPY nginx/default.conf /etc/nginx/conf.d/
## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*
## From 'builder' stage copy over the artifacts in dist folder to default nginx public folder
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
CMD ["npm","start"]