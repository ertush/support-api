## Agrarian REST API

# Examples
## Read Resource / Get data

```
GET http://localhost:3000/api/v1/agrarian.js?param=Location/temperature  HTTP/1.1
 content-type: application/json
```
<hr>

## Create Resource / Store data

```
POST http://localhost:3000/api/v1/agrarian.js?param=Location/temperature HTTP/1.1
Content-Type: application/json

{"temperature": 34}
```

<hr>

## Update Resource / update data

```
PATCH  http://localhost:3000/api/v1/agrarian.js?param=Location/temperature 
HTTP/1.1
Content-Type: application/json

{"temperature": 54}
```

<hr>

## Delete Resource / delete data

```
DELETE  http://localhost:3000/api/v1/agrarian.js?param=Location/temperature HTTP/1.1
Content-Type: application/json
```