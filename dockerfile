FROM node:20

WORKDIR /usr/src/app

COPY . .

# Install all dependencies for building
RUN npm ci
# Build and create compiled/dist JS files
RUN npm run build
# Delete non-dev requirements
RUN npm ci --omit=dev

EXPOSE 3000

CMD ["node", "/usr/src/app/dist/src/server.js"]