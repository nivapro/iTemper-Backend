FROM nginx:latest

RUN rm /etc/nginx/conf.d/default.conf
COPY config/conf.d /etc/nginx/conf.d/

RUN rm /etc/nginx/nginx.conf
COPY config/nginx.conf /etc/nginx/nginx.conf

RUN rm -r /usr/share/nginx/html/*
COPY content /usr/share/nginx/html/

COPY dhparam/dhparam-2048.pem /etc/ssl/certs/

# VOLUME /usr/share/nginx/html
# VOLUME /etc/nginx
# RUN /bin/mkdir  -p /etc/letsencrypt && /bin/mkdir -p /var/www/cerbot
# RUN /bin/mkdir  -p /data/content && /bin/mkdir -p /data/config

