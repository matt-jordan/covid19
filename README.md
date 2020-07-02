# Covid

Coronavirus visualization.

I got tired of sites with Ads or sites with poor data visualization. Hence a new one.

# Data

This uses the NYTimes [Corona-19 Virus](https://github.com/nytimes/covid-19-data) data. An initial
dataset take from that repo is located in `src/models/data`.

TODO: Make it update periodically.

# Testing

Testing is done using `mocha`, which is invoked using `npm`:

```
$ npm run test
```

# Deployment

Configuration can be set through the following environment variables:

* `APP_URL_BASE`: String. Base URL to invoke for the API.
* `APP_USERNAME`: String. Username for the API.
* `APP_PASSWORD`: String. Password for the API.
* `LOG_LEVEL`: String. Bunyan log output level. Defaults to `debug`.
* `LOG_PRETTY`: Boolean. Whether or not to prettify log output.
* `NODE_ENV`: The config environment to use. Defaults to `development`.
* `PORT`: The port to listen on. Defaults to `3000`.
