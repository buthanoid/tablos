"use strict";

export { 
	// constants
	DATA_HEADER,
	FUNC_HEADER,
	TAB_HEADER_TYPES,
	NULL_ARG,
	COL_SAMELINE_ARG,
	TAB_ARG_TYPES,
	// utilities
	newRes,
	parseStrToFunction,
	aliasesToStr,
	// check functions
	checkUpdTabloAlias,
	checkTabloLabel,
	checkTabloDisplayNumLines,
	checkUpdHeaderAlias,
	checkHeaderLabel,
	checkHeaderType,
	checkHeaderOrder,
	checkHeaderArgs,
	checkHeaderFunc,
	// reactMap functions
	newReactMap,
	newReactKey,
	newReaction,
	hasReactKey,
	hasReaction,
	getReactions,
	getReactKeysFromReaction,
	updReactKey,
	delReactKey,
	delReaction,
	delReactionFromAllKeys,
	// new functions
	newTabenv, 
	newTablo,
	newDataHeader,
	newColSamelineArg,
	newFuncHeader,
	newLine,
	newHeaderArg,
	copyArg,
	// get functions
	getCell,
	getCellByAliases,
	// upd functions
	updTabloAlias,
	updTabloLabel,
	updTabloDisplayNumLines,
	updHeaderAlias,
	updHeaderLabel,
	updHeaderType,
	updHeaderOrder,
	updHeaderArgs,
	updHeaderFunc,
	updLineAllFuncCells,
	updFuncHeaderAllCells,
	updTabloAllFuncHeadersAllCells,
	updFuncCell,
	updDataCell,
	// del functions
	delTablo,
	delHeader,
	delArgFromHeader,
	delAllArgsFromHeader
};


// ================ CONSTANTS =========================

const DATA_HEADER = 0 ;
const FUNC_HEADER = 1 ;
const TAB_HEADER_TYPES = [ DATA_HEADER, FUNC_HEADER ];

const NULL_ARG = -1 ;
const COL_SAMELINE_ARG = 0 ;
const TAB_ARG_TYPES = [ NULL_ARG, COL_SAMELINE_ARG ];


// ================= UTILITIES =======================

// structure that represents a success (or a failure)
// the value field is optional. it can be full or null, no matter of success
// the errMsg is filled with informative string in case of failure
// the warnMsg is filled with informative string, about a noncritical error
// a res object is meant to be sent to a function that will modify it in place
function newRes () { 
	return { 
		success: true, 
		value: null,
		errors: "",
		warnings: "",
		addError: function (errMsg) {
			this.success = false;
			this.errors += errMsg + " ";
		},
		addWarn: function (warnMsg) { 
			this.warnings += warnMsg + " "; 
		},
		combine: function (otherRes) {
			this.success = this.success && otherRes.success ;
			this.value = otherRes.value;
			this.errors += otherRes.errors ;
			this.warnings += otherRes.warnings ;
		}
	}
}

function parseStrToFunction (strFunc) {

	var res = newRes();

	// non empty
	if (strFunc == "") res.addError("La fonction ne doit pas être vide.");
	
	// no parse errors
	else {
		try {
			var parsedFunc = new Function(
				"\"use strict\"; return (" + strFunc + ");"
			) ();
			
			// parsed must have type function
			if (typeof parsedFunc != "function") {
				res.addError( 
					"Le parsage de la fonction doit donner " +
					"le type fonction, et non le type : " + 
					(typeof parsedFunc) + "."
				);
			}
			
			if (res.success) res.value = parsedFunc;
		}
		catch (error) {
			addError(
				"Le parsage de la fonction donne l'erreur suivante : " +
				error.toString() + "."
			);
		}
	}
	
	return res;
}

// convert alias object, to alias string
function aliasObjToStr (alias) { return alias.tablo + "." + alias.header }

// convert two alias str parts, to one complete alias str
function aliasesToStr (tabloAlias, headerAlias) {
	return tabloAlias + "." + headerAlias ;
}

// convert alias str, to alias object
function aliasObjFromStr (str) { 
	var tab = str.split(".");
	return { tablo: tab[0], header: tab[1] }
}

// convert two alias str parts, to one alias object
function aliasesToObj (tabloAlias, headerAlias) {
	return { tablo: tabloAlias, header: headerAlias };
}

