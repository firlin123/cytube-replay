(()=>{var e={991:function(e){e.exports=function(){"use strict";return function(){var e=Math.floor(1000001*Math.random()),t={};function n(e){return Array.isArray?Array.isArray(e):-1!=e.constructor.toString().indexOf("Array")}var r={},i=function(e){try{var n=JSON.parse(e.data);if("object"!=typeof n||null===n)throw"malformed"}catch(e){return}var i,o,s,a=e.source,u=e.origin;if("string"==typeof n.method){var c=n.method.split("::");2==c.length?(i=c[0],s=c[1]):s=n.method}if(void 0!==n.id&&(o=n.id),"string"==typeof s){var l=!1;if(t[u]&&t[u][i])for(var d=0;d<t[u][i].length;d++)if(t[u][i][d].win===a){t[u][i][d].handler(u,s,n),l=!0;break}if(!l&&t["*"]&&t["*"][i])for(d=0;d<t["*"][i].length;d++)if(t["*"][i][d].win===a){t["*"][i][d].handler(u,s,n);break}}else void 0!==o&&r[o]&&r[o](u,s,n)};return window.addEventListener?window.addEventListener("message",i,!1):window.attachEvent&&window.attachEvent("onmessage",i),{build:function(i){var o=function(e){if(i.debugOutput&&window.console&&window.console.log){try{"string"!=typeof e&&(e=JSON.stringify(e))}catch(e){}window.console.log("["+u+"] "+e)}};if(!window.postMessage)throw"jschannel cannot run this browser, no postMessage";if(!window.JSON||!window.JSON.stringify||!window.JSON.parse)throw"jschannel cannot run this browser, no JSON parsing/serialization";if("object"!=typeof i)throw"Channel build invoked without a proper object argument";if(!i.window||!i.window.postMessage)throw"Channel.build() called without a valid window argument";window===i.window&&o("target window is same as present window -- use at your own risk");var s,a=!1;if("string"==typeof i.origin&&("*"===i.origin?a=!0:null!==(s=i.origin.match(/^https?:\/\/(?:[-a-zA-Z0-9_\.])+(?::\d+)?/))&&(i.origin=s[0].toLowerCase(),a=!0)),!a)throw"Channel.build() called with an invalid origin";if(void 0!==i.scope){if("string"!=typeof i.scope)throw"scope, when specified, must be a string";if(i.scope.split("::").length>1)throw"scope may not contain double colons: '::'"}else i.scope="__default";var u=function(){for(var e="",t="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",n=0;n<5;n++)e+=t.charAt(Math.floor(Math.random()*t.length));return e}(),c={},l={},d={},f=!1,h=[],p=[],g=function(e,t,s){if("function"==typeof i.gotMessageObserver)try{i.gotMessageObserver(e,s)}catch(e){o("gotMessageObserver() raised an exception: "+e.toString())}if(s.id&&t){d[s.id]={};var a=function(e,t,n){var r=!1,i=!1;return{origin:t,invoke:function(t,r){if(!d[e])throw"attempting to invoke a callback of a nonexistent transaction: "+e;for(var i=!1,o=0;o<n.length;o++)if(t===n[o]){i=!0;break}if(!i)throw"request supports no such callback '"+t+"'";v({id:e,callback:t,params:r})},error:function(t,n){if(i=!0,!d[e])throw"error called for nonexistent message: "+e;delete d[e],v({id:e,error:t,message:n})},complete:function(t){if(i=!0,!d[e])throw"complete called for nonexistent message: "+e;delete d[e],v({id:e,result:t})},delayReturn:function(e){return"boolean"==typeof e&&(r=!0===e),r},completed:function(){return i}}}(s.id,e,s.callbacks?s.callbacks:[]);if(c[t])try{if(s.callbacks&&n(s.callbacks)&&s.callbacks.length>0)for(var u=0;u<s.callbacks.length;u++){for(var f=s.callbacks[u],h=s.params,p=f.split("/"),g=0;g<p.length-1;g++){var y=p[g];"object"!=typeof h[y]&&(h[y]={}),h=h[y]}h[p[p.length-1]]=function(){var e=f;return function(t){return a.invoke(e,t)}}()}var m=c[t](a,s.params);a.delayReturn()||a.completed()||a.complete(m)}catch(e){var b="runtime_error",w=null;if("string"==typeof e?w=e:"object"==typeof e&&(e instanceof Error?(b=e.constructor.name,w=e.message):e&&n(e)&&2==e.length?(b=e[0],w=e[1]):"string"==typeof e.error&&(b=e.error,e.message?"string"==typeof e.message?w=e.message:e=e.message:w="")),null===w)try{void 0===(w=JSON.stringify(e))&&(w=e.toString())}catch(t){w=e.toString()}a.error(b,w)}else a.error("method_not_found","No method '"+t+"' was (yet) bound by the provider")}else s.id&&s.callback?l[s.id]&&l[s.id].callbacks&&l[s.id].callbacks[s.callback]?l[s.id].callbacks[s.callback](s.params):o("ignoring invalid callback, id:"+s.id+" ("+s.callback+")"):s.id?l[s.id]?(s.error?l[s.id].error&&l[s.id].error(s.error,s.message):void 0!==s.result?l[s.id].success(s.result):l[s.id].success(),delete l[s.id],delete r[s.id]):o("ignoring invalid response: "+s.id):t&&c[t]&&c[t]({origin:e},s.params)};!function(e,n,r,i){function o(t){for(var n=0;n<t.length;n++)if(t[n].win===e)return!0;return!1}var s=!1;if("*"===n){for(var a in t)if(t.hasOwnProperty(a)&&"*"!==a&&"object"==typeof t[a][r]&&(s=o(t[a][r])))break}else t["*"]&&t["*"][r]&&(s=o(t["*"][r])),!s&&t[n]&&t[n][r]&&(s=o(t[n][r]));if(s)throw"A channel is already bound to the same window which overlaps with origin '"+n+"' and has scope '"+r+"'";"object"!=typeof t[n]&&(t[n]={}),"object"!=typeof t[n][r]&&(t[n][r]=[]),t[n][r].push({win:e,handler:i})}(i.window,i.origin,i.scope,g);var y=function(e){return[i.scope,e].join("::")},v=function(e,t){if(!e)throw"postMessage called with null message";if(t||f){if("function"==typeof i.postMessageObserver)try{i.postMessageObserver(i.origin,e)}catch(e){o("postMessageObserver() raised an exception: "+e.toString())}o("post message: "+JSON.stringify(e)+" with origin "+i.origin),i.window.postMessage(JSON.stringify(e),i.origin)}else o("queue message: "+JSON.stringify(e)),h.push(e)},m=function(e,t){var n;e=[].concat(e);for(var r=0;r<e.length;r++)t[n=e[r].toString()]=function(e){return function(t,n,r){n?b.call({method:e,params:t,success:n,error:r}):b.notify({method:e,params:t})}}(n)},b={remote:{},unbind:function(e,t){if(c[e]){if(!delete c[e])throw"can't delete method: "+e;return i.publish&&!t&&(f?b.notify({method:"__unbind",params:e}):p.push({action:"unbind",method:e})),!0}return!1},bind:function(e,t,n){if(!e||"string"!=typeof e)throw"'method' argument to bind must be string";if(!t||"function"!=typeof t)throw"callback missing from bind params";if(c[e])throw"method '"+e+"' is already bound!";return c[e]=t,i.publish&&!n&&(f?b.notify({method:"__bind",params:e}):p.push({action:"bind",method:e})),this},call:function(t){if(!t)throw"missing arguments to call function";if(!t.method||"string"!=typeof t.method)throw"'method' argument to call must be string";if(!t.success||"function"!=typeof t.success)throw"'success' callback missing from call";var n={},i=[],o=[],s=function(e,t){if(o.indexOf(t)>=0)throw"params cannot be a recursive data structure";if(t&&o.push(t),"object"==typeof t)for(var r in t)if(t.hasOwnProperty(r)){var a=e+(e.length?"/":"")+r;"function"==typeof t[r]?(n[a]=t[r],i.push(a),delete t[r]):"object"==typeof t[r]&&s(a,t[r])}};s("",t.params);var a,u,c,d={id:e,method:y(t.method),params:t.params};i.length&&(d.callbacks=i),t.timeout&&(a=e,u=t.timeout,c=y(t.method),window.setTimeout((function(){if(l[a]){var e="timeout ("+u+"ms) exceeded on method '"+c+"'";l[a].error&&l[a].error("timeout_error",e),delete l[a],delete r[a]}}),u)),l[e]={callbacks:n,error:t.error,success:t.success},r[e]=g,e++,v(d)},notify:function(e){if(!e)throw"missing arguments to notify function";if(!e.method||"string"!=typeof e.method)throw"'method' argument to notify must be string";v({method:y(e.method),params:e.params})},destroy:function(){(function(e,n,r){for(var i=t[n][r],o=0;o<i.length;o++)i[o].win===e&&i.splice(o,1);0===t[n][r].length&&delete t[n][r]})(i.window,i.origin,i.scope),window.removeEventListener?window.removeEventListener("message",g,!1):window.detachEvent&&window.detachEvent("onmessage",g),f=!1,c={},d={},l={},i.origin=null,h=[],o("channel destroyed"),u=""}};return b.bind("__ready",(function(e,t){if(o("ready msg received"),f&&!i.reconnect)throw"received ready message while in ready state.";f=!0,u.length<6&&("publish-request"===t.type?u+="-R":u+="-L"),o("ready msg accepted."),"publish-request"===t.type&&b.notify({method:"__ready",params:{type:"publish-reply",publish:p}});for(var n=0;n<t.publish.length;n++)"bind"===t.publish[n].action?m([t.publish[n].method],b.remote):delete b.remote[t.publish[n].method];for(i.reconnect||b.unbind("__ready",!0);h.length;)v(h.splice(0,1)[0]);p=[],"function"==typeof i.onReady&&i.onReady(b)}),!0),b.bind("__bind",(function(e,t){m([t],b.remote)}),!0),b.bind("__unbind",(function(e,t){b.remote[t]&&delete b.remote[t]}),!0),i.remote&&m(i.remote,b.remote),setTimeout((function(){u.length>0&&v({method:y("__ready"),params:{type:"publish-request",publish:p}},!0)}),0),b}}}()}()},625:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.EventRegistrar=void 0;var n=function(){function e(){this.eventRegistrations={}}return e.prototype.bindToChannel=function(e){for(var t=this,n=function(n){e.bind(n,(function(e,r){return t.fire(n,r)}))},r=0,i=Object.keys(this.eventRegistrations);r<i.length;r++)n(i[r])},e.prototype.registerTypes=function(e){for(var t=0,n=e;t<n.length;t++){var r=n[t];this.eventRegistrations[r]={registrations:[]}}},e.prototype.fire=function(e,t){this.eventRegistrations[e].registrations.forEach((function(e){return e(t)}))},e.prototype.addListener=function(e,t){return this.eventRegistrations[e]?(this.eventRegistrations[e].registrations.push(t),!0):(console.warn("PeerTube: addEventListener(): The event '"+e+"' is not supported"),!1)},e.prototype.removeListener=function(e,t){return!!this.eventRegistrations[e]&&(this.eventRegistrations[e].registrations=this.eventRegistrations[e].registrations.filter((function(e){return e===t})),!0)},e}();t.EventRegistrar=n},179:function(e,t,n){"use strict";var r=this&&this.__awaiter||function(e,t,n,r){return new(n||(n=Promise))((function(i,o){function s(e){try{u(r.next(e))}catch(e){o(e)}}function a(e){try{u(r.throw(e))}catch(e){o(e)}}function u(e){var t;e.done?i(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(s,a)}u((r=r.apply(e,t||[])).next())}))},i=this&&this.__generator||function(e,t){var n,r,i,o,s={label:0,sent:function(){if(1&i[0])throw i[1];return i[1]},trys:[],ops:[]};return o={next:a(0),throw:a(1),return:a(2)},"function"==typeof Symbol&&(o[Symbol.iterator]=function(){return this}),o;function a(o){return function(a){return function(o){if(n)throw new TypeError("Generator is already executing.");for(;s;)try{if(n=1,r&&(i=2&o[0]?r.return:o[0]?r.throw||((i=r.return)&&i.call(r),0):r.next)&&!(i=i.call(r,o[1])).done)return i;switch(r=0,i&&(o=[2&o[0],i.value]),o[0]){case 0:case 1:i=o;break;case 4:return s.label++,{value:o[1],done:!1};case 5:s.label++,r=o[1],o=[0];continue;case 7:o=s.ops.pop(),s.trys.pop();continue;default:if(!((i=(i=s.trys).length>0&&i[i.length-1])||6!==o[0]&&2!==o[0])){s=0;continue}if(3===o[0]&&(!i||o[1]>i[0]&&o[1]<i[3])){s.label=o[1];break}if(6===o[0]&&s.label<i[1]){s.label=i[1],i=o;break}if(i&&s.label<i[2]){s.label=i[2],s.ops.push(o);break}i[2]&&s.ops.pop(),s.trys.pop();continue}o=t.call(e,s)}catch(e){o=[6,e],r=0}finally{n=i=0}if(5&o[0])throw o[1];return{value:o[0]?o[1]:void 0,done:!0}}([o,a])}}};Object.defineProperty(t,"__esModule",{value:!0}),t.PeerTubePlayer=void 0;var o=n(991),s=n(625),a=["pause","play","playbackStatusUpdate","playbackStatusChange","resolutionUpdate","volumeChange"],u=function(){function e(e,t){this.embedElement=e,this.scope=t,this.eventRegistrar=new s.EventRegistrar,this.eventRegistrar.registerTypes(a),this.constructChannel(),this.prepareToBeReady()}return e.prototype.destroy=function(){this.embedElement.remove()},e.prototype.addEventListener=function(e,t){return this.eventRegistrar.addListener(e,t)},e.prototype.removeEventListener=function(e,t){return this.eventRegistrar.removeListener(e,t)},Object.defineProperty(e.prototype,"ready",{get:function(){return this.readyPromise},enumerable:!1,configurable:!0}),e.prototype.play=function(){return r(this,void 0,void 0,(function(){return i(this,(function(e){switch(e.label){case 0:return[4,this.sendMessage("play")];case 1:return e.sent(),[2]}}))}))},e.prototype.pause=function(){return r(this,void 0,void 0,(function(){return i(this,(function(e){switch(e.label){case 0:return[4,this.sendMessage("pause")];case 1:return e.sent(),[2]}}))}))},e.prototype.setVolume=function(e){return r(this,void 0,void 0,(function(){return i(this,(function(t){switch(t.label){case 0:return[4,this.sendMessage("setVolume",e)];case 1:return t.sent(),[2]}}))}))},e.prototype.getVolume=function(){return r(this,void 0,void 0,(function(){return i(this,(function(e){return[2,this.sendMessage("getVolume")]}))}))},e.prototype.setCaption=function(e){return r(this,void 0,void 0,(function(){return i(this,(function(t){switch(t.label){case 0:return[4,this.sendMessage("setCaption",e)];case 1:return t.sent(),[2]}}))}))},e.prototype.getCaptions=function(){return r(this,void 0,void 0,(function(){return i(this,(function(e){return[2,this.sendMessage("getCaptions")]}))}))},e.prototype.seek=function(e){return r(this,void 0,void 0,(function(){return i(this,(function(t){switch(t.label){case 0:return[4,this.sendMessage("seek",e)];case 1:return t.sent(),[2]}}))}))},e.prototype.setResolution=function(e){return r(this,void 0,void 0,(function(){return i(this,(function(t){switch(t.label){case 0:return[4,this.sendMessage("setResolution",e)];case 1:return t.sent(),[2]}}))}))},e.prototype.getResolutions=function(){return r(this,void 0,void 0,(function(){return i(this,(function(e){return[2,this.sendMessage("getResolutions")]}))}))},e.prototype.getPlaybackRates=function(){return r(this,void 0,void 0,(function(){return i(this,(function(e){return[2,this.sendMessage("getPlaybackRates")]}))}))},e.prototype.getPlaybackRate=function(){return r(this,void 0,void 0,(function(){return i(this,(function(e){return[2,this.sendMessage("getPlaybackRate")]}))}))},e.prototype.setPlaybackRate=function(e){return r(this,void 0,void 0,(function(){return i(this,(function(t){switch(t.label){case 0:return[4,this.sendMessage("setPlaybackRate",e)];case 1:return t.sent(),[2]}}))}))},e.prototype.playNextVideo=function(){return r(this,void 0,void 0,(function(){return i(this,(function(e){switch(e.label){case 0:return[4,this.sendMessage("playNextVideo")];case 1:return e.sent(),[2]}}))}))},e.prototype.playPreviousVideo=function(){return r(this,void 0,void 0,(function(){return i(this,(function(e){switch(e.label){case 0:return[4,this.sendMessage("playPreviousVideo")];case 1:return e.sent(),[2]}}))}))},e.prototype.getCurrentPosition=function(){return r(this,void 0,void 0,(function(){return i(this,(function(e){return[2,this.sendMessage("getCurrentPosition")]}))}))},e.prototype.constructChannel=function(){this.channel=o.build({window:this.embedElement.contentWindow,origin:"*",scope:this.scope||"peertube"}),this.eventRegistrar.bindToChannel(this.channel)},e.prototype.prepareToBeReady=function(){var e,t;this.readyPromise=new Promise((function(n,r){e=n,t=r})),this.channel.bind("ready",(function(n){return n?e():t()})),this.channel.call({method:"isReady",success:function(t){return t?e():null}})},e.prototype.sendMessage=function(e,t){var n=this;return new Promise((function(r,i){n.channel.call({method:e,params:t,success:function(e){return r(e)},error:function(e){return i(e)}})}))},e}();t.PeerTubePlayer=u,window.PeerTubePlayer=u}},t={};!function n(r){var i=t[r];if(void 0!==i)return i.exports;var o=t[r]={exports:{}};return e[r].call(o.exports,o,o.exports,n),o.exports}(179)})();