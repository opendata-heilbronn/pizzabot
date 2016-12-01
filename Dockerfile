FROM mhart/alpine-node:base-7
WORKDIR /src
COPY src .
COPY node_modules ./node_modules
CMD ["node", "index.js"]