// moving an array element from oldIndex to newIndex
// we do not update in place at the newIndex : we shift the elements 
function arrayMove (array, oldIndex, newIndex) {
	
	var oldElt = array[oldIndex];
	
	// moving an element to the right
	if (oldIndex < newIndex) {
		for (var i = oldIndex ; i < newIndex ; i ++) {
			array[i] = array[i + 1];
		}
		array[newIndex] = oldElt;
	}
	
	// moving an element to the left
	else if (oldIndex > newIndex) {
		for (var i = oldIndex ; i > newIndex ; i --) {
			array[i] = array[i - 1];
		}
		array[newIndex] = oldElt;
	}
}


// ==================== CHECK FUNCTIONS =======================

// checks the alias of a new tablo 
// note : there exists a different check for an update of the alias of a tablo
function checkNewTabloAlias (tabenv, alias, res) {

	// non empty
	if (alias == "") res.addError("L'alias de tablo ne doit pas être vide.");
	
	// unique in the tabenv
	else if (tabenv.tablos.has(alias)) {
		res.addError(
			"L'alias de tablo doit être unique au sein de l'environnement. "
		);
	}
	
	// TODO : check that only latin small letter, and digits but not first
}

function checkUpdTabloAlias (tabenv, oldAlias, newAlias, res) {

	// non empty
	if (newAlias == "") res.addError("L'alias de tablo ne doit pas être vide.");
	
	// unique in the tabenv
	else if (oldAlias != newAlias && tabenv.tablos.has(newAlias)) {
		res.addError(
			"L'alias de tablo doit être unique au sein de l'environnement. "
		);
	}
	
	// TODO : check that only latin small letter, and digits but not first
}

// checks the label of a tablo
function checkTabloLabel (label, res) {
	// non empty
	if (label == "") res.addError("Le label de tablo ne doit pas être vide.");
}

function checkTabloDisplayNumLines (displayNumLines, res) {
	// boolean type
	if (typeof displayNumLines != "boolean") {
		res.addError(
			"Le type de displayNumLines doit être boolean " +
			"et non : " + (typeof displayNumLines) + "."
		);
	}
}

// check alias a of a new header
// note that the check for the update of alias of existing header is different
function checkNewHeaderAlias (tablo, alias, res) {
	// non empty
	if (alias == "") res.addError("L'alias de header ne doit pas être vide.");
	
	// unique in the tablo
	else if (tablo.getHeaderByAlias(alias)) {
		res.addError(
			"L'alias de header " + alias + " existe déjà " +
			"dans le tablo " + tablo.alias + "."
		);
	}
	
	// TODO : check that only latin small letter, and digits but not first
}

function checkUpdHeaderAlias (tablo, oldAlias, newAlias, res) {
	// non empty
	if (newAlias == "") res.addError("L'alias de header ne doit pas être vide.");
	
	// unique in the tablo
	else if (oldAlias != newAlias && tablo.getHeaderByAlias(newAlias)) {
		res.addError(
			"L'alias de header doit être unique au sein du tablo. "
		);
	}
	
	// TODO : check that only latin small letter, and digits but not first
}

// checks the label of a header
function checkHeaderLabel (label, res) {
	// non empty
	if (label == "") res.addError("Le label de header ne doit pas être vide.");
}

// checks the type of a header
function checkHeaderType (type, res) {
	if (! TAB_HEADER_TYPES.includes(type)) {
		res.addError(
			"Le type de header doit être parmi les suivants : " + 
			TAB_HEADER_TYPES.toString() + "."
		);
	}
}

// checks the order of a header
function checkHeaderOrder (tablo, order, res) {
	if (order < 0 || order >= tablo.headers.length) {
		res.addError(
			"L'ordre doit être entre 0 et " + tablo.headers.length + ". "
		);
	}
}

// check arg of a func header
function checkHeaderArg (tablos, arg, res) {
	switch (arg.type) {
		case NULL_ARG: break;
		case COL_SAMELINE_ARG:
			// existing tablo
			var tablo = tablos.get(arg.alias.tablo);
			if (tablo === undefined) {
				res.addError(
					"Le tablo spécifié par l'alias " + arg.alias.tablo + 
					" dans l'argument du header est inconnu."
				);
			}
			// existing header
			else {
				var header = tablo.getHeaderByAlias(arg.alias.header);
				if (header === undefined) {
					res.addError(
						"Le header spécifié par l'alias " + 
						aliasesToStr(arg.alias.tablo, arg.alias.header) +
						" dans l'argument du header est inconnu."
					);
				}
			}
			break;
		default: 
			res.addError(
				"Le type de l'argument est inconnu. Il vaut " +
				arg.type + " et devrait être parmi les valeurs suivantes : " +
				TAB_ARG_TYPES.toString() + "."
			); 	
	}
}

