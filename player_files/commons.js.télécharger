/*
 * LICENCE[[ Version: MPL 1.1/GPL 2.0/LGPL 2.1/CeCILL 2.O
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with the
 * License. You may obtain a copy of the License at http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for
 * the specific language governing rights and limitations under the License.
 *
 * The Original Code is kelis.fr code.
 *
 * The Initial Developer of the Original Code is antoine.pourchez@kelis.fr
 *
 * Portions created by the Initial Developer are Copyright (C) 2013 the Initial
 * Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either of the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"), or
 * the CeCILL Licence Version 2.0 (http://www.cecill.info/licences.en.html), in
 * which case the provisions of the GPL, the LGPL or the CeCILL are applicable
 * instead of those above. If you wish to allow use of your version of this file
 * only under the terms of either the GPL or the LGPL, and not to allow others
 * to use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under the
 * terms of any one of the MPL, the GPL, the LGPL or the CeCILL. ]]LICENCE
 */

var page = {

	/**
	 * Ajoute un listener ordonné sur l'event onload de la page.
	 * <pre>
	 * {
	 * onLoad : function(){},
	 * loadSortKey : "a"
	 * }
	 * </pre>
	 */
	addOnLoad: function (pObj) {
		if (!this.fOnLoads) {
			this.fOnLoads = [];
			window.addEventListener("load", function () {
				page.fOnLoads.sort(function (p1, p2) {
					if (!p1.loadSortKey) return p2.loadSortKey ? -1 : 0;
					try {
						return p1.loadSortKey > (p2.loadSortKey || "") ? 1 : p1.loadSortKey == p2.loadSortKey ? 0 : -1;
					} catch (e) {
						return p1.loadSortKey.localeCompare(p2.loadSortKey || "");
					}
				});
				for (var i = 0; i < page.fOnLoads.length; i++) page.fOnLoads[i].onLoad();
				page.fOnLoadDone = true;
			}, false);
		}
		this.fOnLoads.push(pObj);
	},

	/**
	 * Ajoute un listener ordonné sur l'event onunload de la page.
	 * <pre>
	 * {
	 * onUnload : function(){},
	 * unloadSortKey : "a"
	 * }
	 * </pre>
	 */
	addOnUnload: function (pObj) {
		if (!this.fOnUnloads) {
			this.fOnUnloads = [];
			window.addEventListener("unload", function () {
				page.fOnUnloads.sort(function (p1, p2) {
					if (!p1.unloadSortKey) return p2.unloadSortKey ? -1 : 0;
					try {
						return p1.unloadSortKey > (p2.unloadSortKey || "") ? 1 : p1.unloadSortKey == p2.unloadSortKey ? 0 : -1;
					} catch (e) {
						return p1.unloadSortKey.localeCompare(p2.unloadSortKey || "");
					}
				});
				for (var i = 0; i < page.fOnUnloads.length; i++) page.fOnUnloads[i].onUnload();
				page.fOnUnloadDone = true;
			}, false);
		}
		this.fOnUnloads.push(pObj);
	},

	/**
	 * Import asynchrone de ressources (.html).
	 * @param pUrls
	 * @param pCb callback(pErrors) où pErrors est null ou un tableau des urls à télécharger qui ont échouées.
	 */
	loadLibs: function (pUrls, pCb, pCbThis) {
		var vCountRes = 0;
		var vErrors = null;

		function onResLoaded(pEvt) {
			vCountRes--;
			pEvt.target.onload = null;
			pEvt.target.onerror = null;
			if (vCountRes == 0) pCb.call(pCbThis, vErrors); //window.setTimeout(function(){console.log("libLoaded !!!!!"); pCb.call(pCbThis, vErrors);}, 0);
		}

		function onResFailed(pEvt) {
			vCountRes--;
			pEvt.target.onload = null;
			pEvt.target.onerror = null;
			if (vErrors == null) vErrors = [];
			vErrors.push(pEvt.target.href);
			if (vCountRes == 0) pCb.call(pCbThis, vErrors);
		}

		function importLib(pUrl) {
			var vLink = document.createElement('link');
			vLink.rel = 'import';
			vLink.href = pUrl;
			vLink.onload = onResLoaded;
			vLink.onerror = onResFailed;
			vCountRes++;
			document.head.appendChild(vLink);
		}

		if (Array.isArray(pUrls)) {
			for (var i = 0; i < pUrls.length; i++) importLib(pUrls[i]);
		} else {
			importLib(pUrls);
		}
	},

	/** Charge une map de tags
	 * @param pMapTags  : {"tag-1":"http://...tag1.html", "tag-2":"http://...tag2.html"}
	 * @param pCb callback(pErrors) où pErrors est null ou un tableau des urls à télécharger qui ont échouées.
	 */
	loadTags: function (pMapTags, pCb, pCbThis) {
		var vUrls;
		if (pMapTags) for (var vTag in pMapTags) {
			if (!xtag.tags[vTag]) {
				if (!vUrls) vUrls = [];
				vUrls.push(pMapTags[vTag]);
			}
		}
		if (vUrls) this.loadLibs(vUrls, pCb, pCbThis);
		else pCb.call(pCbThis);
	}
}

