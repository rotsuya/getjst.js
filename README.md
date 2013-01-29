# getjst.js

* This is the JavaScript library to adjust time.
* You can get the second of delay from standard time.
* It call the [NTP JSONP API](http://www2.nict.go.jp/aeri/sts/tsp/PubNtp/clients.html) (written in Japanese) provided by [NICT](http://www.nict.go.jp/en/).
* The API is for JST (Japan Standard Time), but available from any time zone all over the world.

# 

* 時刻を合わせるためのJavaScriptライブラリです。
* 標準時からの遅れ(秒数)を取得出来ます。
* [NICT](http://www.nict.go.jp/)が提供する[NTP JSONP API](http://www2.nict.go.jp/aeri/sts/tsp/PubNtp/clients.html)を利用しています。
* NICTのAPIはJST(日本標準時)のために用意されていますが、世界中のすべてのタイムゾーンから利用できます。

## Demo / デモ

* http://rotsuya.github.com/getjst.js/demo.html

## How to use / 使い方

```javascript
var callback = function(result) {
  // 'result' is the result of adjusting time
  console.log(JSON.stringify(callback));
};
JST.request(callback);
```

## Reference / 仕様

### Object `JST`

* This is just a namespace.

### Function `jsont`

* This is the callback function that JSONP API calls.

### result of callback function

* property `status` … The result string, that is 'success' or 'error'.
* property `msg` … The error message.
* object `delaySec`
  * average … The average of multiple requests.
  * min … The minimum of multiple requests.
  * max … The maximum of multiple requests.