// check all args of a func header
function checkHeaderArgs (tablos, args, res) {
	args.forEach(function (arg) {
		checkHeaderArg(tablos, arg, res);
	});
}

// check the func of a func header
function checkHeaderFunc (func, res) {

	// function type
	if (typeof func != "function") {
		res.addError("La fonction doit être de type : function.");
	}
}


// ==================== REACTS FUNCTIONS =======================

// a ReactMap is a Map, from Alias string, to Alias string set
// exemple { "tablo1.header1" -> { "tablo2.header2", "tablo2.header3" }}
function newReactMap () { return new Map() }

function newReactKey (reactMap, reactKey) { 
	reactMap.set(reactKey, new Set());
}

// a reaction is an element of the set of a reactKey
function newReaction (reactMap, reactKey, reaction) {
	var res = newRes();
	if (hasReactKey(reactMap, reactKey)) {
		reactMap.get(reactKey).add(reaction);
	}
	else res.addError("Could not find reactKey " + reactKey + " in reactMap.");
	return res;
}

function hasReactKey (reactMap, reactKey) { return reactMap.has(reactKey) }

// does the key exist and does the reaction exist in the associated set ?
function hasReaction (reactMap, reactKey, reaction) {
	return (
		hasReactKey(reactMap, reactKey) && 
		reactMap.get(reactKey).has(reaction)
	);
}


function getReactions (reactMap, reactKey) {
	return reactMap.get(reactKey);
}

// get all reactKeys that contains the reaction
function getReactKeysFromReaction (reactMap, reaction) {
	var result = new Set();
	reactMap.forEach(function(reactionSet, reactKey) {
		if (reactionSet.has(reaction)) result.add(reactKey);
	});
	return result;
}

function updReactKey (reactMap, oldReactKey, newReactKey) {
	if (! hasReactKey(reactMap, oldReactKey)) return false;
	if (oldReactKey == newReactKey) return true;
	var reactions = getReactions(reactMap, oldReactKey);
	delReactKey(reactMap, oldReactKey);
	if (hasReactKey(reactMap, newReactKey)) {
		reactMap.set(oldReactKey, reactions); // cancel
		return false;
	}
	else {
		reactMap.set(newReactKey, reactions);
		return true;
	}
}

function delReactKey (reactMap, reactKey) { 
	return reactMap.delete(reactKey) 
}

function delReaction (reactMap, reactKey, reaction) {
	if(hasReactKey(reactMap, reactKey)) {
		return reactMap.get(reactKey).delete(reaction);
	}
	else return false;
}

// delete a reaction from every key where it appears
function delReactionFromAllKeys (reactMap, reaction) {
	reactMap.forEach(function(reactionSet) {
		reactionSet.delete(reaction);
	});
} 

// ==================== NEW FUNCTIONS =======================

// create a new TabloEnvironment
function newTabenv () {
	return {
		tablos: new Map(),
		reactMap: newReactMap()
	}
}

// create a new tablo and add it to tabenv
function newTablo (tabenv, alias, label) {
	
	var res = newRes();
	checkNewTabloAlias(tabenv, alias, res);
	checkTabloLabel(label, res);
	
	if (res.success) {
		
		var tablo = {
			alias: alias,
			label: label,
			headers: [],
			data:[],
			displayNumLines: true,
			
			getHeaderByAlias: function (targetHeaderAlias) {
				return this.headers.find(function (header) {
					return header.alias == targetHeaderAlias;
				});
			}
		};
		
		tabenv.tablos.set(alias, tablo);
		
		res.value = tablo;
	}
	
	return res;
}

// create a new header and add it to a tablo
function newHeader (tabenv, tablo, alias, label, type) {

	var res = newRes();
	checkNewHeaderAlias (tablo, alias, res);
	checkHeaderLabel (label, res);
	checkHeaderType (type, res);
	
	if (res.success) {
		var header = {
			alias: alias,
			label: label,
			type: type,
			order: tablo.headers.length
		};
		
		tablo.headers.push(header);
		newReactKey(tabenv.reactMap, aliasesToStr(tablo.alias, header.alias));
		
		res.value = header;
	}
	
	return res;
}

