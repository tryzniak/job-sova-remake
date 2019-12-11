# Make sure everything is right here
# (I'm a horrible person)
#
start-dev:
	npm run start

start-db:
	docker run -p 3306:3306 --name jobsova-remake -e MYSQL_DATABASE=jobsova -e MYSQL_ROOT_PASSWORD=qwerty --rm mysql:5.7

db-init:
	node db/init.js

client-db:
	docker exec -it jobsova-remake mysql -u root -p jobsova
Enter password: 
