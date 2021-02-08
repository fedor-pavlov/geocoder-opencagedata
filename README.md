# Why OpenCageData?
* Absolute majority of geocoding services (Google, HERE, Mapbox, Yandex, ...) don't allow you to store their geocoding data. With OpenCageData you are free to do so: [check OCD's policy on caching](https://opencagedata.com/api#caching)
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
            //for more details on response properties please consult with API Reference: https://opencagedata.com/api#forward-resp
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
Reverse geocoding is performed pretty the same way. The only difference is that you may be interested in other ```response``` object properties:
```javascript
    const { geocoder } = require('geocoder-opencagedata')
    const coder = new geocoder({api_key: 'YOUR API KEY'})

    coder.geocode('-22.6792, +14.5272').then(resp => {

        if (resp.ok) {

            console.log('Full response:', resp)
            console.log('The most probable address:', resp.address)
            //you may also want to check all other suggestions provided in array: resp.results
            //for more details on response properties please consult with API Reference: https://opencagedata.com/api#reverse-resp
        }
    })

    //result:
    //The most probable address: Beryl's Restaurant, Woermann St, Swakopmund 13001, Namibia
```





# Making it safe

To make your code safer put your API key to environment variable ```OCD_API_KEY``` and avoid passing it to the geocoder constructor as plain text in your code:

```javascript
    const coder = new geocoder() //In this case your are expected to provide your API key in OCD_API_KEY variable before using geocoder constructor
```





# Tune your query

Instead of sending just a string to geocoding service, you may check [these query parameters](https://opencagedata.com/api#forward-opt) and submit them as a JSON object to the ```geocode``` function, like so:

```javascript
    const coder = new geocoder()

    coder.geocode({q: 'New York', limit: 10, countrycode:'uk', no_annotations: 0}).then(console.log)
```

Whenever you provide a string as an argument to the ```geocode``` function the following set of default query options is applied to your query:
Option | Default value
------ | -------------
limit | 1
pretty | 0
no_annotations | 1





# Response caching

By default the ```geocoder``` automaticaly caches responses *in memory*.
The cache is *shared* among all instances of the ```geocoder``` class with _THE SAME API KEY_.
If you change an API key, it makes cached responses effectively invisible to other ```geocoder``` instances if they use other API keys.

If you would like to swith off the caching mechanism you may provide ```{ cached: false }``` option to the object constructor like so:

```javascript
    const coder = new geocoder({ cached: false })
```