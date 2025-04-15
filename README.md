# FinConnect

## Steps to Host the Front-End Code
1. ``` git clone https://github.com/snetlamu/finconnect.git ```
2. ```sudo cp -r finconnect/finconnect-fe/dist/* /var/www/html/```
3. ```sudo awk '/server[[:space:]]*{/ && ++c==1 { print; print "    location /portfolio {\n        proxy_pass http://${portfolio_server_ip}:5000;\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n        proxy_set_header X-Forwarded-Proto $scheme;\n    }"; next } 1' /etc/nginx/sites-available/default | sudo tee /etc/nginx/sites-available/default > /dev/null && sudo nginx -t && sudo systemctl reload nginx```
4. ```sudo awk '/server[[:space:]]*{/ && ++c==1 { print; print "    location /news {\n        proxy_pass http://${news_server_ip}:7000;\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n        proxy_set_header X-Forwarded-Proto $scheme;\n    }"; next } 1' /etc/nginx/sites-available/default | sudo tee /etc/nginx/sites-available/default > /dev/null && sudo nginx -t && sudo systemctl reload nginx```

## Steps to Host the Back-End Code
### Portfolio
1. ``` git clone https://github.com/snetlamu/finconnect.git ```
2. ```cd /home/ubuntu/finconnect/finconnect-be/portfolio```
3. ```go build```
4. ```echo "MONGODB_URI=mongodb://${db1_ip}:27017" > /home/ubuntu/finconnect/finconnect-be/portfolio/.env```
5. ```sudo sh -c 'echo -e "[Unit]\nDescription=FinConnect Portfolio Service\nAfter=network.target\n\n[Service]\nExecStart=/home/ubuntu/finconnect/finconnect-be/portfolio/finconnect\nRestart=always\nRestartSec=5\nUser=root\n\n[Install]\nWantedBy=multi-user.target" > /etc/systemd/system/finconnect-portfolio.service' && sudo systemctl daemon-reload && sudo systemctl enable --now finconnect-portfolio.service```

### News
1. ``` git clone https://github.com/snetlamu/finconnect.git ```
2. ```cd /home/ubuntu/finconnect/finconnect-be/news```
3. ```go build```
4. ```echo "MONGODB_URI=mongodb://${db2_ip}:27017" > /home/ubuntu/finconnect/finconnect-be/news/.env```
5. ```sudo sh -c 'echo -e "[Unit]\nDescription=FinConnect News Service\nAfter=network.target\n\n[Service]\nExecStart=/home/ubuntu/finconnect/finconnect-be/news/finconnect\nRestart=always\nRestartSec=5\nUser=root\n\n[Install]\nWantedBy=multi-user.target" > /etc/systemd/system/finconnect-news.service' && sudo systemctl daemon-reload && sudo systemctl enable --now finconnect-news.service```