// create a new data header and add it to tablo
function newDataHeader (tabenv, tablo, alias, label) {
	return newHeader(tabenv, tablo, alias, label, DATA_HEADER);
} 

// create a new arg with type COL_SAMELINE_ARG
function newColSamelineArg(tabloAlias, headerAlias) {
	return {
		type: COL_SAMELINE_ARG,
		alias: {
			tablo: tabloAlias,
			header: headerAlias
		}
	};
}

// create a new func header and add it to tablo
function newFuncHeader (tabenv, tablo, alias, label, args, func) {

	var res = newHeader(tabenv, tablo, alias, label, FUNC_HEADER);
	
	if (! res.success) return res;
	
	var header = res.value;
	header.args = args;
	header.func = func;
	
	// check args and func
	checkHeaderArgs	(tabenv.tablos, args, header);
	checkHeaderFunc (func, header);
	
	if (! res.success) return res;
	
	// add reactions
	var fullHeaderAlias = aliasesToStr(tablo.alias, alias); 
	args.forEach(function (arg) {
		switch (arg.type) {
			case NULL_ARG: break;
			case COL_SAMELINE_ARG: 
				var argAlias = aliasObjToStr(arg.alias);
				res.combine(newReaction(
					tabenv.reactMap, argAlias, fullHeaderAlias
				));
				break;
			default: console.log("unknown arg type");
		}
	});
	
	if (! res.success) return res;

	res.combine(updFuncHeaderAllCells (tabenv, tablo, header));
	
	res.value = header;
	return res;
}

// create a new line for a tablo
function newLine (tabenv, tablo) {	
	var line = new Array(tablo.headers.length);
	line.fill(null);
	tablo.data.push(line);
	var res = newRes();
	res.combine(updLineAllFuncCells(tabenv, tablo, tablo.data.length - 1));
	return res;
}

// add a new arg to a header 
function newHeaderArg (tabenv, tablo, header, newArg) {
	var res = newRes();
	if (header.type != FUNC_HEADER) {
		res.addError("header is not func type so has no args to update");
	}
	else checkHeaderArg (tabenv.tablos, newArg, res);
	
	if (! res.success) return res;
	
	// add arg to tab arg
	header.args.push(newArg);
	
	// add reaction
	switch (newArg.type) {
		case NULL_ARG: break;
		case COL_SAMELINE_ARG: 
			var argAliasStr = aliasObjToStr(newArg.alias);
			var fullHeaderAlias = aliasesToStr(tablo.alias, header.alias);
			res.combine(newReaction(
				tabenv.reactMap, argAliasStr, fullHeaderAlias
			));
			break;
		default: console.log("unknown arg type");
	}
	
	res.combine(updFuncHeaderAllCells (tabenv, tablo, header));
	
	return res;
}

// return a strict copy of the header arg
function copyArg (arg) {
	switch (arg.type) {
		case NULL_ARG: return { type: NULL_ARG };
		case COL_SAMELINE_ARG: 
			return {
				type: COL_SAMELINE_ARG,
				alias: {
					tablo: arg.alias.tablo,
					header: arg.alias.header
				}
			};
		default: console.log("unknown arg type");
	}
}


// ==================== GET FUNCTIONS =======================

// get cell without checks 
function getCell (tablo, header, numLine) {
	return tablo.data[numLine][header.order];
}

// get cell value by aliases and do checks
function getCellByAliases (tabenv, tabloAlias, headerAlias, numLine) {
	var res = newRes();
	
	var tablo = tabenv.tablos.get(tabloAlias);
	if (tablo === undefined) {
		res.addError("Cannot find tablo : " + tabloAlias + ".");
	}
	else {
		var header = tablo.getHeaderByAlias(headerAlias);
		if (header === undefined) {
			res.addError(
				"getCellByAliases() : Cannot find header " + 
				tabloAlias + "[" + headerAlias + "]."
			);
		}
		if (numLine < 0 || numLine >= tablo.data.length) {
			res.addError(
				"NumLine " + numLine + " is out ouf bounds [0, " + 
				tablo.data.length + "]."
			);
		}
	}
	
	if (res.success) res.value = getCell(tablo, header, numLine);
	return res;
}