function sc$(pId) {return document.getElementById(pId);}

var log = {
	/** Retour d'une trace pour debug */
	/* La fonction log doit être bindée à l'objet console sur Chrome */
	info: Function.prototype.bind.call(console.log, console),
	debug: Function.prototype.bind.call(console.error, console),
	getXml: function (pNode) {
		if (!pNode) return "";
		try {
			return new XMLSerializer().serializeToString(pNode);
		} catch (e) {
			return pNode.toString()
		}
		;
	},
	listProps: function (pObject) {
		if (!pObject) return "null";
		var vResult = [];
		for (var vProp in pObject) {
			try {
				var vVal = "" + pObject[vProp];
				vResult.push(vProp);
				vResult.push(" (");
				vResult.push(vVal);
				vResult.push(")\n");
			} catch (e) {
				vResult.push(vProp);
				vResult.push(" -> toString in error\n");
			}
		}
		return vResult.join("");
	}
};

var dom = {
	HTMLNS: "http://www.w3.org/1999/xhtml",
	SALNS: "scenari.eu:areaLayout:1.0",

	/** Clone le contenu d'un noeud (dans le cas d'un template, la propriété content est utilisée) */
	cloneContents: function (pNode) {
		if (pNode.content) return pNode.content.cloneNode(true);
		else {
			var vRange = document.createRange();
			vRange.selectNodeContents(pNode);
			return vRange.cloneContents();
		}
	},

	/** Retourne le premier ancestre correspondant a un sélecteur CSS */
	selectAncestor: function (pNode, pSelector) {
		var vMatches = pNode.webkitMatchesSelector || pNode.mozMatchesSelector || pNode.msMatchesSelector || pNode.oMatchesSelector,
			vParent = pNode.parentNode;
		while (vParent && vParent.nodeType != Node.DOCUMENT_NODE) {
			if (vMatches.call(vParent, pSelector)) return vParent;
			vParent = vParent.parentNode;
		}
		return null;
	},

	createAndDispatchEvent: function (pElement, pType, pDetail) {
		var vEvent = document.createEvent('CustomEvent');
		vEvent.initCustomEvent(pType, true, true, pDetail);
		return pElement.dispatchEvent(vEvent);
	}
};

dom.newBd = function (pNode) {
	return new dom.DomBuilder(pNode);
}

dom.DomBuilder = function (pNode) {
	if (pNode) this.setCurrent(pNode);
}
dom.DomBuilder.prototype = {
	setCurrent: function (pNode) {
		this.fDoc = pNode.nodeType == 9 ? pNode : pNode.ownerDocument;
		this.fNode = pNode;
		return this;
	},
	elt: function (pName, pClass, pExtType) {
		var vNode = pExtType ? this.fDoc.createElement(pName, pExtType) : this.fDoc.createElement(pName);
		if (pClass) vNode.setAttribute("class", pClass);
		if (this.fOutRoot === this.fNode) this.fOut.push(vNode);
		else this.fNode.appendChild(vNode);
		this.fNode = vNode;
		return this;
	},
	/** Si pValue==null l'attribut n'est pas ajouté. */
	att: function (pName, pValue) {
		if (pValue != null) this.fNode.setAttribute(pName, pValue);
		return this;
	},
	prop: function (pProp, pValue) {
		this.fNode[pProp] = pValue;
		return this;
	},
	style: function (pProp, pValue) {
		if (typeof pProp == "string") this.fNode.style[pProp] = pValue;
		else for (var i in pProp) this.fNode.style[i] = pProp[i];
		return this;
	},
	call: function (pMethodName, pArgs) {
		if (Array.isArray(pArgs)) this.fNode[pMethodName].apply(this.fNode, pArgs);
		else this.fNode[pMethodName].call(this.fNode, pArgs);
		return this;
	},
	listen: function (pEventName, pListener, pUseCapture) {
		this.fNode.addEventListener(pEventName, pListener, pUseCapture || false);
		return this;
	},
	text: function (pText) {
		if (pText != null) this.fNode.appendChild(this.fDoc.createTextNode(pText));
		return this;
	},
	up: function () {
		if (this.fNode === this.fOutRoot) this.inTree();
		this.fNode = this.fNode.parentNode;
		if (this.fNode == null) this.fNode = this.fOutRoot;
		return this;
	},
	outTree: function () {
		if (this.fOut) return this;
		this.fOut = [];
		this.fOutRoot = this.fNode;
		return this;
	},
	inTree: function () {
		if (this.fOut) {
			for (var i = 0; i < this.fOut.length; i++) this.fOutRoot.appendChild(this.fOut[i]);
			delete this.fOut;
			delete this.fOutRoot;
		}
		return this;
	},
	clear: function () {
		this.fNode.innerHTML = "";
		return this;
	},
	current: function () {
		return this.fNode;
	},
	currentUp: function () {
		var vCurr = this.fNode;
		this.up();
		return vCurr;
	}
}

