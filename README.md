# Collect Monitoring
Build a generic Rule Engine that can work across different entities and checkpoints

## Setup Instructions
To start or stop the test database, build the test-db image and run it

```
cd ./test-db
docker build -t test-db .
docker run -it -p 3306:3306 test-db
```

Some commands for working with the test server
```
cd ./rule-service
npm install         # setup everything
npm start           # run the server - you must have a test database running
```


## To test the entire stack, run

docker-compose build
docker-compose up -d

the app will be hosted at http://localhost:8123/decsion

Sample Request
```
curl --location --request POST 'http://localhost:8123/decision' \
--header 'Content-Type: application/json' \
--data-raw '{
	"checkpoint_id": 3,
	"entity_id": 2
}

'
```

Sample Response
```
{
	"eligible": true
	"message": Entity-3 can pass through Checkpoint-3

}