# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copia arquivos de dependência primeiro (melhor cache)
COPY package*.json ./

# Instala dependências com cache
RUN npm install --legacy-peer-deps

# Copia o restante do código
COPY . .

# Build da aplicação
RUN npm run build

# Stage final com nginx
FROM nginx:alpine

# Instala curl (para o healthcheck)
RUN apk add --no-cache curl

# Copia build para o nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copia config nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Permissões
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Expor porta
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
