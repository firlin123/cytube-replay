let replaySocketMock = null;
let hashParsed;
let mockEmitCallbacks = {};
let mockEmitCallbacksCount = 0;
let speedX = 1;
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
let fakeConsoleLog = hashParsed[2] == 1;
let parentOrigin = hashParsed[3];
let parent = window.parent;

window.addEventListener('message', onMessage);
window.addEventListener('load', function (event) {
    sendMessage('replayWindowLoaded', { origin: this.location.origin });
});

let lastchatTime = 0;
let lastchat = {
    name: '',
    get time() {
        return lastchatTime;
    },
    set time(time) {
        let deltaT = Math.abs(Date.now() - time);
        if(deltaT > 10) {
            lastchatTime = time;
        }
    }
};

Object.defineProperty(window, 'LASTCHAT', {
    set: () => { },
    get: () => {
        return lastchat;
    }
});

function onMessage(msg) {
    if (typeof msg?.data?.replayPostMessage === 'object') {
        let data = msg.data.replayPostMessage;
        let type = data.type;
        delete data.type;
        receiveMessage(type, data);
    }
}

function receiveMessage(type, data) {
    switch (type) {
        case 'replayEventPack':
            // data.events = [
            //     {time: 0, type: "connect", data: []},
            //     ...
            // ]
            let events = ((data == null) ? {} : data).events;
            if (events == null) events = [];
            if (!(Array.isArray(events))) events = [];
            for (const event of events) {
                try {
                    receiveMessage('replayEvent', {
                        key: event.type,
                        data: event.data
                    });
                }
                catch (e) {
                    console.error(e);
                }
            }
            break;
        case 'replayEvent':
            if (data.key.startsWith('firlin123Debug')) {
                data.key = data.key.substr('firlin123Debug'.length);
                debugger;
            }
            replaySocketMock.socketClient.emit(data.key, ...data.data);
            if (data.key === 'mediaUpdate') updateSpeedX();
            break;
        case 'replaySpeedXChange':
            speedX = typeof data.speedX === 'number' ? data.speedX : 1;
            updateSpeedX();
            break;
        case 'replayPausedChange':
            if (data.paused && typeof PLAYER?.pause === 'function') {
                PLAYER.pause();
            }
            else if (!(data.paused) && typeof PLAYER?.play === 'function') {
                PLAYER.play();
            }
            break;
        default:
            console.log("type:", type, "data:", data);
            break;
    }
}

function sendMessage(type, data = null) {
    data.type = type
    parent.postMessage({ replayPostMessage: data }, parentOrigin);
}

function onMockEmit(key, payload, callback) {
    let message = { key };
    if (payload != null) {
        message.payload = payload;
    }
    if (typeof callback === 'function') {
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

function updateSpeedX() {
    if (typeof PLAYER?.yt?.setPlaybackRate === 'function') {
        PLAYER.yt.setPlaybackRate(speedX > 2 ? 2 : speedX);
    }
    else if (typeof PLAYER?.player?.playbackRate === 'function') {
        PLAYER.player.playbackRate(speedX > 10 ? 10 : speedX);
    }
}