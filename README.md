# job-sova-remake

## Установка и запуск

- docker-compose up
- docker exec jobsova-api npm run db-seed # Засеивание базы данных
- localhost:3000 # адрес и порт по-умолчанию

## Клиентское подключение к DB
- docker exec -it jobsova-db mysql -u root -p jobsova # до этого запустить docker-compose up
