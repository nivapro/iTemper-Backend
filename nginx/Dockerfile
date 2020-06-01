FROM nginx:latest

# RUN set -x \
# Create nginx user/group first, to be consistent throughout Docker variants
#    && addgroup --system --gid 101 nginx \
#    && adduser --system --disabled-login --ingroup nginx --no-create-home --home /nonexistent --gecos "nginx user" --shell /bin/false --uid 101 nginx 

VOLUME /usr/share/nginx/html

VOLUME /etc/nginx



# RUN /bin/mkdir  -p /etc/letsencrypt && /bin/mkdir -p /var/www/cerbot

# RUN /bin/mkdir  -p /data/content && /bin/mkdir -p /data/config


VOLUME  /data/content
VOLUME  /data/config
# VOLUME /etc/letsencrypt

# VOLUME /var/www/certbot
# COPY content /usr/share/nginx/html 
# COPY conf /etc/nginx/conf.d


