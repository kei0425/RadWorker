const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

const promisify = (callbackBasedApi) => (...args) => new Promise((resolve, reject) => {
    args.push((err, ...result) => {
        if (err) {
            reject(err);
        }
        else if (result.length <= 1) {
            resolve(result[0]);
        }
        else {
            resolve(result);
        }
    });

    // 上で詰めたコールバック関数も含めて、引数にAPIを適用する
    callbackBasedApi.apply(null, args);
});


exports.readFile = promisify(fs.readFile);
exports.writeFile = (filename, data) => new Promise((resolve, reject) => fs.writeFile(filename, data, err => {
    if (err) {
        if (err.code == 'ENOENT') {
            // 親ディレクトリがない場合は作成
            mkdirp(path.dirname(filename), (err) => {
                if (err) {
                    reject(err);
                }
                return exports.writeFile(filename,data);
            });
        }
        else {
            reject(err);
        }
    }
    else {
        resolve();
    }
}));
exports.readJSON = (filename) => exports.readFile(filename, 'utf8')
    .then(data => this.data = JSON.parse(data));
exports.writeJSON = (filename, data) => exports.writeFile(filename, JSON.stringify(data, null, '  '));
