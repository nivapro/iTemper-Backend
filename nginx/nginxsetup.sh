nginx -t && nginx -s reload
sudo certbot --nginx -d itemper.com -d www.itemper.com
crontab -e
0 12 * * * /usr/bin/certbot renew --quiet