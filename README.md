# Twitter Dashboard

NodeJS application for ZHAW (Zurich University of Applied Sciences) to display a Twitter keyword dashboard.

## Installation

### Twitter API credentials

* `cp sample_secrets.js secrets.js`
* Create Twitter Apps API account at [apps.twitter.com](https://apps.twitter.com)
* Fill out credentials in `secrets.js` 

## Running

* `npm start`


## Deployment

If you're deploying the application to a server with a firewall, make
sure that the required ports 8080 and 8000 are open. Alternatively you
are free to change the ports in all spots inside the application
(frontend and backend).

Also make sure that the deployment target is able to run `Node` and
`Faye`.
