"use strict";(self.webpackChunkcytube_replay=self.webpackChunkcytube_replay||[]).push([[473],{473:(N,g,l)=>{l.r(g),l.d(g,{LoadModule:()=>M});var C=l(9808),j=l(5861),e=l(5e3),f=l(5834),z=l(9757);const F=[{path:"",component:(()=>{class t{constructor(n,s,a){var o=this;this.router=n,this.route=s,this.navbar=a,this.url="",this.unloaded=!1,this.subscription=this.route.queryParams.subscribe(function(){var c=(0,j.Z)(function*(i){let h=i.json,d=i.zip,u="",m=!1,r="";if("string"==typeof h&&(r=o.urlGetFileName(h,".json"),""!==r&&(u=h)),"string"==typeof d&&""===r&&(r=o.urlGetFileName(d,".zip"),""!==r&&(u=d,m=!0)),""!==u&&""!==r){o.url=u,o.navbar.loadingConfig(r);try{let y=new URL("https://cors-bypass.firlin123.workers.dev/");y.searchParams.append("url",u);let b=yield fetch(y.toString());if(b.ok){let v=b.headers.get("content-type");if("application/json"===v&&!m||"application/zip"===v&&m){let L=yield b.blob();L.name=r,a.fileSelect.filesChange([L])}}}catch(y){}}null!=o.subscription&&(o.subscription.unsubscribe(),o.subscription=null),o.unloaded||o.router.navigate(["/"])});return function(i){return c.apply(this,arguments)}}())}urlGetFileName(n,s){try{let a=new URL(n);if("http:"===a.protocol||"https:"===a.protocol){let c=a.pathname.split("/"),i=c[c.length-1];return""===i&&(i="file-from-url"+s),i.endsWith(s)||(i+=s),i}}catch(a){}return""}ngOnDestroy(){this.unloaded=!0,null!=this.subscription&&(this.subscription.unsubscribe(),this.subscription=null)}ngOnInit(){}}return t.\u0275fac=function(n){return new(n||t)(e.Y36(f.F0),e.Y36(f.gz),e.Y36(z.Y))},t.\u0275cmp=e.Xpm({type:t,selectors:[["app-load"]],decls:2,vars:1,template:function(n,s){1&n&&(e.TgZ(0,"p"),e._uU(1),e.qZA()),2&n&&(e.xp6(1),e.hij("Loading ",s.url,""))},styles:["p[_ngcontent-%COMP%]{margin:10px;text-align:center}"]}),t})()}];let M=(()=>{class t{}return t.\u0275fac=function(n){return new(n||t)},t.\u0275mod=e.oAB({type:t}),t.\u0275inj=e.cJS({imports:[[C.ez,f.Bz.forChild(F)]]}),t})()}}]);