var io = {
	/** Retourne un objet xmlHttpRequest */
	createHttpRequest: function () {
		if (window.XMLHttpRequest && ( !window.location.protocol == "file:" || !window.ActiveXObject)) {
			return new XMLHttpRequest();
		} else {
			return new ActiveXObject("Microsoft.XMLHTTP");
		}
	},

	/**
	 * Retourne une XmlHttpRequest asynchrone qui peut être complétée (headers + listeners) avant d'appeler la méthode send().
	 */
	openHttpRequest: function (pUrl, pMethod, pAddHeaderScCsrf) {
		var vReq = io.createHttpRequest();
		vReq.open(pMethod || "GET", pUrl, true);
		if (pAddHeaderScCsrf) vReq.setRequestHeader("ScCsrf", "1");//Utile pour le contrôle csrf sur les services sensibles, en l'absence des headers sec-fetch gérés par le browser
		return vReq;
	},

	/** Retourne un objet contenant les key/value des paramètres d'une QueryString de la forme "?aa=bb&cc=dd"  */
	parseQueryString: function (pQueryString) {
		var vMap = {};
		pQueryString.replace(/[?&]+([^=&]+)=?([^&]*)/gi, function (pMatch, pKey, pValue) {
			var vKey = decodeURIComponent(pKey);
			var vValue = pValue ? decodeURIComponent(pValue) : true;
			vMap[vKey] ? vMap[vKey] instanceof Array ? vMap[vKey].push(vValue) : vMap[vKey] = [vMap[vKey], vValue] : vMap[vKey] = vValue;
		});
		return vMap;
	},

	/** Ajoute des params à une url. Attention, pValue est échappé, mais pas pKey.*/
	appendParamsToUrl: function (pUrl /*[, pKey, pValue]...*/) {
		var vUrl = [pUrl];
		var vSep = pUrl.indexOf('?') >= 0 ? '&' : '?';
		for (var i = 1; i < arguments.length;) {
			vUrl.push(vSep);
			vSep = '&';
			vUrl.push(arguments[i++]);
			var vVal = arguments[i++];
			if (vVal != null) {
				vUrl.push('=');
				vUrl.push(encodeURIComponent(vVal));
			}
		}
		return vUrl.join("");
	},

	/** Retourne un objet contenant les key/value des cookies d'un document. */
	parseCookies: function (pDocument) {
		var vMap = {};
		var vC = pDocument.cookie;
		if (!vC) return vMap;
		var vEntries = vC.split(";");
		for (var i = 0; i < vEntries.length; i++) {
			var vEntry = vEntries[i];
			var vIdx = vEntry.indexOf("=");
			vMap[vEntry.substring(0, vIdx).trim()] = decodeURIComponent(vEntry.substring(vIdx + 1));
		}
		return vMap;
	},

	/**
	 * Retourne une callback pour une requete XHR retournant un json avec un code retour normal 200.
	 * @param pCb function(pJson, pError)
	 */
	jsonXhrCb: function (pCb, pCbThis) {
		return function (pEvt) {
			if (pEvt.target.status == 200) {
				var vVal;
				try {
					vVal = JSON.parse(pEvt.target.responseText);
				} catch (e) {
					pCb.call(pCbThis, null, e);
					return;
				}
				pCb.call(pCbThis, vVal);
			} else {
				pCb.call(pCbThis, null, pEvt.target.status);
			}
		}
	}
}

