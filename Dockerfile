FROM alpine:3.10

RUN mkdir /crontab-ui; touch /etc/crontabs/root; chmod +x /etc/crontabs/root

RUN apk --no-cache add \
    nodejs \
    npm

RUN npm install -g crontab-ui

WORKDIR /opt/woffu-signin
COPY src src
COPY bin bin
COPY package*.json ./
RUN npm install
RUN npm link

ENV CRON_PATH /etc/crontabs
ENV CRON_IN_DOCKER true

ENTRYPOINT crond && crontab-ui
