# Prerequisites

* NodeJS v20.5.0
* docker
* docker-compose

# Overview

A RESTful service written in NodeJS/Express to manage user logins. Normally would just use AWS Cognito, but going that approach won't allow me to do add much test coverage and it is mostly infrastructure work.

Major Architecture choices include:
* RESTful - I've got no experience with gRPC, so I decided to stick with what I know.
* bcrypt password hashing - one of the commonly recommended algorithms for password encryption, along with SHA-2, PBKDF2, Argon2. bcrypt was chosen partially because of ready made libraries available to me via NPM.
* MongoDB database - non-relational data. little need to query more than one record at a time. Alternatively, DynamoDB can be used, but without an AWS account/environment, I did not want to set one up.
* docker/docker-compose - Mostly just as a dev tool to allow me to stand up the entire solution with a single command. Kubernetes would be more ideal for scaling docker containers, but I have no experience with Kubernetes, but there are also serverless options but that is out of scope for this solution due to lack of an AWS environment.

## APIs

* POST /api/login/signin
  * Request
  ``` JSON
  {
    "userId": "testUser",
    "password": "<password>"
  }
  ```
  * Response
  ``` JSON
  {
    "success": true,
    "data": {
        "userId": "testuser",
        "role": "testRole",
        "token": "<jwt-token>"
    }
  }
  ```
* POST /api/login/signout
  * Request
  ``` JSON
  {
    "userId": "testUser",
    "token": "<jwt-token>"
  }
  ```
  * Response
  ``` JSON
  {
    "success": true
  }
  ```
* POST /api/login/register
  * Request
  ``` JSON
  {
    "userId": "testUser",
    "password": "<password>"
    "role": "testRole"
  }
  ```
  * Response
  ``` JSON
  {
    "success": true,
    "data": {
        "userId": "testuser",
        "role": "testRole",
        "token": "<jwt-token>"
    }
  }
  ```
## Testing done

Other than manual testing, I also wrote some tests for the validation/DB calls and controllers. Ideally, there'd be more as well as full on integration tests with a working DB, but that requires a CI/CD pipeline of some sort, and also I do not want to invest too much time into creating those tests. There could also be some more extensive unit testing done, but due to time constraint, I kept them down to the core functionality.

# Starting the service with docker compose

* Update ```.env.server``` with your JWT_SECRET environment variable (can generate from https://generate-secret.vercel.app/)

* From the project folder, run the following command
```docker-compose up --build```

# Building/Running the service directly

From the project folder, run the following command
* ```npm run build```
* ```npm run test```

## Testing locally

After building the project:
* Ensure you have mongodb running and accessible
* Update ```.env.local``` with your MONGO_URI and JWT_SECRET environment variable (can generate from https://generate-secret.vercel.app/)
  ```
  MONGO_URI='mongodb://<your mongodb url>'
  JWT_SECRET='<your secret>'
  ```
* ```npm run start```
