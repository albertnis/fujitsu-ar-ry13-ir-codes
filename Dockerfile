FROM oven/bun:1

WORKDIR /project

COPY . .

EXPOSE 8080
CMD [ "bun", "start" ]
