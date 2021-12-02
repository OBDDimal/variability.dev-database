# Build step
FROM node:14-alpine as builder

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./
RUN yarn install
RUN npx browserslist@latest --update-db
COPY . ./
RUN yarn build


# Run step
FROM nginx:stable-alpine as production
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]   