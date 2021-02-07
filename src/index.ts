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





export interface IGeocoderOptions {

    api_key?    : string
    api_url?    : string
    pace_limit? : number
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

export interface IGeoResultForward {

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





export class geocoder {

    private API_KEY : string | undefined
    private API_URL : string
    private pace    : pacekeeper

    constructor({api_key, api_url, pace_limit}: IGeocoderOptions = {}) {

        this.API_KEY = api_key || process.env[ENV_API_KEY]
        this.API_URL = api_url || process.env[ENV_API_URL] || DEFAULT_API_URL
        this.pace    = new pacekeeper({ interval: PACE_INTERVAL, pace: pace_limit || PACE_LIMIT, parse_429: true })
    }

    geocode(query : string | IGeoQuery): Promise<IGeoResultForward> {

        let q   : any = Object.assign(DEFAULT_QUERY, {key: this.API_KEY}, typeof query === 'string' ? {q: query} : query)
        let url : string = `${this.API_URL}?${Object.keys(q).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(q[key])}`).join('&')}`

        return this.pace
            .submit(() => fetch(url)).promise
            .then(res => typeof res?.json === 'function' ? res.json().then(update_status) : build_error(res))
    }
}

export default geocoder





function update_status(res: IGeoResultForward): IGeoResultForward {

    res.ok = res.status?.code === 200
    return res
}

function build_error(res: any): any {

    return {
        ok: false,
        status : {
            code: res?.status,
            message: res?.statusText
        }
    }
}