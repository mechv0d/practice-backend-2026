#!/bin/bash

# Создание директории для SSL сертификатов
mkdir -p docker/nginx/ssl

# Генерация самоподписанного сертификата для разработки
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout docker/nginx/ssl/localhost.key \
    -out docker/nginx/ssl/localhost.crt \
    -subj "/C=RU/ST=Moscow/L=Moscow/O=Dev/OU=Dev/CN=localhost"

echo "SSL сертификаты созданы для разработки!"
echo "Файлы сохранены в docker/nginx/ssl/"
