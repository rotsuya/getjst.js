var JST = {
    scriptElems: [],        //JSONPのScriptタグ
    response: [],           //JSONPの結果
    urls: [                 //サーバURL
        '//ntp-a1.nict.go.jp/cgi-bin/jsont',
        '//ntp-b1.nict.go.jp/cgi-bin/jsont'
    ],
    isError: false,         //エラーフラグ
    retry: {
        interval: 100,      //リトライ間隔
        times:  10          //リトライ回数
    },

    //リクエスト処理
    request: function(callback) {
        var request = function(url) {
            var script = document.createElement('script');
            script.setAttribute('src', url + '?'
                + (new Date()).getTime() / 1000);
            script.setAttribute('type', 'text/javascript');
            script.setAttribute('charset', 'UTF-8');
            script.setAttribute('async', 'true');
            document.head.appendChild(script);
            JST.scriptElems.push(script);
        };

        for (var i = 0, il = JST.urls.length; i < il; i++) {
            request(JST.urls[i]);
        }

        JST.result(callback);
    },

    //集計処理
    result: function(callback) {
        var responseLength = JST.response.length;
        var urlLength = JST.urls.length;
        var i, il;
        var result = {};

        //まだ結果が全て帰ってきていない場合
        if (responseLength < urlLength && JST.retry.times-- > 0) {
            //100ミリ秒後にリトライ
            setTimeout(function() {
                JST.result(callback);
            }, JST.retry.interval);
            return;
        }

        //Scriptタグを削除
        for (i = 0, il = JST.scriptElems.length; i < il; i++ ) {
            document.head.removeChild(JST.scriptElems[i]);
        }

        //既定の回数リトライしても結果が全て帰って来なかった場合
        if (responseLength < urlLength) {
            //エラー発生
            result.status = 'error';
            result.msg = 'Timeout.';
            if (typeof callback !== 'undefined') {
                callback(result);
            }
            return;
        }

        //集計処理
        var offset;
        var average = 0;
        var offsets = [];

        for (i = 0; i < responseLength; i++) {
            offset = JST.response[i].st - JST.response[i].it / 2 - JST.response[i].rt / 2;
            offsets.push(offset);
            average += offset;
        }

        if (Math.max.apply(this, offsets)
            - Math.min.apply(this, offsets) > 0.2) {
            result.status = 'error';
            result.msg = 'Error is too large.';
        } else {
            result.status = 'success';
        }

        average /= responseLength;
        result.delay = {
            average: average,
            min: Math.min.apply(this, offsets),
            max: Math.max.apply(this, offsets)
        }

        if (typeof callback !== 'undefined') {
            callback(result);
        }
    }
};

//JSONPのコールバック処理
var jsont = function(json) {
    if (JST.isError) {
        return;
    }
    if (typeof json.it !== 'number') {
        return;
    }
    json.rt = new Date() / 1000;
    JST.response.push(json);
};
