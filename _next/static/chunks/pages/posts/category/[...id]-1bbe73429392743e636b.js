_N_E=(window.webpackJsonp_N_E=window.webpackJsonp_N_E||[]).push([[12],{"/a9y":function(t,e,n){"use strict";var r=n("lwsE"),a=n("W8MJ"),o=n("7W2i"),i=n("a1gu"),c=n("Nsbk");function s(t){var e=function(){if("undefined"===typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"===typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(t){return!1}}();return function(){var n,r=c(t);if(e){var a=c(this).constructor;n=Reflect.construct(r,arguments,a)}else n=r.apply(this,arguments);return i(this,n)}}var l=n("TqRt");e.__esModule=!0,e.default=void 0;var u=l(n("q1tI")),f=l(n("8Kt/")),p={400:"Bad Request",404:"This page could not be found",405:"Method Not Allowed",500:"Internal Server Error"};function d(t){var e=t.res,n=t.err;return{statusCode:e&&e.statusCode?e.statusCode:n?n.statusCode:404}}var g=function(t){o(n,t);var e=s(n);function n(){return r(this,n),e.apply(this,arguments)}return a(n,[{key:"render",value:function(){var t=this.props.statusCode,e=this.props.title||p[t]||"An unexpected error has occurred";return u.default.createElement("div",{style:h.error},u.default.createElement(f.default,null,u.default.createElement("title",null,t,": ",e)),u.default.createElement("div",null,u.default.createElement("style",{dangerouslySetInnerHTML:{__html:"body { margin: 0 }"}}),t?u.default.createElement("h1",{style:h.h1},t):null,u.default.createElement("div",{style:h.desc},u.default.createElement("h2",{style:h.h2},e,"."))))}}]),n}(u.default.Component);e.default=g,g.displayName="ErrorPage",g.getInitialProps=d,g.origGetInitialProps=d;var h={error:{color:"#000",background:"#fff",fontFamily:'-apple-system, BlinkMacSystemFont, Roboto, "Segoe UI", "Fira Sans", Avenir, "Helvetica Neue", "Lucida Grande", sans-serif',height:"100vh",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"},desc:{display:"inline-block",textAlign:"left",lineHeight:"49px",height:"49px",verticalAlign:"middle"},h1:{display:"inline-block",borderRight:"1px solid rgba(0, 0, 0,.3)",margin:0,marginRight:"20px",padding:"10px 23px 10px 0",fontSize:"24px",fontWeight:500,verticalAlign:"top"},h2:{fontSize:"14px",fontWeight:"normal",lineHeight:"inherit",margin:0,padding:0}}},"8YJa":function(t,e,n){"use strict";n.r(e),n.d(e,"__N_SSG",(function(){return O})),n.d(e,"default",(function(){return E}));var r=n("rePB"),a=n("q1tI"),o=n.n(a),i=n("eomm"),c=n.n(i),s=n("R/WZ"),l=n("apO0"),u=n("f4ym"),f=n("iq4c"),p=n("3LdE"),d=n("sx9v"),g=n("ZQAi"),h=o.a.createElement;function y(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,r)}return n}function m(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?y(Object(n),!0).forEach((function(e){Object(r.a)(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):y(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}var v=Object(s.a)((function(){return{pageMain:m({},Object(d.b)("& .".concat(p.a.iamgeConfig.contentImageClassName),{maxWidth:"100%",objectFit:"contain"})),"SectionItem-root":{},"SectionItem-title":{width:"100%",display:"flex",justifyContent:"center"}}})),b=["page"],O=!0;function E(t){var e=t.pageData,n=v();return e?h(g.a.Provider,{value:e},h(l.a,{title:e.title,pageData:e},h(f.a,{sections:[{title:"",content:[{kind:"partsNavCategory",all:!0,categoryPath:"/posts/category"}]},{title:"",content:[{kind:"partsNavPagination",href:"/posts/page/[..id]",baseAs:"/posts/page",pagePath:b,firstPageHref:"/posts"}]}],classes:m({},n)}),h(u.a,{href:"/posts"},"Back to posts"))):h(c.a,{statusCode:404})}},ANMQ:function(t,e,n){(window.__NEXT_P=window.__NEXT_P||[]).push(["/posts/category/[...id]",function(){return n("8YJa")}])},eomm:function(t,e,n){t.exports=n("/a9y")}},[["ANMQ",0,2,1,3,4]]]);