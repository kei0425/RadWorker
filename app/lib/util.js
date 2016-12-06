exports.getflattext = function(x) {
    if ('map' in x) {
        return Array.prototype.concat.apply(
            [],
            x.map(function () {
                return exports.getflattext(this);
            }));
    }
    if (typeof(x.data) == 'string') {
        let data = x.data.trim();
        if (data != "") {
            return [data];
        }
        else {
            return [];
        }
    }
    else if (x.childNodes) {
        return Array.prototype.concat.apply(
            [],
            Array.from(x.childNodes).map(exports.getflattext));
    }
    else {
        console.log(x);
        return [];
    }
};

exports.array2Object = function(pairs) {
    const ret = {};
    for (let i = 0; i < pairs.length; i++) {
        ret[pairs[i][0]] = pairs[i][1];
    }
    
    return ret;
};

exports.getParams = function(url) {
    return exports.array2Object(url.split('?')[1].split('&').map(x => x.split('=')));
};

exports.makeurl = function(params) {
    let url = '';
    if (params.url) {
        url = params.url + '?';
    }
    return url + Object.entries(params).filter(x => x[0] != 'url').map(x => {
            if (Array.isArray(x[1])) {
                return x[1].map(v => {
                    return `${x[0]}=${v}`;}).join('&');
            }
            return `${x[0]}=${x[1]}`;
        })
        .join('&');
};

exports.groupby = function(array, keyfunc) {
    const ret = {};
    array.forEach(x => {
        let key = keyfunc(x);
        if (!(key in ret)) {
            ret[key] = [];
        }
        ret[key].push(x);
    });
    
    return ret;
};

exports.async = (...args) => new Promise((resolve, reject) => {
    let [_self, gfn] = args;
    if (typeof(_self) == "function") {
        gfn = _self;
        _self = {};
    }
    const fn = gfn.call(_self);
    function loop(result = undefined) {
        while (true) {
            let p = fn.next(result);
            result = p.value;

            if (p.done) {
                resolve(result);
                break;
            }
            if (typeof(result) == 'object' && result.then) {
                result.then(x => loop(x)).catch(err => reject(err));
                return;
            }
        }
    }
    
    loop();
});
