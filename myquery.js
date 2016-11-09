//     name:myquery.js
//     author:翟旭光
//     description:模仿jquery实现的简单版本
(function(global,factory,undefined){
	if(typeof module != 'undefined' && typeof module.exports == 'object'){
		module.exports=factory(global);
	}else if(typeof define == 'function' && define.amd){
		define([],function(){
			return factory(global);
		});
	}else{
		global.$=global.myQuery=factory(global);
	}
})(typeof window !== "undefined" ? window : this, function(window) {
	
	var class2type={};
	var toString =class2type.toString;
	var slice=Array.prototype.slice;

	function myQuery(selector,context){
		return new myQuery.prototype.init(selector);
	}
	myQuery.fn=myQuery.prototype={
		constructor:myQuery,
		init:function(selector,context){
			if(typeof selector=='string'){
				var doms=Sizzle(selector);
				for(var i=0;i<doms.length;i++){
					this[i]=doms[i];
				}
				this.length=doms.length;
			}else if(selector.nodeType){
				this[0] = selector;
				this.length = 1;
			}else if(typeof selector=='function'){
				var func=selector;
				if(document.readyState=='complete'){
					func();
				}else{
					myQuery.bindEvent(window,'DOMContentLoaded',func);
				}
			}
		},
		extend:function(obj){
            myQuery.extend(this,obj);
        }
	}
	myQuery.prototype.init.prototype=myQuery.prototype;

	myQuery.extend=function(target,src){
		for(var attr in src){
			target[attr]=src[attr];
		}
	}
	
	myQuery.extend(myQuery,{
	    each:function(arr,func){
	    	if(arr.length != undefined){
	        	for(var i=0;i<arr.length;i++){
	        		func(arr[i],i,arr);
	        	}
        	}
        },
		getChildren:function(ele, nodeType){
            if(!ele || !nodeType){
                console.log("%c参数个数不正确，或顺序错误！","color:red");
                return;
            }
            if(!ele.childNodes) console.log("%c传入的参数非DOM元素或无法获取子节点！","color:red");
            var obj = {
                "element" : 1,
                "text" : 3,
                "attribute" : 2
            }
            if(typeof nodeType === "number"){
                throw new Error("参数类型错误，只能传入string类型，不能传入number类型")
            } else {
                if( !(nodeType in obj)) {
                    console.log("%c文本参数错误!","color:red");
                }
            }
            var list = ele.childNodes;
            var arr = [];
            for(var i=0; i<list.length; i++) {
                if(list[i].nodeType == obj[nodeType]) arr.push(list[i]);
            }
            return arr;
        },
		getStyle:function(obj, attr) {
            if(obj.currentStyle) {
                myQuery.getStyle = function(obj, attr){
                    return Number(parseFloat(obj.currentStyle[attr]).toFixed(5));
                }
                return Number(parseFloat(obj.currentStyle[attr]).toFixed(5));
            } else {
                myQuery.getStyle = function(obj, attr){
                    return Number(parseFloat(getComputedStyle(obj,null)[attr]).toFixed(5));
                }
                return Number(parseFloat(getComputedStyle(obj,null)[attr]).toFixed(5));
            }
        },
		offset:function(obj) {
            var _left = 0, _top = 0;
            while(obj) {
                _left += obj.offsetLeft;
                _top += obj.offsetTop;
                obj = obj.offsetParent;
            }
            return {left:_left, top: _top};
        },
        animate:function (obj, json, cbk){
            if(obj.isMoving) {
                return;
            } else {
                clearInterval(obj.timer);
                obj.isMoving = true;
            }
            var deg = 0;
            obj.callback = cbk;
            obj.timer = setInterval(function(){
                deg += 2;
                if(deg>90){
                    typeof obj.callback =='function'? obj.callback() : "";
                    clearInterval(obj.timer);
                    obj.isMoving = false;
                    return;
                }
                for(var attr in json){
                    var now = myQuery.getStyle(obj,attr);
                    var end = parseFloat(json[attr]);
                    var speed = Math.sin(Math.PI/180*deg)*(end-now);
                    if(attr == "opacity"){
                        obj.style[attr] = (now + speed)/100;
                        obj.style[attr] = "filter(alpha="+(now+speed)+")";
                    } else {
                        obj.style[attr] = now + speed + "px";
                    }
                }

            },30);
        },
        randomInt:function(min, max) {
         return Math.round(Math.random()*(max-min)) + min;
        },
        randomColor:function (){
            var R = Math.round( Math.random()*255 ).toString(16);
            var G = Math.round( Math.random()*255 ).toString(16);
            var B = Math.round( Math.random()*255 ).toString(16);
            return (R.length<2?"0"+R:R) + (G.length<2?"0"+G:G)+ (B.length<2?"0"+B:B);
        },
        bindEvent:(function(){
            if(window.attachEvent) {
                return function(obj, eventType, func){
                    obj.attachEvent("on"+eventType, func);
                }
            } else {
                return function(obj, eventType, func,  isCapture) {
                    obj.addEventListener(eventType, func, isCapture||false);
                }
            }
        })(),
        ajax:function (param){
            if(param.data && !/^(\w+=\w+)?(&\w+=\w+)*$/.test(param.data)) {
                throw new Error("参数格式错误");
            }

            if(param.type == "jsonp") {
                var cbkname = "callback"+new Date().getTime() + 					Math.floor(Math.random()*1000000);
                window[cbkname] = function(data){
                    param.success(data);
                    document.body.removeChild(_script);
                    delete window[cbkname];
                }
                var _script = document.createElement("script");
                _script.src = param.url+"?"+param.data+"&callback="+cbkname;
                _script.onerror = function(){
                    console.log("请求失败，请检查地址或参数");
                }
                document.body.appendChild(_script);

            } else if(/^post|get$/.test(param.type) ) {
                if(window.ActiveXObject) {
                    var req = new ActiveXObject("Msxml2.XMLHTTP");
                } else {
                    var req = new XMLHttpRequest();
                }
                if(param.type == "get") {
                    req.open(param.type, param.url+"?"+param.data,true);
                } else {
                    req.open(param.type, param.url, true);
                    req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
                }

                if(param.success) {
                    req.onreadystatechange = function(){
                        if(req.readyState == 4) {
                            if(req.status == 200) {
                                param.success(req.responseText);
                            } else {
                                param.error();
                            }
                        }
                    }
                }
                if(param.type == "get"){
                    req.send();
                } else {
                    req.send(param.data);
                }
            } else {
                console.log("参数错误，请输入正确的请求类型")
            }

        },
		trim:function(str){
			return str.replace(/^\s*/,'').replace(/\s*$/,'');
		},
		globalEval: function( data ) {
			if ( data && myQuery.trim( data ) ) {
				( window.execScript || function( data ) {
					window[ "eval" ].call( window, data );
				} )( data );
			}
		}
	});
	myQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), 		function(name, i) {
		class2type[ "[object " + name + "]" ] = name.toLowerCase();
	});
	myQuery.extend({
		type: function( obj ) {
			return (typeof obj === "object" || typeof obj === "function") ?
				(class2type[ toString.call(obj) ] || "object") :
				typeof obj;
		},
		isArray:function(obj){
			return myQuery.type(obj)=='array';
		}
	});
	myQuery.fn.extend({
		html:function(val){
            if(val){
                this[0].innerHTML=val;
                return this;
            }else{
                 return this[0].innerHTML;
            }
        },
        text:function(val){
            if(val){
                this[0].innerText=val;
                return this;
            }else{
                return this[0].innerText;
            }
        },
         get:function(index){
            return this[i];
        },
        css:function(){
            if(arguments.length==2){
                var name=arguments[0],value=arguments[1];
                for(var i=0;i<this.length;i++){
                    this[i].style[name]=value;
                }
            }else if(arguments.length==1){
                var attrObj=arguments[0];
                for(var i=0;i<this.length;i++){
                    for(var attr in attrObj){
                        this[i].style[attr]=attrObj[attr];
                    }
                }
            }
            return this;
        },
        animate:function(attrObj,callback){
            var self=this;
            this.each(function(item,index){
                myQuery.animate(self[index],attrObj,callback);
            });
            return this;
        },
        offset:function(){
            return myQuery.offset(this[0]);
        },
        on:function(eventType,func){
            var self=this;
            this.each(function(item,index) {
                myQuery.bindEvent(self[index], eventType, func)
            });
            return this;
        },
        each:function(func){
        	myQuery.each(this,func);
        }
	});

	myQuery.each(("blur focus focusin focusout load resize scroll unload click dblclick " 	
	+"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave "
    +"change select submit keydown keypress keyup error contextmenu").split(" "), 	function(name,i) {
        myQuery.fn[ name ] = function(fn ) {
           for(var i=0;i<this.length;i++){
               myQuery.bindEvent(this[i],name,fn);
           }
           return this;
        };
    });
	/**
	 * 选择器
	 * @param {Object} selector 选择器表达式
	 * @param {Object} context  上下文
	 */
	var Sizzle=(function(){
		function Sizzle(selector,context){
			if(!selector){
				return [];
			}
			context=context||document;
			
			var type=selector.charAt(0);
			var sel=selector.slice(1);
			if(type=='#'){
				return [context.getElementById(sel)];
			}else if(type=='.'){
				return slice.call(context.getElementsByClassName(sel));
			}else{
				return slice.call(context.getElementsByTagName(selector));
			}
		}
		return Sizzle;
	})();
	
	return myQuery;
});
