import fetch from 'node-fetch'
import pacekeeper from 'pace-keeper'



const ENV_API_URL       : string    = 'OCD_API_URL'
const ENV_API_KEY       : string    = 'OCD_API_KEY'
const PACE_INTERVAL     : number    = 1000
const PACE_LIMIT        : number    = 1
const DEFAULT_API_URL   : string    = "https://api.opencagedata.com/geocode/v1/json"
const DEFAULT_QUERY     : IGeoQuery = {

    q               : '',
    limit           : 1,
    pretty          : 0,
    no_annotations  : 1
}
const CACHE             : {[key: string]: GeoResult} = {}





export interface IGeocoderOptions {

    api_key?    : string
    api_url?    : string
    pace_limit? : number
    cached?     : boolean
}

export interface IGeoQuery {

    q 				: string
    key?			: string
    abbrv?  		: number
    add_request?	: number
    bounds?			: string
    countrycode?	: string
    language?		: string
    limit?			: number
    min_confidence?	: number
    no_annotations?	: number
    no_dedupe?		: number
    no_record?		: number
    pretty?			: number
    proximity?		: string
    roadinfo?		: number
}

export interface IGeoPoint {

    lat : number
    lng : number
}

export interface IGeoResponseForwardCoding {

        ok              : boolean
        documentation   : string
        licenses        : { name: string, url: string }[]
        rate            : { limit: number, remaining: number, reset: number }
        results         : {
                            annotations?  : any
                            bounds        : { northeast: IGeoPoint, southwest: IGeoPoint }
                            components?   : any
                            confidence    : number,
                            formatted     : string,
                            geometry      : IGeoPoint
                        }[]

        status          : { code: number, message: string }
        stay_informed   : { blog: string, twitter: string }
        thanks          : string,
        timestamp       : { created_http : string, created_unix: number }
        total_results   : number
}

export interface IGeoResult {

    ok  : boolean
    geo : IGeoPoint
}





export class geocoder {

    private API_KEY : string | undefined
    private API_URL : string
    private pace    : pacekeeper
    private cached  : boolean

    constructor({api_key, api_url, pace_limit, cached}: IGeocoderOptions = { cached: true }) {

        this.API_KEY = api_key || process.env[ENV_API_KEY]
        this.API_URL = api_url || process.env[ENV_API_URL] || DEFAULT_API_URL
        this.pace    = new pacekeeper({ interval: PACE_INTERVAL, pace: pace_limit || PACE_LIMIT, parse_429: true })
        this.cached  = cached === undefined ? true : !!cached
    }

    geocode(query : string | IGeoQuery): Promise<GeoResult> {

        let q       : any = Object.assign(DEFAULT_QUERY, {key: this.API_KEY}, typeof query === 'string' ? {q: query.trim()} : query)
        let url     : string = `${this.API_URL}?${Object.keys(q).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(q[key])}`).join('&')}`

        if (this.cached) {

            let cached  : GeoResult | undefined = CACHE[url.toLowerCase()]
            if (cached) return Promise.resolve(cached)
        }

        return this.pace
            .submit(() => fetch(url)).promise
            .then(res => typeof res?.json === 'function' ? res.json().then(this.cached ? cache_result(url) : build_result) : build_error(res))
    }
}

export default geocoder





function cache_result(url: string): (res: any) => GeoResult {

    return function(res: any): GeoResult {

        let result = new GeoResult(res)

        if (url && typeof url === 'string') {

            CACHE[url.toLowerCase()] = result
        }

        return result
    }
}



function build_result(res: any): GeoResult {

    return new GeoResult(res)
}



function build_error(res: any): GeoResult {

    return new GeoResult({
        status : {
            code: res?.status,
            message: res?.statusText
        }
    })
}



class GeoResult implements IGeoResult {

    public status : undefined | { code: number, message: string }
    public results: undefined | {
        annotations?  : any
        bounds        : { northeast: IGeoPoint, southwest: IGeoPoint }
        components?   : any
        confidence    : number,
        formatted     : string,
        geometry      : IGeoPoint
    }[]

    constructor(data: any) {

        Object.assign(this, data)
    }

    get ok() : boolean {

        return this.status?.code === 200
    }

    get geo() : IGeoPoint {

        return this.ok && Array.isArray(this.results) && this.results.length > 0 ? this.results[0].geometry : { lat: 0, lng: 0 }
    }
}