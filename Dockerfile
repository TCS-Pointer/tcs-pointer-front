# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copiar arquivo de exemplo e criar .env se não existir
COPY env.example ./
RUN if [ ! -f .env ]; then cp env.example .env; fi

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install --legacy-peer-deps

# Copiar código fonte
COPY . .

# Build da aplicação (as variáveis do .env estarão disponíveis)
RUN npm run build

# Run stage
FROM nginx:alpine

# Instalar dependências de segurança
RUN apk add --no-cache curl

# Copiar arquivos buildados
COPY --from=build /app/build /usr/share/nginx/html

# Copiar configuração do nginx otimizada para AWS
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Definir permissões corretas
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Expor porta 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

# Comando para iniciar o nginx
CMD ["nginx", "-g", "daemon off;"] 