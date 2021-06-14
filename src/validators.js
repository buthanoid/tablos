import * as TabLib from "./tablos.js";

export { 
	validTabloProperty,
	validHeaderProperty 
};

// ===================== TABLOS ===============================

function validTabloProperty (tabenv, tablo, property, newValue) {
	switch (property) {
		case "alias": return validTabloAlias(tabenv, tablo, newValue);
		case "label": return validTabloLabel(newValue);
		case "displayNumLines": return validTabloDisplayNumLines(newValue);
		default:
			var msg = "unknown property for validHeaderProperty: " + property;
			console.log(msg);
			return { valid: false, msg: msg };
	};
}

function validTabloAlias (tabenv, tablo, newAlias) {
	var valid = true;
	var msg = "";
	// non empty
	if (newAlias == "") {
		valid = false;
		msg += "L'alias ne doit pas être vide. ";
	}
	// unique in the tabenv
	else if (newAlias != tablo.alias && tabenv.tablos.has(newAlias)) {
		valid = false ;
		msg += "L'alias de tablo doit être unique au sein de l'environnement. ";
	}
	// TODO : check that only latin small letter, and digits but not first
	return { valid: valid, msg: msg }
}

function validTabloLabel (newLabel) {
	var valid = true;
	var msg = "";
	// non empty
	if (newLabel == "") {
		valid = false;
		msg += "Le label ne doit pas être vide. ";
	}
	return { valid: valid, msg: msg }
}

function validTabloDisplayNumLines (newDisplayNumLines) {
	var valid = true;
	var msg = "";
	// boolean type
	if (typeof newDisplayNumLines != "boolean") {
		valid = false;
		msg += "L'affichage des numéros de ligne doit être de " +
			"type booléen et non de type : " + 
			(typeof newDisplayNumLines) + ". ";
	}
	return { valid: valid, msg: msg }
}

// ============== HEADERS ==================== 

function validHeaderProperty (tablos, tablo, header, property, newValue) {
	switch (property) {
		case "alias": return validHeaderAlias(tablo, header, newValue);
		case "label": return validHeaderLabel(newValue);
		case "type": return validHeaderType(newValue);
		case "order": return validHeaderOrder(tablo, newValue);
		case "args": return validHeaderArgs(tablos, newValue);
		case "func": return validHeaderFunc(newValue);
		default:
			var msg = "unknown property for validHeaderProperty: " + property;
			console.log(msg);
			return { valid: false, msg: msg };
	}
}

function validHeaderAlias (tablo, header, newAlias) {
	var valid = true;
	var msg = "";
	// non empty
	if (newAlias == "") {
		valid = false ;
		msg += "L'alias ne doit pas être vide. " ;
	}
	// must be unique in the tablo
	else if (newAlias != header.alias && 
		TabLib.getByAlias(tablo.headers, newAlias)) {
		valid = false ;
		msg += "L'alias de header doit être unique au sein du tablo. ";
	}
	// TODO : check that only latin small letter, and digits but not first
	return { valid: valid, msg: msg };
}
			
function validHeaderLabel (newLabel) {
	var valid = true;
	var msg = "";
	// non empty
	if (newLabel == "") {
		valid = false;
		msg += "Le label ne doit pas être vide. ";
	}
	return { valid: valid, msg: msg };
}

function validHeaderType (newType) {
	var valid = true;
	var msg = "";
	// known type
	if (! TabLib.TABTYPEHEADER.includes(newType)) {
		valid = false;
		msg += "Le type du header doit avoir une des valeurs suivantes : " + 
			TabLib.TABTYPEHEADER  + ". ";
	}
	return { valid: valid, msg: msg };
}

function validHeaderOrder (tablo, newOrder) {
	var valid = true;
	var msg = "";
	// known type
	if (newOrder < 0 || newOrder >= tablo.headers.length) {
		valid = false;
		msg += "L'ordre doit être entre 0 et " + tablo.headers.length + ". ";
	}
	return { valid: valid, msg: msg };
}

function validHeaderArgs (tablos, newArgs) {
	var valid = true;
	var msg = "";
	newArgs.forEach(function (newArg, index) {
		var res = validHeaderArg(tablos, newArg, index);
		valid = valid && res.valid;
		msg += res.msg;
	});
	return { valid: valid, msg: msg };
}

function validHeaderArg (tablos, newArg, index) {
	var valid = true;
	var msg = "";
	switch (newArg.type) {
		case TabLib.NULLARG: break;
		case TabLib.COLSAMELINEARG:
			// non empty tablo alias 
			if (newArg.alias.tablo == "") {
				valid = false;
				msg += "L'alias de tablo dans l'argument " + index +
					" ne doit pas être vide. ";
			}
			// non empty header alias 
			if (newArg.alias.header == "") {
				valid = false;
				msg += "L'alias de header dans l'argument " + index +
					" ne doit pas être vide. ";
			}
			// tablo must exist
			var tablo = tablos.get(newArg.alias.tablo);
			if (tablo === undefined) {
				valid = false;
				msg += "L'alias de tablo dans l'argument " + index +
					"n'existe pas. ";
			}
			// header must exist in the tablo
			else {
				var header = 
					TabLib.getByAlias(tablo.headers, newArg.alias.header);
				if (header === undefined) {
					valid = false;
					msg += "L'alias de header " + newArg.alias.header + 
						" dans l'argument " + index +
						" n'existe pas dans le tablo " + 
						newArg.alias.tablo + ". ";
				}
			}
			break;
		default: 
			valid = false;
			msg += "Le type de l'argument " + index + " doit être " +
				"parmi les valeurs suivantes : " + TabLib.TABTYPEARG + ". ";
	}
	return { valid: valid, msg: msg };
}

function validHeaderFunc (newFunc) {
	var valid = true;
	var msg = "";
	// non empty
	if (newFunc == "") {
		valid = false;
		msg += "La fonction ne doit pas être vide. ";
	}
	// no parse errors
	else {
		var code = "\"use strict\"; return (" + newFunc + ");";
		try {
			var f = new Function(code) ();
			// if parse succeed, must have type function
			if (typeof f != "function") {
				valid = false;
				msg += "Le parsage de la fonction doit donner " +
					"le type fonction, et non le type : " + (typeof f) + ". ";
			}
		}
		catch (error) {
			valid = false;
			msg += "Le parsage de la fonction donne l'erreur suivante : " +
				error.toString() + ". ";
		}
	}
	return { valid: valid, msg: msg };
}

