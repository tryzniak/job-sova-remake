start-dev:
	npm run start

start-db:
	docker run -p 3366:3306 --name jobsova-remake -e MYSQL_DATABASE=jobsova-remake -e MYSQL_ROOT_PASSWORD=mypassword --rm mysql:5.7

db-init:
	node db/seed.js

client-db:
	docker exec -it jobsova-remake mysql -u root -p jobsova-remake
Enter password: 
