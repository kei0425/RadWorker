const request = require('request');
const $ = require('cheerio');
const ut = require('./util');
const apitable = require('./apitable');
const fs = require('./promisifiedFs');
const Iconv = require('iconv').Iconv;
const jschardet = require('jschardet');

class RadApi {
    log(...args) {
        if (this.test) {
            console.log(...args);
        }
    }
    constructor(userid, password) {
        this.test = true;
        this.userid = userid;
        this.password = password;
        this.jar = request.jar();
        this.connectDatas = [];
    }

    api(key, inputs) {
        this.log('start api');
        return ut.async(this, function *() {
            try {
                this.log('start async');
                const api = apitable.apitable[key];
                let httpOptions = yield api.pre.call(this, inputs);
                this.log('get httpOptions');
                let body = yield this.getData(httpOptions);
                this.log('get response');
                if (!api.after) {
                    this.log('not after');
                    return [{body}, body];
                }
                else {
                    let data = yield api.after.call(this, body);
                    this.log('get after');
                    return [data, body];
                }
                
            }
            catch (e) {
                console.log(e);
            }
        });
    }

    getData(options) {
        if (typeof(options) == 'string') {
            options = {url:options};
        }
        options.encoding = null;
        options.jar = this.jar;
        const connectData = {
            date: Date.now()
        };
        this.connectDatas.push(connectData);

        this.log('start request:', options);

        return new Promise((resolve, reject) => request(options, (error, response, body) => {
            this.log('response request');
            connectData.response = response;
            connectData.error = error;
            
            if (error) {
                this.log('error:', error);
                this.error = error;
                reject(error);
            }
            else {
                this.response = response;
                const detectResult = jschardet.detect(response.body);
                const iconv = new Iconv(detectResult.encoding, 'UTF-8//TRANSLIT//IGNORE');
                const convertedString = iconv.convert(body).toString();
                this.$ = $.load(convertedString);
                resolve(convertedString);
            }}));
    }
    
    getResponse(options, filename) {
        return ut.async(this, function *() {
            let body, data = undefined;
            if (typeof(options) == 'string') {
                body = yield this.getData(options);
            }
            else {
                [data, body] = yield this.api(...options);
            }
            
            if (filename) {
                let htmlfilename = `./logs/${filename}.html`;
                yield fs.writeFile(htmlfilename, body);
                this.log(`wrote ${htmlfilename}`);
                
                if (data) {
                    let jsonfilename = `./logs/${filename}.json`;
                    yield fs.writeJSON(jsonfilename, data);
                    this.log(`wrote ${jsonfilename}`);
                }
            }
        });
    }
}

exports.RadApi = RadApi;