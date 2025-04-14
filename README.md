# FinConnect

## Steps to Host the Front-End Code
1. ``` git clone https://github.com/snetlamu/finconnect.git ```
2. ```sudo cp -r finconnect/finconnect-fe/dist/* /var/www/html/```
3. ```sudo sed -i '/server {/a\\tlocation /portfolio {\n\t\tproxy_pass http://${internal_load_balancer_fqdn}:8000;\n\t\tproxy_set_header Host $host;\n\t\tproxy_set_header X-Real-IP $remote_addr;\n\t\tproxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\t\tproxy_set_header X-Forwarded-Proto $scheme;\n\t}' /etc/nginx/sites-available/default && sudo nginx -t && sudo systemctl reload nginx```
4. ```sudo sed -i '/server {/a\\tlocation /news {\n\t\tproxy_pass http://${news_server_ip}:7000;\n\t\tproxy_set_header Host $host;\n\t\tproxy_set_header X-Real-IP $remote_addr;\n\t\tproxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\t\tproxy_set_header X-Forwarded-Proto $scheme;\n\t}' /etc/nginx/sites-available/default && sudo nginx -t && sudo systemctl reload nginx```

## Steps to Host the Back-End Code
### Portfolio
1. ``` git clone https://github.com/snetlamu/finconnect.git ```
2. ```cd finconnect/finconnect-be/portfolio```
3. ```go build```
4. ```echo "MONGODB_URI=mongodb://${db1_ip}:27017" > /home/ubuntu/finconnect/finconnect-be/portfolio/.env```
5. ```sudo sh -c 'echo -e "[Unit]\nDescription=FinConnect Portfolio Service\nAfter=network.target\n\n[Service]\nExecStart=/home/ubuntu/finconnect/finconnect-be/portfolio/finconnect\nRestart=always\nRestartSec=5\nUser=root\n\n[Install]\nWantedBy=multi-user.target" > /etc/systemd/system/finconnect-portfolio.service' && sudo systemctl daemon-reload && sudo systemctl enable --now finconnect-portfolio.service```

### News
1. ``` git clone https://github.com/snetlamu/finconnect.git ```
2. ```cd finconnect/finconnect-be/news```
3. ```go build```
4. ```echo "MONGODB_URI=mongodb://${db2_ip}:27017" > /home/ubuntu/finconnect/finconnect-be/portfolio/.env```
5. ```sudo sh -c 'echo -e "[Unit]\nDescription=FinConnect News Service\nAfter=network.target\n\n[Service]\nExecStart=/home/ubuntu/finconnect/finconnect-be/news/finconnect\nRestart=always\nRestartSec=5\nUser=root\n\n[Install]\nWantedBy=multi-user.target" > /etc/systemd/system/finconnect-news.service' && sudo systemctl daemon-reload && sudo systemctl enable --now finconnect-portfolio.service```