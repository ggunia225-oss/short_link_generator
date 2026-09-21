MVP сервиса для сокращения ссылок с базовой аналитикой.

Монорепозиторий: backend (Node.js + Express + TypeScript + Prisma + PostgreSQL) и frontend (React + TypeScript + Vite).

## Стек технологий

### Backend
- Node.js (v22+)
- Express - веб-фрейморк
- TypeScript - типизация
- Prisma (v7) - ORM для работы с базой (с драйвер-адаптером @prisma/adapter-pg)
- PostgreSQL (v16) - база данных
- Zod - валидация данных
- CORS - для кросс-доменных запросов
- Redis - кеширование (TTL 1 час)

### Frontend
- React
- TypeScript
- Vite - сборщик
- CSS - стилизация

### Инфраструктура
- Docker + Docker Compose — контейнеризация всего стека
- Nginx - раздача статики и проксирование API в продакшене

## API
POST | /api/shorten - создание короткой ссылки. Принимает {originalUrl:string}. Возвращает {shortCode, shortUrl}
GET | /:shortCode - Редирект на оригинальный URL. Увеличивает счетчик переходов
GET | /api/stats/:shortCode - Статистика. Возвращает {originalUrl, shortCode, clicks, createdAt}

## Запуск: Через Docker Compose

### 1. Требования
- Docker + Docker Compose

### 2. Клонирование и настройка
git clone https://github.com/ggunia225-oss/short_link_generator.git
cd short_link_generator

Создайте корневой .env (рядом с docker-compose.yml)
Пример приложен в .env.example, можно переименовать в .env

В папке frontend тоже создайте .env
Пример приложен в .env.production.example, можно переименовать в .env

В Docker 'DB_HOST' и 'REDIS_HOST' переопределяются автоматически на 'postgres' и 'redis' - их в .env писать не нужно

### 3. Сборка и запуск

docker compose up -d --build

В докерфайлах прописаны зеркала, так как возможно у кого то не соберется если вдруг будет пытаться устанавливать пакеты из оригинального источника(из за санкций).  
Либо если у вас все работает с оригинальными источниками, то уберите строки с комментарием '# Зеркала' в докерфайлах, которые лежат в двух папках(backend,frontend)

Если будут предупреждения на счет rimraf, inflight, glob, то можно не обращать внимания и продолжить сборку.

Поднимутся 4 сервиса:
- postgres
- redis
- backend
- frontend

### 4. Проверка

docker compose ps
docker compose logs -f backend

Приложение доступно по адресу: http://localhost:8080

### 5. Остановка

docker compose down

С удалением данных БД:
docker compose down -v

## Примеры запросов

### Браузер
Зайти по адресу http://localhost:8080 и провести манипуляции там. Либо через curl, который будет описан ниже.

### Создание короткой ссылки
curl -X POST http://localhost:8080/api/shorten -H "Content-Type: application/json" -d '{"originalUrl":"https://example.com/very/long/url"}'

Ответ:
{"shortCode": "abc123",
"shortUrl":"http://localhost:8080/abc123"
}

### Переход по короткой ссылке
curl -L http://localhost:8080/abc123

Браузер перенаправится на https://example.com/very/long/url, а счетчик clicks увеличится на 1

### Статистика
curl http://localhost:8080/api/stats/abc123

Ответ:
{"originalUrl":"https://example.com/very/long/url",
"shortCode":"abc123",
"clicks":5,
"createdAt":"2026-09-11T12:00:00.000Z"
}

## Тесты
Проект покрыт интеграционными тестами API (Jest + Supertest). 
Тесты работают с реальной тестовой базой postgreSQL 'web_tz_test', что позволяет проверить не только логику контроллеров, но и корректность работы Prisma, миграций и ограничений БД.

### Что покрыто

Эндпоинты:
 - POST /api/shorten
 - GET /:shortCode
 - GET /api/stats/:shortCode

Всего 12 тестов.

### Стек тестирования
- Jest - фреймворк и раннер тестов
- Supertest - Реез-запросы к express-приложению без запуска сервера
- ts-jest - транспиляция TypeScript на лету
- dotenv-cli - загрузка .env.test в pretest

### Настройка окружения

1. Создайте тестовую базу данных:
Пример запроса: CREATE DATABASE web_tz_test OWNER user_tz;

2. Скопируйте шаблон переменных окружения:
cp backend/.env.test.example backend/.env.test

3. Заполните backend/.env.test своими значениями.

4. Запуск тестов
cd backend
npm test
Скрипт pretest автоматически применит миграции к web_tz_test перед прогоном:
"pretest": "dotenv -e .env.test -- prisma migrate deploy",
"test": "jest --runInBand"

### Изоляция тестов
Между тестами БД очищается автоматически (beforeEach в tests/setup.ts)
Если хотите проверить, что записи реально добавились в тестовую таблицу, то закомментируйте строки связанные с очисткой beforeEach.

### Redis в тестах
Тесты не требуют запущенного Redis. В setup.ts стоит заглушка.



## Технические детали
- Короткий код - 6 символов('A-Za-z0-9'), генерируется случайно с проверкой на коллизии.
- Кэширование - при первом редиректе URL читается из PostgreSQL и сохраняется в Redis на 1 час. При повторных запросах - отдается из Redis, БД для URL не читается.
- Счетчик переходов - всегда инкрементируется в PostgreSQL (кешировать нельзя - потеряем данные при падении Redis).
- Prisma 7 - использует драйвер-адаптер @prisma/adapter-pg
- Валидация - zod на бэкенде (URL, короткий код)