window.DomAPI = function() {
	var doc = null, appID = null, parser = null,
	imageProxy = 'http://www.gmodules.com/ig/proxy?url=',
	cssProps = ['background','backgroundAttachment','backgroundColor','backgroundImage','backgroundPosition','backgroundRepeat','border','borderBottom','borderBottomColor','borderBottomStyle','borderBottomWidth','borderColor','borderLeft','borderLeftColor','borderLeftStyle','borderLeftWidth','borderRight','borderRightColor','borderRightStyle','borderRightWidth','borderStyle','borderTop','borderTopColor','borderTopStyle','borderTopWidth','borderWidth','outline','outlineColor','outlineStyle','outlineWidth','height','maxHeight','maxWidth','minHeight','minWidth','width','font','fontFamily','fontSize','fontStyle','fontVariant','fontWeight','listStyle','listStyleImage','listStylePosition','listStyleType','margin','marginBottom','marginLeft','marginRight','marginTop','padding','paddingBottom','paddingLeft','paddingRight','paddingTop','bottom','clear','clip','cursor','display','float','left','overflow','position','right','top','visibility','zIndex','orphans','pageBreakAfter','pageBreakBefore','pageBreakInside','widows','borderCollapse','borderSpacing','captionSide','emptyCells','tableLayout','color','direction','letterSpacing','lineHeight','textAlign','textDecoration','textIndent','textShadow','textTransform','unicodeBidi','verticalAlign','whiteSpace','wordSpacing'],
	allowedTags = /^(?:form|optgroup|button|legend|fieldset|label|option|select|textarea|input|audio|aside|article|a|abbr|acronym|address|area|b|bdo|big|br|canvas|caption|center|cite|code|col|dd|del|dfn|dir|div|dl|dt|em|font|h[1-6]|hr|i|img|ins|kbd|li|map|ol|p|pre|q|s|samp|small|span|strike|strong|sub|sup|table|tbody|td|tfoot|th|thead|tr|tt|u|ul|blockquote|image|video|xmp)$/i,
	allowedAttributes = 'onclick|type|accesskey|align|alink|alt|background|bgcolor|border|cellpadding|cellspacing|class|color|cols|colspan|coords|dir|face|height|href|hspace|id|ismap|innerHTML|innerText|lang|marginheight|marginwidth|multiple|nohref|noresize|noshade|nowrap|ref|rel|rev|rows|rowspan|scrolling|shape|span|src|summary|tabindex|target|title|usemap|valign|value|vlink|vspace|width'.split('|'),
	allowedAttributesRegEx = /^(?:type|accesskey|align|alink|alt|background|bgcolor|border|cellpadding|cellspacing|class|color|cols|colspan|coords|dir|face|height|href|hspace|id|ismap|innerHTML|innerText|lang|marginheight|marginwidth|multiple|nohref|noresize|noshade|nowrap|ref|rel|rev|rows|rowspan|scrolling|shape|span|src|summary|tabindex|target|title|usemap|valign|value|vlink|vspace|width)$/i,	
	allowedEvents = /^[$]on(?:click)[$]$/,
	urls = /^(?:src|background|href|action|background)$/i,
	urlsCheck = /^(?:https?:\/\/.+|\/.+|\w[^:]+|#[\w=?]*)$/,	
	setterFunc = function(obj, propName){ return function(val, x) {		
			if(val) {				
				if(allowedEvents.test('$'+propName+'$')) {						
					if(typeof val == 'function') {						
						obj[propName] = function() {																					
							var parser = DomAPI.createParser();								
							parser.eval('('+(val)+').apply(this,[])',obj,true);							
						}
					}
					return true;
				}
				
				if(urls.test(propName)) {					
					if(urlsCheck.test(val)) {
						if(propName == 'href') {
							val = val;
						} else {
							val = imageProxy + val;
						}
					} else {
						val = '#';
					}
					var html = val;
				} else {					
					var html = HTMLReg.parse(val);
				}
				obj[propName] = html;
			} else {
				if(window.event) {						
					propName = event.propertyName.replace(/^[$]|[$]$/g,'');
					if(allowedEvents.test(event.propertyName)) {
						if(typeof event.srcElement[event.propertyName] == 'function') {
							obj[event.propertyName.replace(/^[$]|[$]$/g,'')] = function() {
								var parser = DomAPI.createParser();										
								parser.eval('('+(event.srcElement['$'+propName+'$']+'')+').apply(this,[])',obj,true);						
							}
						}
						return true;
					}
					
					if(/^[$].+[$]$/.test(event.propertyName) && allowedAttributesRegEx.test(event.propertyName.replace(/^[$]|[$]$/g,''))) {										
						var nodeVal = event.srcElement[event.propertyName]+'';
						if(urls.test(event.propertyName.replace(/^[$]|[$]$/g,''))) {												
							if(urlsCheck.test(nodeVal)) {								
								if(/^href$/i.test(propName)) {
									nodeVal = nodeVal;
								} else {
									nodeVal = imageProxy + nodeVal;
								}
							} else {
								nodeVal = '#';
							}							
							var html = nodeVal;
						} else {
							var html = HTMLReg.parse(nodeVal);
						}
											
						obj[event.propertyName.replace(/^[$]|[$]$/g,'')] = html;
					}
				}
			}
		}
	},
	createParser = function(){
			var parser = JSReg.create();
			parser.init();
			parser.setDebugObjects({
				errorLog: function(code) {
					document.getElementById('errorLog').value += code + '\n';
				},					
				errorHandler: function(e) {
					errorHandler(e, parser);
				}								
			   });
			parser.setDocument({
									$getElementById$:DomAPI.getElementById,
									$createElement$:DomAPI.createElement,
									$createTextNode$:DomAPI.createTextNode,
									$getElementsByTagName$:DomAPI.getElementsByTagName,
									$parentNode$: null,
									$nextSibling$: null,
									$previousSibling$: null,										
									toString: function() {
										return '[Object Document]';
									},
										valueOf: function() {
										return document.getElementById('htmlOutput');
									}
							   });
			return parser;
	},	
	getElementById = function(id) {		
		id = id + '';				
		var obj = document.getElementById(appID+'_'+id+'_');		
		return obj;
	},
	getElementsByTagName = function(tag) {
		if(allowedTags.test(nodeName)) {
			return document.getElementsByTagName(tag);
		} else {
			return null;
		}
	},
	createElement = function(nodeName) {
		if(allowedTags.test(nodeName)) {
			return document.createElement(nodeName);
		} else {
			return null;
		}
	},
	createTextNode = function(text) {
		return document.createTextNode(text);
	},
	setAppID = function(id) {
		appID = id;
	},
	walkTheDOM = function walk(node, func) {
		func(node);
		node = node.firstChild;
		while(node) {
			walk(node, func);
			node = node.nextSibling;
		}
	},	
	setDocument = function(d) {
		doc = d;		
		if(!d.firstChild) {
			return false;
		}		
		walkTheDOM(d.firstChild, function(node) {									
			if(node.nodeType === 1) {
				var styles = document.createElement('span');
				node['$'+'hasChildNodes'+'$'] = node['hasChildNodes'];
				node['$'+'nodeName'+'$'] = node['nodeName'];
				node['$'+'nodeType'+'$'] = node['nodeType'];
				node['$'+'nodeValue'+'$'] = node['nodeValue'];
				node['$'+'childNodes'+'$'] = node['childNodes'];
				node['$'+'firstChild'+'$'] = node['firstChild'];
				node['$'+'lastChild'+'$'] = node['lastChild'];
				node['$'+'nextSibling'+'$'] = node['nextSibling'];
				node['$'+'previousSibling'+'$'] = node['previousSibling'];
				node['$'+'parentNode'+'$'] = node['parentNode'];								
				for(var i=0;i<cssProps.length;i++) {
					var cssProp = cssProps[i];
					if(Object.defineProperty) {						
							node.$style$ = styles; 							
							Object.defineProperty(node.$style$, '$'+cssProp+'$', {
								set: (function(node, cssProp) { 
									return function(val) {	
										var hyphenProp = cssProp.replace(/([A-Z])/g,function($0,$1) {
											  return '-' + $1.toLowerCase();
										});
										var safeCSS = CSSReg.parse(hyphenProp+':'+val).replace(new RegExp('^'+hyphenProp+'[:]'),'').replace(/;$/,'');																	
										node.style[cssProp] = safeCSS; 
									}
							})(node, cssProp)
							});						
					} else if(Object.__defineSetter__) {
						styles.__defineSetter__('$'+cssProp+'$', (function(node, cssProp) { 
								return function(val) {	
									
									var hyphenProp = cssProp.replace(/([A-Z])/g,function($0,$1) {
										  return '-' + $1.toLowerCase();
									});
									
									var safeCSS = CSSReg.parse(hyphenProp+':'+val).replace(new RegExp('^'+hyphenProp+'[:]'),'').replace(/;$/,'');								
									node.style[cssProp] = safeCSS; 
								}
						})(node, cssProp));
					} else {
						document.getElementById('styleObjs').appendChild(styles);
						node.$style$ = styles; 
						node.$style$.onpropertychange = (function(node) {
							return function() {																
								if(/^[$].+[$]$/.test(event.propertyName)) {										
									var cssProp = (event.propertyName+'').replace(/^[$]|[$]$/g,'');									
									var hyphenProp = cssProp.replace(/([A-Z])/g,function($0,$1) {
										  return '-' + $1.toLowerCase();
									});
									var safeCSS = CSSReg.parse(hyphenProp+':'+event.srcElement[event.propertyName]+'').replace(new RegExp('^'+hyphenProp+'[:]'),'').replace(/;$/,'');																																
									node.style[cssProp] = safeCSS; 									
								}
							}
						})(node);
					}
				}
				node['$'+'style'+'$'] = styles; 				
				
				if(!Object.defineProperty && !Object.__defineSetter__) {					
					node.onpropertychange = setterFunc(node, attr);
				}
				
				for(var i=0;i<allowedAttributes.length;i++) {
					var attr = allowedAttributes[i];					
					if(node[attr]) {						
						node['$'+attr+'$'] = node[attr];		
					}
					if(Object.defineProperty) {							
						Object.defineProperty(node, '$'+attr+'$', {set: setterFunc(node,attr), get: (function(node, attr) {
							return function() {								
								if(/^id$/i.test(attr)) {									
									return node[attr].toString().replace(new RegExp('^'+appID+'_'),'').replace(new RegExp('_$'),''); 
								}
								return node[attr];
							}
						})(node,attr)});					
					} else if(node.__defineSetter__) {						
						node.__defineSetter__("$"+attr+"$", setterFunc(node, attr));						
						node.__defineGetter__("$"+attr+"$", (function(attr) { return function() {
								if(/^id$/i.test(attr)) {
									return this[attr].toString().replace(new RegExp('^'+appID+'_'),'').replace(new RegExp('_$'),''); 
								}
								return this[attr];
							}
						})(attr));
					} 
				}
				node.$appendChild$ = (function(obj) {
					return function(n) {
						var result = obj.appendChild(n);
						setDocument(doc);
						return result;
					}
				})(node);
				node.$cloneNode$ = (function(obj) {
					return function(deep) {
						deep = !!deep;
						var result = obj.cloneNode(deep);
						setDocument(doc);						
						return result;
					}
				})(node);
				node.$insertBefore$ = (function(obj) {
					return function(newNode, targetNode) {
						var result = obj.insertBefore(newNode, targetNode);
						setDocument(doc);
						return result;
					}
				})(node);
				node.$removeChild$ = (function(obj) {
					return function(node) {
						return obj.removeChild(node);
					}
				})(node);
				node.$setAttribute$ = (function(obj) {
					return function(attrName, value) {						
						if(attrName == 'class') {
							var classList = value;
							classList = classList.replace(/[^ \w]/g,'');
							if(classList === '') {
								classList = 'invalid'
							}
							classList = classList.split(" ");				
							var HTMLClass = '';
							var len = classList.length;
							if(len > 10) {
								len = 10;
							}
							for(var i=0;i<len;i++) {
								if(/^[\w]+$/.test(classList[i])) {
									HTMLClass += appID+'_'+classList[i]+'_ ';
								}
							}
							HTMLClass = HTMLClass.replace(/\s$/,'');
							return obj.setAttribute(attrName, HTMLClass);
						} else if(attrName == 'id') {							
							var id = value+'';
							id = id.replace(/[^\w]/g,'');				
							var HTMLID = appID+'_'+id+'_';							
							return obj.setAttribute(attrName, HTMLID);
						} else {						
							if(allowedAttributesRegEx.test(attrName)) {																	
								if(urls.test(attrName)) {					
									if(urlsCheck.test(value)) {
										if(attrName == 'href') {
											value = value;
										} else {
											value = imageProxy + value;
										}
									} else {
										value = '#';
									}
								}								
								return obj.setAttribute(attrName, value);
							} else {
								return false;
							}
						}
					}
				})(node);
				node.$getAttribute$ = (function(obj) {
					return function(attrName) {
						return obj.getAttribute(attrName);
					}
				})(node);	
												
			}
		});		
	}
	return { createParser:createParser,setDocument:setDocument,setAppID:setAppID,getElementById:getElementById,
			getElementsByTagName:getElementsByTagName,
			createElement:createElement,createTextNode:createTextNode
	};
}();