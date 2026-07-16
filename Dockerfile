# Usa una imagen oficial y ligera de Nginx basada en Alpine Linux
FROM nginx:alpine

# Copia todos los archivos locales del repositorio al directorio público de Nginx
COPY . /usr/share/nginx/html/

# Expone el puerto 80, que es el puerto por defecto para tráfico HTTP
EXPOSE 80

# Inicia Nginx en primer plano para que el contenedor se mantenga activo
CMD ["nginx", "-g", "daemon off;"]
