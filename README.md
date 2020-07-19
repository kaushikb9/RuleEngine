# Collect Monitoring
Build a generic Rule Engine that can work across domains

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
npm test 			# unit test - no need for a test database running
npm start           # run the server - you must have a test database running
npm run debug       # run the server in debug mode, opens a browser with the inspector
npm run lint        # check to see if the code is beautiful
```
## Run the App

- Run `npm start` to start the node server
- App will start at `http://localhost:8123`
- Make a POST request to `http://localhost:8123/decision` with a relevant body

**Example cURL**

```
curl --location --request POST 'http://localhost:8123/decision' \
--header 'Content-Type: application/json' \
--data-raw '{
    "checkpoint_id": 3,
    "entity_id": 1
}'
```

You will get a response
```

{
    "eligibility": false,
    "message": "Entity 1 cannot proceed with checkpoint 3"
}
```

More rules and activities can be added in the relevant tables and the app will work just fine