// ==================== UPD FUNCTIONS =======================


function updTabloAlias (tabenv, tablo, newAlias) {

	var oldAlias = tablo.alias;
	
	var res = newRes();
	checkUpdTabloAlias(tabenv, oldAlias, newAlias, res);
	
	if (! res.success) return res;
	
	// we need to :
	// 1. upd old tablo alias in ReactKey
	// 2. upd old tablo alias in Args
	// 3. upd old tablo alias in Reactions
	tablo.headers.forEach(function (header) {
	
		var oldHeaderFullAlias = aliasesToStr(oldAlias, header.alias);
		var newHeaderFullAlias = aliasesToStr(newAlias, header.alias);
		
		// 1. upd old tablo alias in ReactKey
		updReactKey(tabenv.reactMap, oldHeaderFullAlias, newHeaderFullAlias);
		
		// 2. upd old tablo alias in Args
		var reactions = getReactions(tabenv.reactMap, newHeaderFullAlias);
		reactions.forEach(function (reactionAliasStr) {
			var reactionAlias = aliasObjFromStr(reactionAliasStr);
			var tablo2 = tabenv.tablos.get(reactionAlias.tablo);
			var header2 = tablo2.getHeaderByAlias(reactionAlias.header);
			header2.args.forEach(function (arg, index) {
				if (arg.alias.tablo == oldAlias) arg.alias.tablo = newAlias;
			});
		});
		
		// 3. upd old tablo alias in reactions
		switch (header.type) {
			case DATA_HEADER: break;
			// reactions correspond to args of this header
			case FUNC_HEADER:
				header.args.forEach (function (arg) { switch(arg.type) {
					case NULL_ARG: break;
					case COL_SAMELINE_ARG:
						var argAliasStr = aliasObjToStr(arg.alias);
						delReaction(
							tabenv.reactMap, argAliasStr, oldHeaderFullAlias
						);
						newReaction(
							tabenv.reactMap, argAliasStr, newHeaderFullAlias
						);
						break;
					default: console.log("unknown arg type");
				}});
				break;
			default: console.log("unknown header type");				
		}
	});
	
	// update the tablo
	tablo.alias = newAlias;
	tabenv.tablos.delete(oldAlias);
	tabenv.tablos.set(newAlias, tablo);
	
	return res;
}

// upd the label of a tablo
function updTabloLabel (tablo, label) {
	var res = newRes();
	checkTabloLabel(label, res);
	if (res.success) {
		tablo.label = label;
	}
	return res;
}

// upd the displayNumLines of a tablo
function updTabloDisplayNumLines (tablo, displayNumLines) {
	var res = newRes();
	checkTabloDisplayNumLines(displayNumLines, res);
	if (res.success) {
		tablo.displayNumLines = displayNumLines;
	}
	return res;
}

function updHeaderAlias (tabenv, tablo, header, newAlias) {
	var oldAlias = header.alias;

	var res = newRes();
	checkUpdHeaderAlias(tablo, oldAlias, newAlias, res);
	if (! res.success) return res;
	
	// the header himself
	header.alias = newAlias;
	
	var oldHeaderFullAlias = aliasesToStr(tablo.alias, oldAlias);
	var newHeaderFullAlias = aliasesToStr(tablo.alias, newAlias);
		
	// 1. upd old tablo alias in reactKey
	
	// update reactKey
	updReactKey(tabenv.reactMap, oldHeaderFullAlias, newHeaderFullAlias);
		
	// 2. upd old tablo alias in Args pointing to this header
	var reactions = getReactions(tabenv.reactMap, newHeaderFullAlias);
	reactions.forEach(function (reaction) {
		var reactionAlias = aliasObjFromStr(reaction);
		var tablo2 = tabenv.tablos.get(reactionAlias.tablo);
		var header2 = tablo2.getHeaderByAlias(reactionAlias.header);
		header2.args.forEach(function (arg, index) {
			if (arg.alias.tablo == tablo.alias &&
				arg.alias.header == oldAlias
			){
				arg.alias.header = newAlias;
			}
		});
	});
		
	// 3. upd old tablo alias in reactions (args of this header)
	switch (header.type) {
		case DATA_HEADER: break;
		case FUNC_HEADER:
			header.args.forEach (function (arg) { switch(arg.type) {
				case NULL_ARG: break;
				case COL_SAMELINE_ARG:
					var argAliasStr = aliasObjToStr(arg.alias);
					delReaction(
						tabenv.reactMap, argAliasStr, oldHeaderFullAlias
					);
					newReaction(
						tabenv.reactMap, argAliasStr, newHeaderFullAlias
					);
					break;
				default: console.log("unknown arg type");
			}});
			break;
		default: console.log("unknown header type");				
	}
	
	return res;
}

