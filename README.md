# Why OpenCageData?
* Absolute majority of geocoding services (Google, HERE, Mapbox, Yandex, ...) don't allow you to store geocoding results. With OpenCageData you are free to cache and store geocoding results as long as you want: [check OCD's policy on caching](https://opencagedata.com/api#caching)
* Generous free trial: 2500 free requests per day (as of Feb 08, 2021; please check with OpenCageData their current policy [here](https://opencagedata.com/pricing))
* More than reasonable subscription fees: [pricing](https://opencagedata.com/pricing)
* You can choose one-time purchase instead of subscription. You can buy 10 000 requests for 20 EUR (as of Feb 02, 2021; please check actual pricing with OpenCageData [here](https://opencagedata.com/pricing))
* And my favorite: geocoding quality is amazing even for such difficult locations as Russia and CIS





# Example
## Forward geocoding
```javascript
    const { geocoder } = require('geocoder-opencagedata')
    const coder = new geocoder({api_key: 'YOUR API KEY'})

    coder.geocode('New York City').then(resp => {

        if (resp.ok) {

            console.log('Geo coordinates:', resp.geo)
            //or use any other properties of the resp object which contains a complete response from API service
            //for more details on response properties please consult with API Reference at https://opencagedata.com/api#forward-resp
        }

        else {

            console.log('Request has failed')
            console.log('Check the full response from OpenCageData:', resp)
            console.log('Or you can check response status only:', resp.status.code, resp.status.message)
        }
    })

    //result:
    //Geo coordiantes: { lat: 40.7127281, lng: -74.0060152 }
```
## Reverse geocoding
Reverse geocoding is performed pretty the same way. The only difference is that you may be interested in other `response` object properties:
```javascript
    const { geocoder } = require('geocoder-opencagedata')
    const coder = new geocoder({api_key: 'YOUR API KEY'})

    coder.geocode('-22.6792, +14.5272').then(resp => {

        if (resp.ok) {

            console.log('Full response:', resp)
            console.log('The most probable address:', resp.address)
            //you may also want to check all other suggestions provided in array: resp.results
            //for more details on response properties please consult with API Reference at https://opencagedata.com/api#reverse-resp
        }
    })

    //result:
    //The most probable address: Beryl's Restaurant, Woermann St, Swakopmund 13001, Namibia
```





# Make it safe

To make your code safer put your API key to environment variable `OCD_API_KEY` and avoid passing it to the geocoder constructor as plain text in your code:

```javascript
    const coder = new geocoder() //In this case your are expected to provide your API key in OCD_API_KEY variable before using geocoder constructor
```





# Tune your query

OpenCageData provides lots of useful query options like countrycode, languagecode, bounds, add_request and manu more. You may use all of them with this API client.
Please check the full list of query options [here](https://opencagedata.com/api#forward-opt)
In order to make use of query options please pass a JSON object instead of a string to the `geocode` function, like so:

```javascript
    const coder = new geocoder()

    coder.geocode({q: 'New York', limit: 10, countrycode:'uk', no_annotations: 0}).then(console.log)
```
Please note that your query string goes to a mandatory property `q` of the query object.
Please be aware that whenever you provide a string as an argument to the `geocode` function (instead of a query object) the following default query options are applied to your query:
Option | Default value
------ | -------------
limit | 1
pretty | 0
no_annotations | 1

> The same default values will be applied to your query object if you ommit them.





# Response caching

By default the `geocoder` automaticaly caches responses *in memory*.
The cache is shared among all instances of the `geocoder` class that use *the same API KEY*.
If you change an API key, it makes cached responses effectively invisible to other `geocoder` instances if they use other API keys.

If you would like a particular `geocoder` instance not to use caching you may provide it a `{ cached: false }` option like so:

```javascript
    const coder = new geocoder({ cached: false })
    // By default "cached" option is set to true
```





# Batch requests throttling
It's important to note that just like any other service provider OpenCageData puts certain [limits](https://opencagedata.com/api#rate-limiting) on how much requests you may send per second. Free trial accounts are limited to 1 request per second. If you're going to issue requests at a faster rate you're probably going to be blocked by the server. Payed accounts are limited to much larger numbers of requests per second, but still these are not infinite numbers. When it comes to batch processing, a pace keeping techniques comes into play. The `geocoder-opencagedata` client supports requests throttling by default so you can rest peacefully. If you send lots of requests to `geocoder-opencagedata` they will be arranged in a queue and scheduled to be sent at rate of 1 request per second. This is exactly what free accounts need. But if you've got a payed account and want to utilize the service at a faster rate though still within the allowed limits you may want to tweek internal pace keeper by `pace_limit` option like so:
```javascript
    const coder = new geocoder({ pace_limit: 15 })
        // This will limit the geocoder to 15 requests per second.
        // Put here whatever suits your contract with OpenCageData
        // By default "pace_limit" equals to 1
```