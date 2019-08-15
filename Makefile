start-dev:
	npm run start

start-db:
	docker run -p 3366:3306 --name kilometry -e MYSQL_DATABASE=kilometry -e MYSQL_ROOT_PASSWORD=mypassword --rm mysql:5.7

db-init:
	node db/seed.js

client-db:
	docker exec -it kilometry mysql -u root -p kilometry
Enter password: 