var i18n = {

	/**
	 * Implémentation partielle de l'API Formatter.
	 *
	 * Usage :
	 *   i18n.formatStr("test %2$s %1$s %s %s %%", "a", "b");
	 *   retourne : "test b a a b %"
	 */
	formatStr: function (pSrc /*, pReplacement1, pReplacement2 [...]*/) {
		if (!pSrc) return pSrc;
		var vArgs = arguments;
		var vIdx = 1;

		function replaceArg(pStr, p1, p2) {
			return p1 == "%%" ? "%" : vArgs[(p2 ? p2 : vIdx++)];
		}

		return pSrc.replace(/(%(?:%|(?:(\d+)\$)?s))/g, replaceArg);
	},
	/**
	 * Implémentation partielle de l'API Formatter où les variables sont passées en tableau.
	 * Usage :
	 *   i18n.formatStr("test %2$s %1$s %s %s %%", ["a", "b"]);
	 *   retourne : "test b a a b %"
	 */
	formatStrArray: function (pSrc, pVars) {
		if (!pSrc || !pVars) return pSrc;
		var vArgs = pVars;
		var vIdx = 0;

		function replaceArg(pStr, p1, p2) {
			return p1 == "%%" ? "%" : vArgs[(p2 ? p2 - 1 : vIdx++)];
		}

		return pSrc.replace(/(%(?:%|(?:(\d+)\$)?s))/g, replaceArg);
	}
}

var js = {
	cloneJson: function (pObj) {
		function deepClone(pObj) {
			if (pObj === null || typeof pObj !== 'object')  return pObj;
			if (Array.isArray(pObj)) {
				var vArr = [];
				for (var i = 0; i < pObj.length; i++) vArr[i] = deepClone(pObj[i]);
				return vArr;
			}
			var vObj = {};
			for (var i in pObj) vObj[i] = deepClone(pObj[i]);
			return vObj;
		}

		return deepClone(pObj);
	},

	getOwnPropertyDescriptors: function (pObject) {
		var vDescriptors = {};
		var vPropNames = Object.getOwnPropertyNames(pObject);
		for (var i = 0, l = vPropNames.length; i < l; i++) {
			var vPropName = vPropNames[i];
			vDescriptors[vPropName] = Object.getOwnPropertyDescriptor(pObject, vPropName);
		}
		return vDescriptors;
	},

	overrideDescriptors: function (pDescriptors, pOverrides) {
		for (var i in pDescriptors) {
			for (var j in pOverrides) {
				pDescriptors[i][j] = pOverrides[j];
			}
		}
		return pDescriptors;
	},

	define: function (pObject, pProperties, pOverrides) {
		var vDescriptors = js.getOwnPropertyDescriptors(pProperties);
		js.overrideDescriptors(vDescriptors, pOverrides);
		return Object.defineProperties(pObject, vDescriptors);
	},

	create: function (pBaseObject, pProperties, pOverrides) {
		var vDescriptors = undefined;
		if (pProperties) {
			vDescriptors = js.getOwnPropertyDescriptors(pProperties);
			if (pOverrides) js.overrideDescriptors(vDescriptors, pOverrides)
		}
		return Object.create(pBaseObject, vDescriptors);
	}
}

var utils = {};

/**
 * Implémentation d'un gestionnaire de listeners générique.
 *
 * Initialisation du listenerMgr, lorsque le listener est un Objet :
 * Une function JS callListener() sera appelée pour diffuser l'event
 * sur un listener. A l'appel de cette fonction, l'objet this
 * est le listener, et les arguments sont ceux passés à la méthode dispatch(...).
 * Si la function callListener() ne catch pas les exceptions, le dispatch sur les
 * listeners suivants sera interrompu et l'exception renvoyée.
 * var vMyEventListenerMgr = new utils.ListenerMgr(function(pEvent, pContext, pMyArg3) {
 * 		this.onMyEvent(pEvent, pContext, pMyArg3);
 * });
 *
 * Ajout d'un listener :
 * vMyEventListenerMgr.add({onMyEvent:function(pEvent, pContext, pMyArg3){...}});
 *
 * Dispatch d'un event :
 * vMyEventListenerMgr.dispatch(vEvent, vContext, vArg3);
 *
 * Lorsque le listener est une Function :
 * var vMyEventListenerMgr = new utils.ListenerMgr();
 * vMyEventListenerMgr.add(function(p1, p2){...});
 * vMyEventListenerMgr.dispatch(v1, v2);
 *
 * Pour implémenter un dispatch() qui doit retourner une information des listeners et gérer l'interruption du dispatch,
 * il suffit de surcharger la méthode dispatch().
 */
