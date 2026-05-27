FROM php:8.3-fpm

# Instala dependencias del sistema, compila extensiones PostgreSQL y limpia caché
RUN apt-get update && apt-get install -y libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql pgsql \
    && apt-get clean && rm -rf /var/lib/apt/lists/*
