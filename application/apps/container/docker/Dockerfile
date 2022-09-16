FROM node:14

ENV WORKING_DIR /app

RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

RUN mkdir -p ${WORKING_DIR}
WORKDIR ${WORKING_DIR}

COPY pnpm-lock.yaml ./
RUN pnpm fetch --prod

ADD . ./
RUN pnpm install -r --offline --prod

CMD cd /app/ && node --inspect=127.0.0.1:9230 ./apps/container/docker/src/index.js
