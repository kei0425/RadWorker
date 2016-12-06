const baseUrl = exports.baseUrl = 'http://intlsystem-mobile.nippon-rad.co.jp/mobile/';
const cookiesUrl = 'http://intlsystem-mobile.nippon-rad.co.jp/hwr/';

exports.apitable = {
    getSession: {
        pre(inputs) {
            const options = {
                url: baseUrl + 'index.jsp',
                methd: 'GET'
            };

            return options;
        },
        after(body) {
            this.cookies = new Map(
                this.jar.getCookieString(cookiesUrl)
                .split(';')
                .map(x => x.trim().split('=')));
            this.JSESSIONID = this.cookies.get('JSESSIONID');
        }
    },
    login: {
        pre() {
            const options = {
                url: baseUrl + 'login.jsp',
                methd: 'POST',
                form: {}
            };
            
            options.form.NUM = this.userid;
            options.form.PASS = this.password;

            return options;
        }
    }
};