/**
 * Engine de gestion l'authentification de l'initialisation de la session et de l'accès 
 * aux services génériques de distrib.
 * 
 * Des plugins peuvent se déclarer sur cet engine.
 */
 
 
distribEngine = {
	fSession : null,
	fEngineListeners : new utils.ListenerMgr(function(pMsg, pAsynchExec) {this.onEngineEvent(pMsg, pAsynchExec)}),
	fPlugins : [],
	
	/**
	 * Configuration de l'engine, pConfig :
	 * {
	 * 	distribUrl : "...",
	 * 	urlTreeUrl : "...",
	 * 	cookieSessionName : "distTk", (optionnel, pour obtenir le code de retour "expired")
	 *  sessionInfosOptions : "json or cdm"
	 * }
	 */
	setConfig : function(pConfig) {
		this.CONFIG = pConfig;
	},
	
	/**
	 * Configure le gestionnaire de la frame du contenu principal à afficher.
	 * 
	 * Api du ContentUpdater :
	 * {
	 *  setSrc : function(pSrc)
	 * }
	 */
	setContentFrameUpdater : function(pContentUpdater) {
		this.fContentFrameUpdt = pContentUpdater;
	},
	
	addPlugin : function(pPlugin) {
		this.fPlugins.push(pPlugin);
	},
	
	getSession : function(){return this.fSession},
	getParticipantsForProjectId : function (projectId){
		const participants = [];
		const session  = distribEngine.getSession();
		Object.keys(session.participants).forEach(function(id){
			if(session.participants[id].projectId == projectId) participants.push(id)
		});
		return participants;
	},
	addEngineListener : function(pListener){this.fEngineListeners.add(pListener)},
	removeEngineListener : function(pListener){this.fEngineListeners.remove(pListener)},
	dispatchEvt: function(pMsg) {
		this.fEngineListeners.dispatch(pMsg);
	},
	/** 
	 * Diffuse un event avec la possibilité d'injecter un traitement asynchrone avant 
	 * l'exécution d'une action finale. Pour ce faire, la méthode du listener onEngineEvent(pEvt, pAsynchExec) doit retourner
	 * une callback qui enveloppe pAsynchExec et appelera pAsynchExec lorsque sa propre action asynchrone aura aboutie.
	 */
	dispatchAsynchEvt: function(pMsg, pAsynchExec) {
		var vLstnMgr = this.fEngineListeners;
		if(!vLstnMgr.fListeners) return pAsynchExec;
		for(var vK in vLstnMgr.fListeners) {
			var vNewAsynch = vLstnMgr.callListener.call(vLstnMgr.fListeners[vK], pMsg, pAsynchExec);
			if(vNewAsynch) pAsynchExec = vNewAsynch;
		}
		return pAsynchExec;
	},

	/** 
	 * Si pDatas est null : demande de connexion anonyme. 
	 * Si pDatas est de forme {nickOrAccount:"",password:""} connexion classique
	 * Si pDatas est de forme {result:""...} creation de la session puis cb
	 * 
	 * pCb(pState, pDetails) avec pState :
	 * "loaded" : loggé et session chargée
	 * "accountNotFound" : le compte est introuvable
	 * "disabledAccount" : le compte n'est pas actif, pDetails = date de réactivation du compte.
	 * "obsoletPassword" : password obsolet : DOIT être changé maintenant.
	 * "invalidPassword" : password (ou autre technique de validation du compte) invalide.
	 * "authRejected" : = "accountNotFound" OU "invalidPassword" sans possibilité de différencier.
	 * "otherFailure" : autre Echec.
	 */
	login : function(pDatas, pCb, pCbThis){
		if(pDatas!= null && pDatas.result){
			this.xLoginCb(pDatas, pCb, pCbThis);
			return;
		}
		
		var vReq = io.openHttpRequest(this.CONFIG.distribUrl + "/public/u/distribLogin?cdaction=Login", "POST");
		var vFormData;
		if(pDatas!=null) {
			vFormData = new FormData();
			vFormData.append("userProps", JSON.stringify(pDatas));
		}
		var vThis = this;
		vReq.onloadend = function(pEvt){
			if (pEvt.target.status == 200) {
				try {
					//console.log("login:::::\n"+pEvt.target.responseText);
					var vResp = JSON.parse(pEvt.target.responseText);
					vThis.xLoginCb(vResp, pCb, pCbThis);
				} catch(e){
					console.log("login failed::\n"+pEvt.target.status+"\n"+pEvt.target.responseText);
					if(pCb) pCb.call(pCbThis, "otherFailure");
					throw e;
				}
			} else {
				if(pCb) pCb.call(pCbThis, "otherFailure");
				console.log("login failed::\n"+pEvt.target.status+"\n"+pEvt.target.responseText);
			}
		}
		vReq.send(vFormData||"");
	},

	/** */
	logout : function(){
		if(this.fSession) {
			var vThis = this;
			this.dispatchAsynchEvt({type:"willLogout"}, function() {
				var vReq = io.openHttpRequest(vThis.CONFIG.distribUrl + "/run/u/distribLogout", "POST");
				vReq.onload = function() {
					vThis.xSetNewSession(null);
					vThis.dispatchEvt({type:"logoutDone"});
				}
				vReq.send();
			}).call();
		}
	},
	
	/**
	 * @param pDatas objet json avec les props du user à créer.
	 * 
	 * @param pCb(pState) avec pState :
	 * "loaded" : compte créé et session chargée
	 * "validationPending" : Le compte est en cours de création, en attente de validation.
	 * "failedAccountConflict" : Echec :  Le nom du compte existe déjà ou est en conflit avec un alias existant.
	 * "failedInvalidDatas" : Echec :  des champs du user à créer sont invalides.
	 * "otherFailure" : autre Echec.
	 */
	createAccount : function(pDatas, pCb, pCbThis) {
		var vReq = io.openHttpRequest(this.CONFIG.distribUrl + "/public/u/distribCreateUser", "POST", true);
		var vFormData = new FormData();
		vFormData.append("userProps", JSON.stringify(pDatas));
		var vThis = this;
		vReq.onloadend = function (pEvt) {
			if (pEvt.target.status == 200) {
				try {
					//console.log("createAccount:::::\n"+pEvt.target.responseText);
					var vResp = JSON.parse(pEvt.target.responseText);
					if (vResp.result) {
						//User créé, session activée
						vThis.xSetNewSession(JSON.parse(pEvt.target.responseText).result);
						if(pCb) pCb.call(pCbThis, typeof vResp.result === "object"?"loaded":vResp.result);
						return;
					}
					if(pCb) pCb.call(pCbThis, vResp.result || "otherFailure");
				} catch(e){
					if(pCb) pCb.call(pCbThis, "otherFailure");
					console.log("createAccount failed::"+pEvt.target.status+"\n"+pEvt.target.responseText);
					throw e;
				}
			} else {
				if(pCb) pCb.call(pCbThis, "otherFailure");
				console.log("createAccount failed::"+pEvt.target.status+"\n"+pEvt.target.responseText);
			}
		};
		vReq.send(vFormData);
	},

	/**
	 * @param pDatas objet json avec les props du user à éditer.
	 *
	 * @param pCb(pState) avec pState :
	 *
	 * "updated" : compte mis à jour
	 * "failedInvalidDatas" : Echec, des champs du user à modifier sont invalides
	 * "tooOldToken" : Echec, Token périmé (ou password à contrôler périmé), modification impossible.
	 * "invalidToken" : Echec, Token invalide (ou password à contrôler invalide).
	 * "accountNotFound" : Echec, User non trouvé.
	 * "accountDisabled" : Echec, Modif interdite sur un compte désactivé.
	 * "otherFailure" : Echec, raison inconnue
	 */
	editAccount : function(pDatas, pCb, pCbThis) {
		var vReq = io.openHttpRequest(this.CONFIG.distribUrl + "/run/u/distribUpdateUser", "POST", true);
		var vFormData = new FormData();
		vFormData.append("userProps", JSON.stringify(pDatas));
		var vThis = this;
		vReq.onloadend = function (pEvt) {
			if (pEvt.target.status == 200) {
				try {
					var vResp = JSON.parse(pEvt.target.responseText);
					if (pCb) pCb.call(pCbThis, vResp.result ? vResp : {result: "otherFailure"});
				} catch (e) {
					if (pCb) pCb.call(pCbThis, {result: "otherFailure"});
					console.log("editAccount failed::"+pEvt.target.status+"\n"+pEvt.target.responseText);
					throw e;
				}
			} else {
				if(pCb) pCb.call(pCbThis, {result : "otherFailure"});
				console.log("editAccount failed::"+pEvt.target.status+"\n"+pEvt.target.responseText);
			}
		};
		vReq.send(vFormData);
	},
	
	
	/**
	 * @param pNickOrAccount identification du user.
	 * @param pDatas [optionnel] paramètres supplémentaires qui pourraient être utilisés pour renforcer la sécurité.
	 * (question personnelle, email...)
	 * 
	 * @param pCb(pState, pFullResult) avec pFullResult qui est la réponse complète du server et pState :
	 *  instructionsSent : Les instructions ont été envoyées pour le renouvellement (mail envoyé, etc.). 
	 *  accountNotFound ou authRejected : Le compte est introuvable.
	 *  datasNotAvailable : Action impossible par manque de données (pas d'adresse mail fourni, etc.).
	 *  otherFailure : Autre Echec.
	 */
	passwordLost : function(pNickOrAccount, pDatas, pCb, pCbThis) {
		var vReq = io.openHttpRequest(this.CONFIG.distribUrl + "/public/u/distribPwdLost?cdaction=AskForUpdate", "POST");
		var vFormData = new FormData();
		vFormData.append("param", pNickOrAccount);
		if(pDatas) vFormData.append("userProps", JSON.stringify(pDatas));
		var vThis = this;
		vReq.onloadend = function(pEvt){
			if (pEvt.target.status == 200) {
				try {
					//console.log("passwordLost:::::\n"+pEvt.target.responseText);
					var vResp = JSON.parse(pEvt.target.responseText);
					if(pCb) pCb.call(pCbThis, vResp.result || "otherFailure", vResp);
				} catch(e){
					if(pCb) pCb.call(pCbThis, "otherFailure");
					console.log("createAccount failed::"+pEvt.target.status+"\n"+pEvt.target.responseText);
					throw e;
				}
			} else {
				if(pCb) pCb.call(pCbThis, "otherFailure");
				console.log("createAccount failed::"+pEvt.target.status+"\n"+pEvt.target.responseText);
			}
		};
		vReq.send(vFormData);
	},

	/**
	 * @param pDatas objet json {updateToken:"", password:"newPassword"}
	 *
	 * @param pCb(pState, pFullResult) avec pFullResult qui est la réponse complète du server et pState :
	 *  updated : mot de passe modifié
	 *  tooOldToken : Token trop vieux. Demande à recomencer
	 *  invalidToken : Token non reconnu
	 *  otherFailure : Autre Echec.
	 */
	renewLostPassword : function(pDatas, pCb, pCbThis) {
		var vReq = io.openHttpRequest(this.CONFIG.distribUrl + "/public/u/distribPwdLost?cdaction=UpdateUser", "POST");
		var vFormData = new FormData();
		if(pDatas) vFormData.append("userProps", JSON.stringify(pDatas));
		var vThis = this;
		vReq.onloadend = function(pEvt){
			if (pEvt.target.status == 200) {
				try {
					var vResp = JSON.parse(pEvt.target.responseText);
					if(pCb) pCb.call(pCbThis, vResp.result || "otherFailure", vResp);
				} catch(e){
					if(pCb) pCb.call(pCbThis, "otherFailure");
					console.log("renewLostPassword failed::"+pEvt.target.status+"\n"+pEvt.target.responseText);
					throw e;
				}
			} else {
				if(pCb) pCb.call(pCbThis, "otherFailure");
				console.log("renewLostPassword failed::"+pEvt.target.status+"\n"+pEvt.target.responseText);
			}
		};
		vReq.send(vFormData);
	},

	/**
	 * @param pDatas : objet json : {
	 * 		nickOrAccount:"" ou account:"""
	 * 		currentPwd:""
	 * 		password:"" : nouveau password à enregistrer.
	 * 		maxAge:0 optionnel, mémorisation du password en cookie.
	 * 		}
	 *
	 * @param pCb(pState, pDetails) avec pState :
	 * "loaded" : loggé et session chargée
	 * "accountNotFound" : le compte est introuvable
	 * "disabledAccount" : le compte n'est pas actif, pDetails = date de réactivation du compte.
	 * "obsoletPassword" : password obsolet : DOIT être changé maintenant.
	 * "invalidPassword" : password (ou autre technique de validation du compte) invalide.
	 * "authRejected" : = "accountNotFound" OU "invalidPassword" sans possibilité de différencier.
	 * "otherFailure" : autre Echec.
	 */
	renewPassword : function(pDatas, pCb, pCbThis){
		if(!pDatas) return;
		var vReq = io.openHttpRequest(this.CONFIG.distribUrl + "/public/u/distribRenewPwd", "POST");
		var vFormData = new FormData();
		vFormData.append("userProps", JSON.stringify(pDatas));
		var vThis = this;
		vReq.onloadend = function(pEvt){
			if (pEvt.target.status == 200) {
				try {
					//console.log("login:::::\n"+pEvt.target.responseText);
					var vResp = JSON.parse(pEvt.target.responseText);
					vThis.xLoginCb(vResp, pCb, pCbThis);
				} catch(e){
					console.log("renewPassword failed::\n"+pEvt.target.status+"\n"+pEvt.target.responseText);
					if(pCb) pCb.call(pCbThis, "otherFailure");
					throw e;
				}
			} else {
				if(pCb) pCb.call(pCbThis, "otherFailure");
				console.log("renewPassword failed::\n"+pEvt.target.status+"\n"+pEvt.target.responseText);
			}
		};
		vReq.send(vFormData);
	},

	/**
	 * @param pDatas : objet json : {
	 * 		password:"" : password à controler.
	 * 		nickOrAccount:"" ou account:"" (Obligatoire si le serveur controle l'historique des passwords du user.)
	 * 		currentPwd:"" (Obligatoire si le serveur controle l'historique des passwords du user.)
	 * 		}
	 *
	 * @param pCb(pState, pDetails) avec pState :
	 * "ok" : password acceptable
	 * "failedInvalidDatas" : password non satisfaisant, pDetails = tableau Json de messages explicatifs
	 * "accountNotFound" : le compte est introuvable
	 * "disabledAccount" : le compte n'est pas actif, pDetails = date de réactivation du compte.
	 * "invalidPassword" : password (ou autre technique de validation du compte) invalide.
	 * "authRejected" : = "accountNotFound" OU "invalidPassword" sans possibilité de différencier.
	 * "otherFailure" : autre Echec.
	 */
	checkPwd : function(pDatas, pCb, pCbThis){
		if(!pDatas) return;
		var vReq = io.openHttpRequest(this.CONFIG.distribUrl + "/public/u/distribCheckPwd", "POST");
		var vFormData = new FormData();
		vFormData.append("userProps", JSON.stringify(pDatas));
		var vThis = this;
		vReq.onloadend = function(pEvt){
			if (pEvt.target.status == 200) {
				try {
					//console.log("login:::::\n"+pEvt.target.responseText);
					var vResp = JSON.parse(pEvt.target.responseText);
					if(pCb) pCb.call(pCbThis, vResp.result, vThis.xGetDetails(vResp));
				} catch(e){
					console.log("checkPwd failed::\n"+pEvt.target.status+"\n"+pEvt.target.responseText);
					if(pCb) pCb.call(pCbThis, "otherFailure");
					throw e;
				}
			} else {
				if(pCb) pCb.call(pCbThis, "otherFailure");
				console.log("checkPwd failed::\n"+pEvt.target.status+"\n"+pEvt.target.responseText);
			}
		};
		vReq.send(vFormData);
	},

	xGetDetails : function(pResp) {
		switch(pResp.result){
			case "accountDisabled" : return pResp.secondaryResults ? pResp.secondaryResults.disabledEndDt : null;
			case "failedInvalidDatas" : return pResp.secondaryResults ? pResp.secondaryResults.msgs : null
		}
		return null;
	},
	
	/**
	 * pCb(pState) avec pState :
	 * "loaded" : session rechargée
	 * "expired" : session trouvée mais expirée (exige la présence d'un cookie de check de session dans this.CONFIG.cookieSessionName)
	 * "notFound" : aucune session en cours trouvée
	 * "error" : autre erreur serveur.
	 */
	reloadSession : function(pCb, pCbThis){
		var vCookies = io.parseCookies(document);
		if(!this.CONFIG.cookieSessionName || vCookies[this.CONFIG.cookieSessionName]) {
			var vReq = io.openHttpRequest(this.CONFIG.distribUrl + "/run/u/distribEngine?cdaction=GetSessionInfo");
			var vThis = this;
			vReq.onloadend = function (pEvt) {
				var vSt = pEvt.target.status;
				if (vSt == 200) {
					vThis.xSetNewSession(JSON.parse(pEvt.target.responseText));
					if (pCb) pCb.call(pCbThis, "loaded");
				} else if (vSt == 403) {
					if (pCb) pCb.call(pCbThis, vThis.CONFIG.cookieSessionName ? "expired" : "notFound");
				} else {
					if (pCb) pCb.call(pCbThis, "error");
					console.log("reloadSession failed::" + vSt + "\n" + pEvt.target.responseText);
				}
			};
			vReq.send();
		} else{
			if(pCb) pCb.call(pCbThis, "notFound");
		}
	},
	
	/**
	 * Envoie 1 à N messages au server pour le participant pParticipantId.
	 * @param pPooled Si true, l'envoi n'est pas immédiat, il sera envoyé avec le prochain envoi effectif.
	 * @param pCb Callback avec en paramètre
	 * @param pCbThis
	 */
	sendParticipantMsgs : function(pParticipantId, pMsgs, pPooled, pCb, pCbThis, pCbError) {
		var vPool = this.fParticipMsgsToSend[pParticipantId];
		if(pPooled) {
			if(!vPool) vPool = this.fParticipMsgsToSend[pParticipantId] = {msgs:[], cbs:[]};
			if(Object.prototype.toString.call(pMsgs) === '[object Array]') Array.prototype.push.apply(vPool, pMsgs);
			else vPool.msgs.push(pMsgs); 
			if(pCb) vPool.cbs.push(pCb, pCbThis);
			return;
		}
		if(vPool) {
			pMsgs = pMsgs ? vPool.msgs.concat(pMsgs) : vPool.msgs;
			this.fParticipMsgsToSend[pParticipantId] = null;
		}
		var vReq = io.openHttpRequest(this.CONFIG.distribUrl + "/run/u/participant?cdaction=TransmitMsg&id="+pParticipantId, "POST");
		vReq.setRequestHeader("Content-Type", "application/json");
		var vThis = this;
		vReq.onloadend = function(pEvt){
			if(pCb) pCb.call(pCbThis, pEvt);
			if(vPool) for(var i=0; i<vPool.length; i++) vPool[i].call(vPool[i++], pEvt);
			if (pEvt.target.status == 200) {
				var vTxt = pEvt.target.responseText;
				if(vTxt) {
					//console.log("RECEIVEmsg::::::\n"+vTxt);
					var vMsgIn = JSON.parse(vTxt);
					for(var i=0; i<vMsgIn.length; i++) {
						vThis.dispatchEvt(vMsgIn[i]);
					}
				}
			} else if (pEvt.target.status >= 400) {
				if(pCbError) pCbError.call(pCbThis, pEvt);
				else if(pEvt.target.status == 403) distribEngine.reloadSession();
				console.log("distribEngine.sendParticipantMsg failed for '" + pParticipantId +"': " + pEvt.target.status + ": " + pEvt.target.responseText);
			}
		}
		//console.log("SENDmsg::::::\n"+JSON.stringify(pMsgs));
		vReq.send(pMsgs ? JSON.stringify(pMsgs) : "");
	},
	fParticipMsgsToSend:{},

    /**
     * Envoie 1 à N messages au server pour l'actor pActorId.
     * @param pPooled Si true, l'envoi n'est pas immédiat, il sera envoyé avec le prochain envoi effectif.
     * @param pCb Callback avec en paramètre
     * @param pCbThis
     */
    sendActorMsgs : function(pActorId, pMsgs, pPooled, pCb, pCbThis, pCbError) {
        var vPool = this.fActorsToSend[pActorId];
        if(pPooled) {
            if(!vPool) vPool = this.fActorsToSend[pActorId] = {msgs:[], cbs:[]};
            if(Object.prototype.toString.call(pMsgs) === '[object Array]') Array.prototype.push.apply(vPool, pMsgs);
            else vPool.msgs.push(pMsgs);
            if(pCb) vPool.cbs.push(pCb, pCbThis);
            return;
        }
        if(vPool) {
            pMsgs = pMsgs ? vPool.msgs.concat(pMsgs) : vPool.msgs;
            this.fActorsToSend[pActorId] = null;
        }
        var vReq = io.openHttpRequest(this.CONFIG.distribUrl + "/run/u/actor?cdaction=TransmitMsg&id="+pActorId, "POST");
        vReq.setRequestHeader("Content-Type", "application/json");
        var vThis = this;
        vReq.onloadend = function(pEvt){
            if(pCb) pCb.call(pCbThis, pEvt);
            if(vPool) for(var i=0; i<vPool.length; i++) vPool[i].call(vPool[i++], pEvt);
            if (pEvt.target.status == 200) {
                var vTxt = pEvt.target.responseText;
                if(vTxt) {
                    //console.log("RECEIVEmsg::::::\n"+vTxt);
                    var vMsgIn = JSON.parse(vTxt);
                    for(var i=0; i<vMsgIn.length; i++) {
                        vThis.dispatchEvt(vMsgIn[i]);
                    }
                }
            } else if (pEvt.target.status >= 400) {
                if(pCbError) pCbError.call(pCbThis, pEvt);
                else if(pEvt.target.status == 403) distribEngine.reloadSession();
                console.log("distribEngine.sendActorMsg failed for '" + pActorId +"': " + pEvt.target.status + ": " + pEvt.target.responseText);
            }
        };
        vReq.send(pMsgs ? JSON.stringify(pMsgs) : "");
    },
    fActorsToSend:{},
	
	/** 
	 * Initialise la frame de contenu en fonction des infos issues la session.
	 * L'affectation du contenu peut-être asycnhrone.
	 */
	initContentFrameFromSession : function(){
		if(!this.fSession) {
			this.fContentFrameUpdt.setSrc(null);
		} else {
			this.setMainDepotPath(this.findMainDepotPath());
		}
	},
	
	/** 
	 * Recherche le depotPath à afficher. 
	 * Par défaut recherche le 1er paramètre "depotPath" dans la session.
	 * A surcharger en fonction du contexte... 
	 */
	findMainDepotPath : function() {
		var vResult = jsonPath(this.fSession, "$..depotPath");
		return vResult ? vResult[0] : null;
	},
	

	/** 
	 * Affecte une ressource du dépot sur l'iframe principale.
	 */
	setMainDepotPath : function(pDepotPath){
		//reset et unload préalable avant affectation de la nouvelle url.
		this.fContentFrameUpdt.setSrc(null);
		if(pDepotPath) {
			//On va attendre les chargements asynch éventuels des plugins.
			var vCount = 1;
			function cbContextReady() {
				if(--vCount==0) this.fContentFrameUpdt.setSrc(this.CONFIG.urlTreeUrl + pDepotPath);
			}
			for(var i=0; i < this.fPlugins.length; i++) {
				if("prepareForDepotPath" in this.fPlugins[i]) {
					vCount++;
					this.fPlugins[i].prepareForDepotPath(pDepotPath, cbContextReady, this);
				}
			}
			cbContextReady.call(this);
		}
	},
	
	xSetNewSession : function(pNewSession){
		var vOld = this.fSession;
		if(pNewSession) {
			this.fSession = pNewSession;
		} else {
			this.fSession = null;
		}
		//Ajout des ids sur chaque objet pour faciliter la navigation dans la session
		if(pNewSession) {
			if(pNewSession.participants) for(var vId in pNewSession.participants) pNewSession.participants[vId].id = vId;
			if(pNewSession.projects) for(var vId in pNewSession.projects) pNewSession.projects[vId].id = vId;
			if(pNewSession.actors) for(var vId in pNewSession.actors) pNewSession.actors[vId].id = vId;
			if(pNewSession.rooms) for(var vId in pNewSession.rooms) pNewSession.rooms[vId].id = vId;
			//console.log("pNewSession:::" + JSON.stringify(pNewSession));
		}
		if(vOld || pNewSession) this.dispatchEvt({type:"newSession", oldSession:vOld});
	},
	
	xLoginCb : function(pResp, pCb, pCbThis){
		if(typeof pResp.result == "object" ) {
			this.xSetNewSession(pResp.result);
			if(pCb) pCb.call(pCbThis, "loaded");
		} else {
			if(pCb) pCb.call(pCbThis, pResp.result || "otherFailure", this.xGetDetails(pResp));
		}
	},
	
	pingServer : function() {
		if(!this.fSession) return;
		var vParticips = this.fSession.participants;
		for(var vParticipantId in vParticips) {
			this.sendParticipantMsgs(vParticipantId);
		}
		var vActors = this.fSession.actors;
		for(var vActorId in vActors) {
			this.sendActorMsgs(vActorId);
		}
	}
	
};


window.setInterval(function(){
	//ping du serveur toutes les minutes : maintien de la session, détection d'un chgt, connection concurrente...
	window.distribEngine.pingServer();
}, 60000);

(function(){
	var vEvt, vHiddenProp;
	if("hidden" in document) {vHiddenProp="hidden"; vEvt="visibilitychange"}
	else if("webkitHidden" in document) {vHiddenProp="webkitHidden"; vEvt="webkitvisibilitychange"}
	else if("mozHidden" in document) {vHiddenProp="mozHidden"; vEvt="mozvisibilitychange"}
	else if("msHidden" in document) {vHiddenProp="msHidden"; vEvt="msvisibilitychange"}
	else return;
	document.addEventListener(vEvt, function(){
		//ping du serveur dès que l'écran reprend le focus (détection d'un changement, connection concurrente...).
		if(!document[vHiddenProp]) window.distribEngine.pingServer();
	}, false);
	window.addEventListener("beforeunload", window.distribEngine.pingServer, false);
})();
