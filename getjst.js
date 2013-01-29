/**
 * @fileoverview This is the JavaScript library to adjust time.
 *     You can get the second of delay from standard time.
 *     It call the NTP JSONP API (http://www2.nict.go.jp/aeri/sts/tsp/PubNtp/clients.html)
 *     (written in Japanese) provided by [NICT](http://www.nict.go.jp/en/index.html).
 *     The API is for JST (Japan Standard Time), but available from any time zone
 *     all over the world.
 * @author Ryosuke Otsuya
 */

/**
 * the instance object of getjst.js library.
 * @type {Object}
 */
var JST = (function() {
    //API URL
    var URL_PROTOCOL = (location.protocol === 'https:') ? 'https:' : 'http:';

    var URLS = [
        '//ntp-a1.nict.go.jp/cgi-bin/jsont',
        '//ntp-b1.nict.go.jp/cgi-bin/jsont'
    ];

    //interval of retry
    var RETRY_INTERVAL = 100;

    //script tag
    var scripts = [];

    //results of JSONP response.
    var results = [];

    //the number of retry
    var retry_times = 10;

    //error flag
    var isError = false;

    //request method
    var request = function(callback) {

        scripts = [];
        results = [];
        retry_times = 10;
        isError = false;

        /**
         * Add script tag and call JSONP request.
         * @param {string} url URL of API.
         */
        var request = function(url) {
            var clientSec = ((Date.now ? Date.now() : (new Date()).getTime())) / 1000;
            var script = document.createElement('script');
            script.setAttribute('src', url + '?' + clientSec);
            script.setAttribute('type', 'text/javascript');
            script.setAttribute('charset', 'UTF-8');
            script.setAttribute('async', 'true');
            document.getElementsByTagName('head')[0].appendChild(script);
            scripts.push(script);
        };

        for (var i = 0, il = URLS.length; i < il; i++) {
            request(URL_PROTOCOL + URLS[i]);
        }

        response(callback);
    };

    //response method
    var response = function(callback) {
        var resultLength = results.length;
        var urlLength = URLS.length;
        var i, il;
        var result = {};

        //all response have not returned yet.
        if (resultLength < urlLength && retry_times-- > 0) {
            //retry 100ms after.
            setTimeout(function() {
                response(callback);
            }, RETRY_INTERVAL);
            return;
        }

        //remove all script tags.
        for (i = 0, il = scripts.length; i < il; i++ ) {
            document.getElementsByTagName('head')[0].removeChild(scripts[i]);
        }
        scripts = [];

        //timeout
        if (resultLength < urlLength) {
            //throw error
            result.status = 'error';
            result.msg = 'Timeout.';
            if (typeof callback !== 'undefined') {
                callback(result);
            }
            return;
        }

        //calculate
        var offset;
        var average = 0;
        var offsets = [];

        for (i = 0; i < resultLength; i++) {
            offset = results[i].st - results[i].it / 2 - results[i].rt / 2;
            offsets.push(offset);
            average += offset;
        }

        if (Math.max.apply(this, offsets)
            - Math.min.apply(this, offsets) > 0.2) {
            result.status = 'error';
            result.msg = 'the range of delay is too large.';
        } else {
            result.status = 'success';
            result.msg = '';
        }

        average = average / resultLength;
        result.delaySec = {
            average: average,
            min: Math.min.apply(this, offsets),
            max: Math.max.apply(this, offsets)
        }

        if (typeof callback !== 'undefined') {
            callback(result);
        }
    };

    var getError = function() {
        return isError;
    };

    var setResults = function(result) {
        results.push(result);
    };

    return {request: request, getError: getError, setResults: setResults};
})();

//callback function that JSONP calls.
var jsont = function(json) {
    if (JST.getError()) {
        return;
    }
    if (typeof json.it !== 'number' && typeof json.st !== 'number') {
        return;
    }
    json.rt = ((Date.now ? Date.now() : (new Date()).getTime())) / 1000;
    JST.setResults(json);
};
