FROM node:16.6-alpine3.14 as builder
ARG CLI_VERSION
ENV CLI_VERSION=$CLI_VERSION
ENV NODE_ENV=development

WORKDIR /code
COPY . .

RUN npm i
RUN npx tsc

# Final runnable image for the CLI
FROM node:16.6-alpine3.14
ARG CLI_VERSION
ENV CLI_VERSION=$CLI_VERSION
ENV NODE_ENV=production

RUN apk -U upgrade

WORKDIR /code

COPY --from=builder /code/package-lock.json ./package-lock.json
COPY --from=builder /code/package.json ./package.json
COPY --from=builder /code/bin ./bin
RUN npm i --only=production

RUN addgroup -g 1001 -S app \
    && adduser -u 1001 -S app -G app \
    && chown -R app /code
USER app

ENTRYPOINT ["node", "./bin/index.js"]
