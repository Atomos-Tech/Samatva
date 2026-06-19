FROM node:20-alpine
WORKDIR /app
COPY .output ./.output
ENV PORT=8080
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", ".output/server/index.mjs"]
