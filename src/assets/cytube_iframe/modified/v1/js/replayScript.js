let replaySocketMock = null;
let hashParsed;
let mockEmitCallbacks = {};
let mockEmitCallbacksCount = 0;
try {
    hashParsed = JSON.parse('[' + decodeURIComponent(location.hash.substr(1)) + ']');
    if (hashParsed.length < 4) throw "hash decode failed";
}
catch (e) {
    hashParsed = ['r', 'replay', 0];
    window.addEventListener('load', function () {
        replaySocketMock.socketClient.emit('connect');
        replaySocketMock.socketClient.emit('emoteList', []);
        replaySocketMock.socketClient.emit('chatMsg', { username: "CyTube Replay Error", msg: e, meta: {}, time: Date.now() });
        replaySocketMock.socketClient.emit('disconnect');
    });
}
var CHANNELPATH = hashParsed[0];
var CHANNELNAME = hashParsed[1];
var fakeConsoleLog = hashParsed[2] == 1;
var parentOrigin = hashParsed[3];
var parent = window.parent;

window.addEventListener('message', onMessage);
window.addEventListener('load', function (event) {
    sendMessage('replayWindowLoaded', { origin: this.location.origin });
});

function onMessage(msg) {
    //TODO: receive and parse messages
    console.log('ReplayW: onmsg', msg);
}

function sendMessage(type, data = null) {
    data.type = type
    parent.postMessage({ replayPostMessage: data }, parentOrigin);
}

function onMockEmit(key, payload, callback) {
    let message = { key };
    if(payload != null) {
        message.payload = payload;
    }
    if(typeof callback === 'function') {
        message.callbackId = mockEmitCallbacksCount++;
        mockEmitCallbacks[message.callbackId] = callback;
    }
    sendMessage('replayEmit', message);
}

function replayIO() {
    replaySocketMock = new SocketMock();
    replaySocketMock.socketClient.realFireEvent = replaySocketMock.socketClient.fireEvent;
    replaySocketMock.socketClient.fireEvent = function (key, payload, callback) {
        globalThis.onMockEmit(key, payload, callback);
        return this.realFireEvent.apply(this, arguments);
    }
    return replaySocketMock;
}