function updHeaderLabel (header, label) {
	var res = newRes();
	checkHeaderLabel (label, res);
	if (res.success) header.label = label;
	return res;
}

function updHeaderType (tabenv, tablo, header, newType) {
	var res = newRes();
	checkHeaderType(newType, res); 
	if (! res.success) return res;
	
	switch (newType) {
		case DATA_HEADER:
			switch (header.type) {
				case DATA_HEADER: break;
				case FUNC_HEADER: 
					res.combine(delAllArgsFromHeader(tabenv, tablo, header));
					if (res.success) {
						header.type = DATA_HEADER;
						header.args = undefined;
						header.func = undefined;
					}
					break;
				default: console.log("unknown header type");
			}
			break;
		case FUNC_HEADER:
			switch (header.type) {
				case DATA_HEADER:
					header.type = FUNC_HEADER;
					header.args = [];
					header.func = function () { return null; };
					res.combine(updFuncHeaderAllCells(tabenv, tablo, header));
					break;
				case FUNC_HEADER: break;
				default: console.log("unknown header type");
			}
			break;
		default: console.log("unknown header type");
	}
	
	if (! res.success) res.addError("updHeaderType().");
	return res;
}

function updHeaderOrder (tabenv, tablo, header, newOrder) {
	var res = newRes();
	checkHeaderOrder(tablo, newOrder, res);
	if (! res.success) return res;
	
	var oldOrder = header.order;
	
	// move the headers
	arrayMove (tablo.headers, oldOrder, newOrder);
	
	// recompute the orders
	for (var i = 0; i < tablo.headers.length; i ++) {
		tablo.headers[i].order = i ; 
	}
	
	// move the data
	for (var numLine = 0 ; numLine < tablo.data.length ; numLine ++) {
		arrayMove (tablo.data[numLine], oldOrder, newOrder) ;
	}
	
	return res;
}

function updHeaderArgs (tabenv, tablo, header, newArgs) {
	var res = newRes();
	if (header.type != FUNC_HEADER) {
		res.addError("header is not func type so has no args to update");
	}
	else checkHeaderArgs(tabenv.tablos, newArgs, res);
	if (! res.success) return res;

	var fullAlias = aliasesToStr(tablo.alias, header.alias);
	
	// it is simpler to delete all args then add new args
	
	res.combine(delAllArgsFromHeader (tabenv, tablo, header));
	if (! res.success) return res;
	
	newArgs.forEach(function (newArg) {
		res.combine(newHeaderArg (tabenv, tablo, header, newArg));
	});
	
	if (! res.success) res.addError("updHeaderArgs(" + header.alias + ").");
	return res;
}

function updHeaderFunc (tabenv, tablo, header, newFunc) {
	var res = newRes();
	checkHeaderFunc(newFunc, res);
	if (! res.success) return res;
	
	header.func = newFunc ;
	res.combine(updFuncHeaderAllCells(tabenv, tablo, header));
	
	return res;
}


function updFuncHeaderAllCells (tabenv, tablo, header) {
	var res = newRes();
	if (tablo.getHeaderByAlias(header.alias) === undefined) {
		res.addError("Cannot find header in the tablo.");
	}
	else if (header.type != FUNC_HEADER) {
		res.addError("Header type must be Function to upd func cells");
	}
	if (! res.success) return res;
	
	for (var i = 0 ; i < tablo.data.length ; i ++) {
		res.combine(updFuncCell(tabenv, tablo, header, i));
	} 
	
	return res;
}

function updTabloAllFuncHeadersAllCells (tabenv, tablo) {
	var res = newRes();
	tablo.headers.forEach(function (header) {
		if (header.type == FUNC_HEADER) {
			res.combine(updFuncHeaderAllCells(tabenv, tablo, header));
		}
	});
	return res;
}

