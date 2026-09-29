FROM node:20-alpine
ARG PORT=5443
ARG isProd=false

ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["package.json", "yarn.lock", "./"]
# Install all dependencies (including devDependencies needed for build)
RUN yarn install --silent
# build next.js app
COPY . .
RUN yarn build
EXPOSE $PORT
# if isProd is true, run "yarn start:prod" else run "yarn start"
# Use shell to conditionally set the command
RUN if [ "$isProd" = "true" ] ; then echo "yarn start:prod" > ./start.sh ; else echo "yarn start" > ./start.sh ; fi
RUN chmod +x ./start.sh

CMD ["sh", "./start.sh"]

