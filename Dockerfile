FROM php:8.2-apache-bookworm

# Install system dependencies and PHP extensions needed for Laravel
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    git \
    curl \
    libzip-dev

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Enable Apache mod_rewrite and AllowOverride for .htaccess support
RUN a2enmod rewrite && \
    sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

# No DocumentRoot change needed, default is /var/www/html
WORKDIR /var/www/html

# Set permissions for storage and bootstrap/cache
# We'll do this via a shell script or directly if possible, 
# but since we use volumes in dev, it's often handled by the host.
# However, for consistency:
RUN chown -R www-data:www-data /var/www/html
