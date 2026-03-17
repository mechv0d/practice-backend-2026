FROM php:8.4-fpm

# Установка системных зависимостей
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    libmagickwand-dev \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath zip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Установка Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Установка рабочего каталога
WORKDIR /var/www/html

# Копирование файлов приложения
COPY . .

# Установка зависимостей для продакшена
RUN composer install --no-interaction --optimize-autoloader --no-dev

# Копирование конфигурационного файла
COPY .env.example .env

# Генерация ключа приложения
RUN php artisan key:generate

# Создание необходимых директорий и права доступа
RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
RUN chown -R www-data:www-data /var/www/html
RUN chmod -R 755 /var/www/html/storage /var/www/html/bootstrap/cache

# Кэширование конфигурации для продакшена
RUN php artisan config:cache
RUN php artisan route:cache
RUN php artisan view:cache

# Открытие порта
EXPOSE 8000

# Запуск
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