function updLineAllFuncCells (tabenv, tablo, numLine) {
	var res = newRes();
	if (numLine < 0 || numLine >= tablo.data.length) {
		res.addError("numLine is out of bounds.");
		return res;
	}
	tablo.headers.forEach(function (header) {
		if (header.type == FUNC_HEADER) {
			res.combine(updFuncCell(tabenv, tablo, header, numLine));
		}
	});
	return res;
}

// no checks done here, it is assumed there are done by the caller
function updFuncCell (tabenv, tablo, header, numLine) {
	var res = newRes();

	// compute the args for the cell
	var funcArgs = new Array(header.args.length);
	funcArgs.fill(null);
	header.args.forEach(function (headerArg, index) {
		switch (headerArg.type) {
			case NULL_ARG: break;
			case COL_SAMELINE_ARG:
				res.combine(getCellByAliases (
					tabenv, 
					headerArg.alias.tablo, headerArg.alias.header, 
					numLine
				));
				if (res.success) funcArgs[index] = res.value;
				break;
			default: console.log("unknown arg type");
		}
	});
	
	// compute the func applied to the args, for the cell
	try {
		var funcResult = header.func.apply(null, funcArgs);
		tablo.data[numLine][header.order] = funcResult;
	}
	catch (error) {
		res.addError(
			"Error while computing cell " + tablo.alias + "[" +
			header.alias + "][" + numLine + "] : " + error.toString() + "."
		);
	}
	
	// trigger the reactions of other cells because of the update of this one
	var fullHeaderAlias = aliasesToStr(tablo.alias, header.alias);
	var reactions = getReactions(tabenv.reactMap, fullHeaderAlias);
	reactions.forEach(function (reaction) {
		var reactionAlias = aliasObjFromStr(reaction);
		var reactionTablo = tabenv.tablos.get(reactionAlias.tablo);
		if (reactionTablo === undefined) {
			res.addError("cannot find tablo " + reactionAlias.tablo);
			return;
		}
		var reactionHeader = 
			reactionTablo.getHeaderByAlias(reactionAlias.header);
		if (reactionHeader === undefined) {
			res.addError("cannot find header " + reaction);
			return;
		}
		res.combine(
			updFuncCell(tabenv, reactionTablo, reactionHeader, numLine));
	});
	
	if (! res.success) { 
		res.addError(
			"updFuncCell(" + tablo.alias + ", " + header.alias +
			", " + numLine + ")."
		);
	}
		
	return res;
}

// no checks done here. assumed done by the caller
function updDataCell (tabenv, tablo, header, numLine, newVal) {
	tablo.data[numLine][header.order] = newVal;
	
	var res = newRes();
	
	// trigger the reactions of other cells because of the update of this one
	var fullHeaderAlias = aliasesToStr(tablo.alias, header.alias);
	var reactions = getReactions(tabenv.reactMap, fullHeaderAlias);
	reactions.forEach(function (reaction) {
		var reactionAlias = aliasObjFromStr(reaction);
		var reactionTablo = tabenv.tablos.get(reactionAlias.tablo);
		if (reactionTablo === undefined) {
			res.addError("cannot find tablo " + reactionAlias.tablo);
			return;
		}
		var reactionHeader = 
			reactionTablo.getHeaderByAlias(reactionAlias.header);
		if (reactionHeader === undefined) {
			res.addError("cannot find header " + reaction);
			return;
		}
		res.combine(
			updFuncCell(tabenv, reactionTablo, reactionHeader, numLine));
	});
	
	if (! res.success) { 
		res.addError(
			"updFuncCell(" + tablo.alias + ", " + header.alias +
			", " + numLine + ")."
		);
	}
	
	return res;
}


// ==================== DEL FUNCTIONS =======================

function delTablo (tabenv, tablo) {
	var res = newRes();
	if (! tabenv.tablos.has(tablo.alias)) {
		res.addError("Cannot find tablo in the tabenv : " + tablo.alias + ".");
		return res;
	}	
	
	// delete headers (this will delete reactions too)
	var loop = true;
	while (loop) {
		if (tablo.headers.length == 0) loop = false;
		else {
			res.combine(delHeader(tabenv, tablo, tablo.headers[0]));
			loop = res.success;
		}
	}
	
	tabenv.tablos.delete(tablo.alias)
	
	if (! res.success) res.addError("delTablo(" + tablo.alias + ").");
	return res;
}