utils.ListenerMgr = function (pCallListenerFunction) {
	if (pCallListenerFunction) this.callListener = pCallListenerFunction;
}
utils.ListenerMgr.prototype = {
	add: function (pListerner) {
		//Note d'implémentation :
		//On passe par un Object et non un Array car les instructions
		// for (vKey in vObject) ne sont pas sensibles à des evolutions
		//de l'objet durant le traitement contrairement à for (vKey in vArray)
		//ce qui pourrait créer des trous dans le parcours des listeners
		if (!this.fListeners) {
			this.fIdx = 1;
			this.fListeners = {};
		}
		this.fListeners[this.fIdx++] = pListerner;
	},
	remove: function (pListerner) {
		if (!this.fListeners) return;
		for (var vKey in this.fListeners) {
			if (this.fListeners[vKey] === pListerner) {
				delete this.fListeners[vKey];
				return;
			}
		}
	},
	dispatch: function (/* arguments */) {
		if (!this.fListeners) return;
		if (this.callListener) for (var vK in this.fListeners) this.callListener.apply(this.fListeners[vK], arguments);
		else for (var vK in this.fListeners) this.fListeners[vK].apply(null, arguments);
	}
}


/**
 * Sérialise un objet JS avec son arbre de propriétés au format CDM.
 *
 * @return String réprésentant la forme sérialisée.
 */
utils.serializeCdm = function (pObj) {
	function xSerializeCdm(pObj, pArrStr) {
		if (pObj === undefined) return;
		var vType = typeof (pObj);
		if (vType != "object") {
			// String
			if (vType != "string") pObj = new String(pObj);
			pArrStr.push("'");
			pArrStr.push(pObj.replace(/'/g, "''"));
			pArrStr.push("'");
			return;
		} else if (Array.isArray(pObj)) {
			// Tableau
			pArrStr.push("*");
			if (pObj.length > 0) {
				xSerializeCdm(pObj[0], pArrStr);
				for (var i = 1; i < pObj.length; i++) {
					pArrStr.push(".");
					xSerializeCdm(pObj[i], pArrStr);
				}
			}
			pArrStr.push("-");
		} else {
			// Object
			pArrStr.push("(");
			for (var vName in pObj) {
				if (pObj[vName] !== undefined) {
					if (/[^0z]/.test(vName)) {
						pArrStr.push("'");
						pArrStr.push(vName.replace(/'/g, "''"));
						pArrStr.push("'.");
					} else {
						pArrStr.push(vName);
					}
					xSerializeCdm(pObj[vName], pArrStr);
					pArrStr.push(" ");
				}
			}
			pArrStr.push(")");
		}
	}

	var vArrStr = [];
	xSerializeCdm(pObj, vArrStr);
	return vArrStr.join("");
}

utils.isScenariApp = function () {
	try {
		return navigator.buildID.indexOf("SCENARI_") == 0;
	} catch (e) {
		return false;
	}
}

/**
 * Retourne window.localStorage, ou window.sessionStorage à défaut.
 */
utils.getLocalStorage = function () {
	if ("fLocalStorage" in this) return this.fLocalStorage;
	try {
		this.fLocalStorage = localStorage;
		var vK = "__test_If_Storage_Is_Avalaible_";
		this.fLocalStorage.setItem(vK, vK);
		this.fLocalStorage.removeItem(vK);
	} catch (e) {
		//Fallback, on retourne le sessionStorage, faute de localStorage.
		try {
			this.fLocalStorage = sessionStorage;
			var vK = "__test_If_Storage_Is_Avalaible_";
			this.fLocalStorage.setItem(vK, vK);
			this.fLocalStorage.removeItem(vK);
		} catch (e) {
			//Fallback, on retourne {}, faute de sessionStorage.
			this.fLocalStorage = {};
		}
	}
	return this.fLocalStorage;
}

/**
 * Méthode pour remplacer le window.prompt
 */
utils.prompt = function(pMessage, pDefaultVal, pCb) {
	var vBd = dom.newBd(document.body);
	var vDialog = vBd.elt('sc-dialog').current();
	vBd.elt('div').att('style', 'font-size: 1.1em; align-items: normal; justify-content: center; background-color: white; padding: 1em;');
	vBd.elt('div').att().text(pMessage).up();
	var vInput = vBd.elt('input').att('style', 'width: 15em; margin: 0.2em 0 0.5em;').currentUp();
	vInput.focus();
	vBd.elt('div').att('style', 'display: flex; justify-content: flex-end;');
	vBd.elt('sc-btn').att('label', "Annuler").att('style', 'margin-right: 1ex;').listen('click', function () {
		vDialog.removeDialog();
		pCb(undefined);
	}).up();
	vBd.elt('sc-btn').att('label', "OK").listen('click', function () {
		vDialog.removeDialog();
		pCb(vInput.value);
	}).up();
	vBd.up().up().up();
}
