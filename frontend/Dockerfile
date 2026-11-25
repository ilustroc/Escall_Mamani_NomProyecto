FROM nginx:alpine

# Configuración de Nginx para Angular SPA y proxy inverso
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Archivos estáticos de Angular compilados para producción
COPY frontend-compilado/ /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
