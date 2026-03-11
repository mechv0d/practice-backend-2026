# 🚀 Миграция на HTTPS (HTTP/2)

## 📋 Обзор
Перенос Laravel приложения на HTTPS с поддержкой HTTP/2 для максимальной производительности.

## 🛠️ Что нужно:

### Для разработки:
- Docker & Docker Compose
- OpenSSL (обычно установлен в системе)

### Для продакшена:
- Доменное имя
- Доступ к серверу (Ubuntu/CentOS/Debian)
- Let's Encrypt или SSL сертификат

---

## 🏗️ Для разработки (5 минут)

### 1. Генерация SSL сертификатов
```bash
# В Windows (Git Bash)
chmod +chmodx scripts/generate-ssl.sh
./scripts/generate-ssl.sh

# В Linux/Mac
chmod +x scripts/generate-ssl.sh
sudo ./scripts/generate-ssl.sh
```

### 2. Запуск с HTTPS
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 3. Доступ к приложению
- **HTTPS**: https://localhost:443
- **Автоматический редирект** с http://localhost:80

---

## 🌐 Для продакшена (30 минут)

### Вариант 1: Let's Encrypt (бесплатно)

#### 1. Установка Certbot
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx
```

#### 2. Получение сертификата
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

#### 3. Автопродление
```bash
sudo crontab -e
# Добавить строку:
0 12 * * * /usr/bin/certbot renew --quiet
```

### Вариант 2: Nginx конфигурация

#### Создай файл `/etc/nginx/sites-available/your-app`:
```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL сертификаты
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Оптимизация HTTP/2
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # HTTP/2 заголовки
    add_header Alt-Svc 'h2=":443"; ma=2592000';
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Laravel
    root /var/www/html/public;
    index index.php index.html index.htm;
    
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}

# Редирект HTTP → HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 🔧 Laravel конфигурация

### 1. Обнови `.env`:
```env
APP_URL=https://yourdomain.com
ASSET_URL=https://yourdomain.com

# Для разработки
APP_URL=https://localhost:443
ASSET_URL=https://localhost:443
```

### 2. Обнови `app/Providers/AppServiceProvider.php`:
```php
use Illuminate\Support\Facades\URL;

public function boot()
{
    if (app()->environment('production')) {
        URL::forceScheme('https');
    }
}
```

### 3. Очисти кэш:
```bash
php artisan config:clear
php artisan cache:clear
php artisan view:clear
```

---

## 📱 Frontend настройки

### React/Vite обнови `.env`:
```env
VITE_API_URL=https://yourdomain.com/api
VITE_APP_URL=https://yourdomain.com
```

### Для разработки:
```env
VITE_API_URL=https://localhost:443/api
VITE_APP_URL=https://localhost:443
```

---

## 🚀 Преимущества HTTP/2

### ✅ Что получишь:
- **Мультиплексирование**: Множественные запросы через одно соединение
- **Server Push**: Прогрузка критических ресурсов
- **Header Compression**: Сжатие заголовков HPACK
- **Binary Protocol**: Более эффективная передача данных
- **Приоритизация**: Важные ресурсы загружаются первыми

### 📊 Ожидаемый прирост производительности:
- **Загрузка страницы**: на 20-50% быстрее
- **Time to First Byte**: на 30-70% меньше
- **Количество запросов**: до 90% reduction в соединениях

---

## 🔍 Проверка работы

### 1. Проверь HTTPS:
```bash
curl -I https://yourdomain.com
```

### 2. Проверь HTTP/2:
```bash
curl -I --http2 https://yourdomain.com
# Ищи: HTTP/2 200
```

### 3. Браузер DevTools:
- Открой Chrome DevTools → Network
- Проверь столбец "Protocol"
- Должно быть "h2" или "http/2"

---

## ⚠️ Возможные проблемы

### SSL ошибки в браузере:
```bash
# Доверяй самоподписанному сертификату в разработке
# В Chrome: chrome://flags/#allow-insecure-localhost
```

### Mixed Content ошибки:
```php
// В Blade шаблонах используй asset() helper
{{ asset('css/app.css') }} // автоматически добавит HTTPS
```

### CORS проблемы:
```php
// В config/cors.php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => ['https://localhost:3000', 'https://yourdomain.com'],
```

---

## 🎉 Готово!

После этих шагов твое приложение будет работать на HTTPS с HTTP/2, что даст:
- 🔒 Безопасность
- ⚡ Производительность
- 🎯 SEO преимущества
- 📱 Лучший UX

Проверь работу и наслаждайся скоростью! 🚀