function delHeader (tabenv, tablo, header) { 
	var res = newRes();
	if (! tablo.getHeaderByAlias(header.alias)) {
		res.addError(
			"delHeader() : header " + header.alias + 
			" does not exist in tablo " + tablo.alias + "."
		);
		return res;
	}
	
	var headerFullAlias = aliasesToStr(tablo.alias, header.alias);

	
	// copy the reactions (because they will update during treatment)
	var reactions = Array.from(getReactions(tabenv.reactMap, headerFullAlias));
	
	// nullify the args pointing to this header
	reactions.forEach(function (reaction) {
		var reactionAlias = aliasObjFromStr(reaction);
		var reactionTablo = tabenv.tablos.get(reactionAlias.tablo);
		var reactionHeader = 
			reactionTablo.getHeaderByAlias(reactionAlias.header);
		var reactionArgs = reactionHeader.args.map(function (arg) {
			switch (arg.type) {
				case NULL_ARG: return arg;
				case COL_SAMELINE_ARG: 
					if (arg.alias.tablo == tablo.alias &&
						arg.alias.header == header.alias
					){
						return { type: NULL_ARG };
					}
					else return arg;
				default: 
					res.addError("unmanaged or unknown arg type");
					console.log("unmanaged or unknown arg type");
					return arg;
			}
		});
		// updHeaderArgs delete the reactions associated to nullified args.
		// That is why we iterate on a copy of the reactions,
		// to be sure to treat every reaction.
		res.combine(updHeaderArgs(
			tabenv, reactionTablo, reactionHeader, reactionArgs)
		);
	});

	// delete reactKey
	delReactKey(tabenv.reactMap, headerFullAlias);
	
	// delete reactions (if func header)
	if (header.type == FUNC_HEADER) {
		// this function takes care of deleting reactions 
		res.combine(delAllArgsFromHeader(tabenv, tablo, header));
	}
	
	// delete data
	for (var numLine = 0; numLine < tablo.data.length ; numLine ++) {
		tablo.data[numLine].splice(header.order, 1);
	}
	
	// delete header
	tablo.headers.splice(header.order, 1);
	
	// recompute the orders
	for (var i = 0; i < tablo.headers.length; i ++) {
		tablo.headers[i].order = i ; 
	}
	
	if (! res.success) res.addError("delHeader(" + header.alias + ").");
	return res;
}

// careful : does not update data
function delArgFromHeader (tabenv, tablo, header, indexArg) {
	var res = newRes();
	if (header.type != FUNC_HEADER) {
		res.addError(
			"delArgFromHeader() : Le header doit être de type Fonction " +
			"pour lui retirer un arg, et non de type " + header.type + "."
		);
	}
	else if (indexArg < 0 || indexArg >= header.args.length) {
		res.addError(
			"L'index " + indexArg + " à supprimer doit être compris entre "
			+ "0 et " + header.args.length + " pour ce header."
		);
	}
	if (! res.success) return res;
	
	var arg = header.args[indexArg];
	var headerFullAlias = aliasesToStr(tablo.alias, header.alias);
	
	// remove the arg
	header.args.splice(indexArg, 1);
	
	// delete the reaction associated to the arg
	switch (arg.type) {
		case NULL_ARG: break;
		case COL_SAMELINE_ARG:
			var argAliasStr = aliasObjToStr(arg.alias);
			// Careful ! we must not delete the reaction if
			// another arg point to the same alias
			var lastOne = header.args.every(function (otherArg) {
				var otherArgAliasStr = aliasObjToStr(otherArg.alias);
				return argAliasStr != otherArgAliasStr;
			});
			if (lastOne) {
				delReaction(tabenv.reactMap, argAliasStr, headerFullAlias);
			}
			break;
		default: console.log("unknown arg type");
	}
	
	return res;
}

// careful : does not update data
function delAllArgsFromHeader (tabenv, tablo, header) {
	var res = newRes();
	if (header.type != FUNC_HEADER) {
		res.addError(
			"delAllArgsFromHeader(): le header doit être de type Fonction " +
			"pour lui retirer un arg, et non de type " + header.type + "."
		);
		return res;
	}
	
	// looping deleting all args, each time the first one
	var loop = true;
	while (loop) {
		if (header.args.length == 0) loop = false;
		else {
			res.combine(delArgFromHeader(tabenv, tablo, header, 0));
			loop = res.success;
		}
	}
	
	return res;
}




