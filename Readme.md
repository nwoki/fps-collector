# FPS Stats Collector

A stats collector made in NodeJS as a projet to get to know the framework. I come from a c++ background, so don't cut you eyes out if you see some wonky stuff you backend devs don't usually do.


## Description

This application can be loaded anywhere and it's goal is to receive information from its node (not only it's counterpart, but other applications can submit data if they apply to the input format) and store it for interrogation later on. It uses a mysql database to store player statistics and has a read-only API to let others read those stats.


## How To
Be sure to fill in the info required in the `.env` file provided in the root dir of the project. This will contain the info needed for the collector to work.
The required fields are:

```
MYSQL_HOST=
MYSQL_USER=
MYSQL_PASS=
MYSQL_DB_NAME=
COLLECTOR_PORT=
```

`COLLECTOR_PORT` is the port you want to bind the collector to.
