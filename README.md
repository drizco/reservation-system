## Description

reservation system project

## Notes

- Given the time constraints, I chose to write e2e tests rather than unit tests. My thinking here is the e2e tests show a more complete picture of what has been built and includes todo tests showing what could not be completed in time.
- For the most part, I tried to apply TDD and wrote the tests prior to writing the endpoints, and attempted to follow a pattern of small incremental changes per requirement.
- I probably spent way too long trying to be fancy with my user models. I decided to create a `User` entity containing the common properties for both clients and providers (name, email, etc) and have it also hold references to `Client` and `Provider` entities, depending on the user type. This caused some issues, specifically a user now has two ids, their `userId` and either a `providerId` or `clientId`. If I could go back I'd probably just create the `Client` and `Provider` entites and have them share the same common properties.
- I was excited about the reservation expiration after 30 minutes, but I didn't have time to implement it. Part of the reason I decided to use this framework is for scheduling dynamic cron jobs, which I would kick off when an appointment is reserved.

## Unmet Requirements and Limitations

- A user cannot reserve an appointment time that is already reserved
- A user cannot make an appointment within 24 hours
- Reservation expiration after 30 minutes
- Needs authentication and authorization
- POST /availability endpoint could take an array of availabilty rather than one at a time

## Installation

```bash
$ npm install
```

## Running the app

- Create `.env` and `.env.test` file in the project root based off `.env.example`
- Provide a separate database for the test environment

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev
```

## Test

```bash
# e2e tests
$ npm run test:e2e
```
