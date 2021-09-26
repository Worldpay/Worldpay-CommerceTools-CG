FROM node:12

ENV WORKING_DIR /app

RUN mkdir ${WORKING_DIR}
WORKDIR ${WORKING_DIR}

COPY ./ ${WORKING_DIR}/

RUN npm i

CMD node index.js
