FROM oven/bun:1

WORKDIR /project

COPY bun.lockb package.json ./
RUN bun install --production --frozen-lockfile

COPY . .
EXPOSE 8080
CMD [ "bun", "start" ]
