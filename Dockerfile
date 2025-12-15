FROM node:18-alpine

WORKDIR /app

# Копируем зависимости
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY . .

# Открываем порт
EXPOSE 3000

# Команда запуска (для разработки)
CMD ["npm", "run", "dev"]