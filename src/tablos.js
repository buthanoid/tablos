"use strict";

export { 
	// constants
	DATA_HEADER,
	FUNC_HEADER,
	DATA_TYPE,
	DATA_TYPE_STR,
	TAB_HEADER_TYPES,
	NULL_ARG,
	COL_SAMELINE_ARG,
	TAB_ARG_TYPES,
	ERR,
	// utilities
	parseStrToFunction,
	aliasesToStr,
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
	newTablo, checkNewTablo,
	newDataHeader, checkNewDataHeader,
	newColSamelineArg,
	newFuncHeader,
	newLine,
	newHeaderArg,
	copyArg,
	// get functions
	getCell,
	getCellByAliases,
	// upd functions
	updTabloAlias, checkUpdTabloAlias,
	updTabloLabel, checkUpdTabloLabel,
	updTabloDisplayNumLines, checkUpdTabloDisplayNumLines,
	updHeaderAlias, checkUpdHeaderAlias,
	updHeaderLabel, checkUpdHeaderLabel,
	updHeaderType, checkUpdHeaderType,
	updHeaderOrder,
	updHeaderDataType, checkUpdHeaderDataType,
	updHeaderArgs, checkUpdHeaderArgs,
	updHeaderFunc, checkUpdHeaderFunc, 
	updLineAllFuncCells,
	updFuncHeaderAllCells, checkUpdFuncHeaderAllCells,
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

const DATA_TYPE = {
	INT: 0,
	FLOAT: 1,
	STRING: 2,
	JSON: 3
};

const DATA_TYPE_STR = [
	"Entier",
	"Décimal",
	"Texte",
	"JSON"
];

const NULL_ARG = -1 ;
const COL_SAMELINE_ARG = 0 ;
const TAB_ARG_TYPES = [ NULL_ARG, COL_SAMELINE_ARG ];

const ERR = {
	REACT_MAP: { 
		NOT_REACT_MAP: "ERR.REACT_MAP.NOT_REACT_MAP"
	},
	TABENV: { 
		NOT_TABENV: "ERR.TABENV.NOT_TABENV"
	},
	TABLO: {
		ALIAS: {
			EMPTY: "ERR.TABLO.ALIAS.EMPTY",
			NOT_STRING: "ERR.TABLO.ALIAS.NOT_STRING",
			EXISTING: "ERR.TABLO.ALIAS.EXISTING"
		},
		LABEL: {
			NOT_STRING: "ERR.TABLO.LABEL.NOT_STRING",
			EMPTY: "ERR.TABLO.LABEL.EMPTY"
		}
	},
	HEADER: {
		ALIAS: {
			EMPTY: "ERR.HEADER.ALIAS.EMPTY",
			NOT_STRING: "ERR.HEADER.ALIAS.NOT_STRING",
			EXISTING: "ERR.HEADER.ALIAS.EXISTING"
		},
		LABEL: {
			NOT_STRING: "ERR.HEADER.LABEL.NOT_STRING",
			EMPTY: "ERR.HEADER.LABEL.EMPTY"
		},
		TYPE: {
			UNKNOWN: "ERR.HEADER.TYPE.UNKNOWN"
		},
		DATA_TYPE: {
			UNKNOWN: "ERR.HEADER.DATA_TYPE.UNKNOWN"
		},
		FUNCTION: {
			NOT_FUNCTION: "ERR.HEADER.FUNCTION.NOT_FUNCTION",
			PARSE_ERROR: "ERR.HEADER.FUNCTION.PARSE_ERROR",
			APP_ERROR: "ERR.HEADER.FUNCTION.APP_ERROR"
		},
		ARGS: {
			NOT_ARRAY: "ERR.HEADER.ARGS.NOT_ARRAY"
		},
		ARG: {
			COL_SAME_LINE: {
				NOT_COL_SAME_LINE:
					"ERR.HEADER.ARG.COL_SAME_LINE.NOT_COL_SAME_LINE",
				NON_EXISTING_TABLO_ALIAS: 
					"ERR.HEADER.ARG.COL_SAME_LINE.NON_EXISTING_TABLO_ALIAS",
				NON_EXISTING_HEADER_ALIAS: 
					"ERR.HEADER.ARG.COL_SAME_LINE.NON_EXISTING_HEADER_ALIAS"
			}
		}
	}
};

// ================= UTILITIES =======================

function parseStrToFunction (strFunc) {
	try {
		var parsedFunc = new Function(
			"\"use strict\"; return (" + strFunc + ");"
		) ();
		
		if (typeof parsedFunc == "function") return parsedFunc;
		else throw (ERR.HEADER.FUNCTION.NOT_FUNCTION);
	}
	catch (error) { throw (ERR.HEADER.FUNCTION.PARSE_ERROR) };
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

// ==================== REACTS FUNCTIONS =======================

// checks that arg is a reactMap 
// (it just checks that it is a Map, actually
//  there is no checks on keys or values)
function checkIsReactMap (reactMap) {
	if (Object.getPrototypeOf(reactMap) === Map.prototype) return [];
	else return [ ERR.REACT_MAP.NOT_REACT_MAP ];
}

// a ReactMap is a Map, from Alias string, to Alias string set
// exemple { "tablo1.header1" -> { "tablo2.header2", "tablo2.header3" }}
function newReactMap () { return new Map() }

function newReactKey (reactMap, reactKey) { 
	reactMap.set(reactKey, new Set());
}

// a reaction is an element of the set of a reactKey
function newReaction (reactMap, reactKey, reaction) {
	if (hasReactKey(reactMap, reactKey)) {
		reactMap.get(reactKey).add(reaction);
	}
	//else res.addError("Could not find reactKey " + reactKey + " in reactMap.");
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

// check that a value is a tabenv 
function checkIsTabenv (tabenv) {
	if (
		tabenv.hasOwnProperty("tablos") &&
		tabenv.hasOwnProperty("reactMap") &&
		Object.getPrototypeOf(tabenv.tablos) === Map.prototype &&
		checkIsReactMap(tabenv.reactMap)
	){ 
		return [] 
	} 
	else return [ ERR.TABENV.NOT_TABENV ] ; 
}

// create a new TabloEnvironment
function newTabenv () {
	return {
		tablos: new Map(),
		reactMap: newReactMap()
	}
}

// checks the alias for a tablo
function checkTabloAlias (alias) {
	if (typeof alias != "string") return [ ERR.TABLO.ALIAS.NOT_STRING ];
	else if (alias.length == 0) return [ ERR.TABLO.ALIAS.EMPTY ];
	// TODO : check that only latin small letter, and digits but not first
	else return [];
}

// checks the label for a tablo
function checkTabloLabel (label) {
	if (typeof label != "string") return [ ERR.TABLO.LABEL.NOT_STRING ];
	else if (label.length == 0) return [ ERR.TABLO.LABEL.EMPTY ];
	else return [];
}

// check args for newTablo()
// tabenv is not checked
function checkNewTablo (tabenv, alias, label) {
	var errsAlias = checkTabloAlias(alias) ;
	if (tabenv.tablos.has(alias)) {
		errsAlias.push(ERR.TABLO.ALIAS.EXISTING);
	}
	var errsLabel = checkTabloLabel(label);
	return errsAlias.concat(errsLabel);
}

// create a new tablo and add it to tabenv
function newTablo (tabenv, alias, label) {

		
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

	return tablo;
}

// check alias a of a new header
function checkHeaderAlias (alias) {
	if (typeof alias != "string") return [ ERR.HEADER.ALIAS.NOT_STRING ];
	else if (alias.length == 0) return [ ERR.HEADER.ALIAS.EMPTY ];
	// TODO : check that only latin small letter, and digits but not first
	else return [];
}

// checks the label of a header
function checkHeaderLabel (label) {
	if (typeof label != "string") return [ ERR.HEADER.LABEL.NOT_STRING ];
	else if (label.length == 0) return [ ERR.HEADER.LABEL.EMPTY ];
	else return [];
}

// checks the type of a header
function checkHeaderType (type) {
	if (! TAB_HEADER_TYPES.includes(type)) return [ ERR.HEADER.TYPE.UNKNOWN ];
	else return [];
}

// check args for newHeader()
// tabenv and tablo are not checked
function checkNewHeader (tabenv, tablo, alias, label, type) {
	var errsAlias = checkHeaderAlias(alias);
	if (tablo.getHeaderByAlias(alias) != undefined) {
		errsAlias.push(ERR.HEADER.ALIAS.EXISTING);
	}
	var errsLabel = checkHeaderLabel(label);
	var errsType = checkHeaderType(type);
	return errsAlias.concat(errsLabel, errsType);
}

// create a new header and add it to a tablo
function newHeader (tabenv, tablo, alias, label, type) {

	var header = {
		alias: alias,
		label: label,
		type: type,
		order: tablo.headers.length
	};
	
	tablo.headers.push(header);
	newReactKey(tabenv.reactMap, aliasesToStr(tablo.alias, header.alias));
	
	return header;
}

function checkHeaderDataType (dataType) {
	if (! Object.values(DATA_TYPE).includes(dataType)) {
		return [ ERR.HEADER.DATA_TYPE.UNKNOWN ];
	}
	else return [];
}

// check args for checkNewDataHeader()
// tabenv and tablo are not checked
function checkNewDataHeader (tabenv, tablo, alias, label, dataType) {
	var errsNewHeader = checkNewHeader(
		tabenv, tablo, alias, label, DATA_HEADER);
	var errsDataType = checkHeaderDataType(dataType);
	return errsNewHeader.concat(errsDataType);
}

// create a new data header and add it to tablo
function newDataHeader (tabenv, tablo, alias, label, dataType) {
	var header = newHeader(tabenv, tablo, alias, label, DATA_HEADER);
	header.dataType = dataType;
	return header;
} 

// check args for newColSamelineArg()
function checkNewColSamelineArg (tabenv, tabloAlias, headerAlias) {
	var tablo = tabenv.tablos.get(tabloAlias);
	if (tablo == undefined) {
		return [ ERR.HEADER.ARG.COL_SAME_LINE.NON_EXISTING_TABLO_ALIAS ];
	}
	var header = tablo.getHeaderByAlias(headerAlias);
	if (header == undefined) {
		return [ ERR.HEADER.ARG.COL_SAME_LINE.NON_EXISTING_HEADER_ALIAS ];
	}
	else return [];
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

// check arg of a func header
function checkHeaderArg (tabenv, arg) { switch (arg.type) {
	case NULL_ARG: return [];
	case COL_SAMELINE_ARG:
		if (arg.hasOwnProperty("alias") &&
			arg.alias.hasOwnProperty("tablo") &&
			arg.alias.hasOwnProperty("header")
		){
			return checkNewColSamelineArg(
				tabenv, arg.alias.tablo, arg.alias.header);
		}
		else return [ ERR.HEADER.ARG.COL_SAME_LINE.NOT_COL_SAME_LINE ];
	default: return [ ERR.HEADER.ARG.UNKNOWN_TYPE ];
}}

// check all args of a func header
// tabenv is not checked
function checkHeaderArgs (tabenv, args) {
	if (Object.getPrototypeOf(args) != Array.prototype) {
		return [ ERR.HEADER.ARGS.NOT_ARRAY ];
	}
	else {
		var errs = [];
		args.forEach(function (arg) {
			errs.concat(checkHeaderArg(tabenv, arg));
		});
		return errs;
	}
}

// check the func of a func header
function checkHeaderFunc (func) {
	if (typeof func != "function") {
		return [ ERR.HEADER.FUNCTION.NOT_FUNCTION ];
	}
	else return [];
}

// check args for newFuncHeader()
// tabenv and tablo are not checked
function checkNewFuncHeader (tabenv, tablo, alias, label, args, func) {
	var errsNewHeader = checkNewHeader(
		tabenv, tablo, alias, label, FUNC_HEADER);
	var errsArgs = checkHeaderArgs (tabenv, args);
	var errsFunc = checkHeaderFunc (func) ;
	// TODO: check updFuncHeaderAllCells
	return errsNewHeader.concat(errsArgs, errsFunc);
}

// create a new func header and add it to tablo
function newFuncHeader (tabenv, tablo, alias, label, args, func) {

	var header = newHeader(tabenv, tablo, alias, label, FUNC_HEADER);
	
	header.args = args;
	header.func = func;

	// add reactions
	var fullHeaderAlias = aliasesToStr(tablo.alias, alias); 
	args.forEach(function (arg) {
		switch (arg.type) {
			case NULL_ARG: break;
			case COL_SAMELINE_ARG: 
				var argAlias = aliasObjToStr(arg.alias);
				newReaction(
					tabenv.reactMap, argAlias, fullHeaderAlias
				);
				break;
			default: console.log("unknown arg type");
		}
	});

	updFuncHeaderAllCells (tabenv, tablo, header);

	return header;
}

// TODO: check updLineAllFuncCells
// create a new line for a tablo
function newLine (tabenv, tablo) {	
	var line = new Array(tablo.headers.length);
	line.fill(null);
	tablo.data.push(line);
	updLineAllFuncCells(tabenv, tablo, tablo.data.length - 1);
}

// check args of newHeaderArg()
// tabenv and tablo and header are not checked
function checkNewHeaderArg (tabenv, tablo, header, newArg) {
	if (header.type != FUNC_HEADER) return [ ERR.HEADER.NOT_FUNC_HEADER ];
	else return checkHeaderArg (tabenv, arg);
	// TODO: check updFuncHeaderAllCells
}

// add a new arg to a header 
function newHeaderArg (tabenv, tablo, header, newArg) {

	// add arg to tab arg
	header.args.push(newArg);
	
	// add reaction
	switch (newArg.type) {
		case NULL_ARG: break;
		case COL_SAMELINE_ARG: 
			var argAliasStr = aliasObjToStr(newArg.alias);
			var fullHeaderAlias = aliasesToStr(tablo.alias, header.alias);
			newReaction(
				tabenv.reactMap, argAliasStr, fullHeaderAlias
			);
			break;
		default: throw ERR.HEADER.ARG.UNKNOWN_TYPE;
	}
	
	updFuncHeaderAllCells (tabenv, tablo, header);
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
		default: throw ERR.HEADER.ARG.UNKNOWN_TYPE;
	}
}


// ==================== GET FUNCTIONS =======================

// get cell without checks 
function getCell (tablo, header, numLine) {
	return tablo.data[numLine][header.order];
}


// check getCellByAliases()
function checkGetCellByAliases (tabenv, tabloAlias, headerAlias, numLine) {
	var tablo = tabenv.tablos.get(tabloAlias);
	if (tablo === undefined) return [ ERR.TABLO.NOT_FOUND ];
	
	var header = tablo.getHeaderByAlias(headerAlias);
	if (header === undefined) return [ ERR.HEADER.NOT_FOUND ];
	
	if (numLine < 0 || numLine >= tablo.data.length) {
		return [ ERR.TABLO.LINE.OUT_OF_BOUNDS ];
	}
}

// get cell value by aliases and do checks
function getCellByAliases (tabenv, tabloAlias, headerAlias, numLine) {
	var tablo = tabenv.tablos.get(tabloAlias);
	var header = tablo.getHeaderByAlias(headerAlias);
	return getCell(tablo, header, numLine);
}


// ==================== UPD FUNCTIONS =======================


// check args of updTabloAlias()
// tabenv and tablo are not checked 
function checkUpdTabloAlias (tabenv, tablo, newAlias) {
	if (tablo.alias == newAlias) return [];
	else {
		var errsAlias = checkTabloAlias(newAlias) ;
		if (tabenv.tablos.has(newAlias)) {
			errsAlias.push(ERR.TABLO.ALIAS.EXISTING);
		}
		return errsAlias;
	}
}

function updTabloAlias (tabenv, tablo, newAlias) {

	var oldAlias = tablo.alias;
	
	if (oldAlias == newAlias) return;
	
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
}


// check args of updTabloLabel()
// tablo is not checked
function checkUpdTabloLabel (tablo, label) {
	return checkTabloLabel(label) ;
}

// upd the label of a tablo
function updTabloLabel (tablo, label) {
	tablo.label = label;
}

function checkTabloDisplayNumLines (displayNumLines) {
	if (typeof displayNumLines != "boolean") {
		return [ ERR.TABLO.DISPLAY_NUM_LINES.NOT_BOOLEAN ];
	}
}

// check args for updTabloDisplayNumLines()
// tablo is not checked
function checkUpdTabloDisplayNumLines (tablo, displayNumLines) {
	return checkTabloDisplayNumLines(displayNumLines);
}

// upd the displayNumLines of a tablo
function updTabloDisplayNumLines (tablo, displayNumLines) {
	tablo.displayNumLines = displayNumLines;
}

// check args for updHeaderAlias()
// tabenv, tablo and header are not checked
function checkUpdHeaderAlias (tabenv, tablo, header, newAlias) {
	if (header.alias == newAlias) return [];
	else {
		var errsAlias = checkHeaderAlias(newAlias);
		if (tablo.getHeaderByAlias(newAlias) != undefined) {
			errsAlias.push(ERR.HEADER.ALIAS.EXISTING);
		}
		return errsAlias;
	}
}

function updHeaderAlias (tabenv, tablo, header, newAlias) {
	var oldAlias = header.alias;

	if (oldAlias == newAlias) return;
	
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
}

// check args of updHeaderLabel()
// header is not checked
function checkUpdHeaderLabel (header, label) {
	return checkHeaderLabel(label);
}

function updHeaderLabel (header, label) {
	header.label = label;
}


// check args for updHeaderType()
// tabenv, tablo, header are not checked
function checkUpdHeaderType (tabenv, tablo, header, newType) {
	return checkHeaderType(newType)
	// TODO: check updFuncHeaderAllCells
}

function updHeaderType (tabenv, tablo, header, newType) {

	switch (newType) {
		case DATA_HEADER:
			switch (header.type) {
				case DATA_HEADER: break;
				case FUNC_HEADER: 
					delAllArgsFromHeader(tabenv, tablo, header);
					header.type = DATA_HEADER;
					header.dataType = DATA_TYPE.INT;
					header.args = undefined;
					header.func = undefined;
					break;
				default: throw ERR.HEADER.UNKNOWN_TYPE;
			}
			break;
		case FUNC_HEADER:
			switch (header.type) {
				case DATA_HEADER:
					header.type = FUNC_HEADER;
					header.dataType = undefined;
					header.args = [];
					header.func = function () { return null; };
					updFuncHeaderAllCells(tabenv, tablo, header);
					break;
				case FUNC_HEADER: break;
				default: throw ERR.HEADER.UNKNOWN_TYPE;
			}
			break;
		default: throw ERR.HEADER.UNKNOWN_TYPE;
	}
}

// checks the order of a header
function checkHeaderOrder (tablo, order) {
	if (order < 0 || order >= tablo.headers.length) {
		return ERR.HEADER.ORDER.OUT_OF_BOUNDS;
	}
}

// check args for updHeaderOrder()
// tabenv, tablo, and header are not checked
function checkUpdHeaderOrder (tabenv, tablo, header, newOrder) {
	return checkHeaderOrder (tablo, newOrder)
}

function updHeaderOrder (tabenv, tablo, header, newOrder) {
	
	var oldOrder = header.order;
	
	if (oldOrder == newOrder) return;
	
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
}

// check args for updHeaderDataType()
// tabenv, tablo, and header are not checked
function checkUpdHeaderDataType (tabenv, tablo, header, newDataType) {
	var errsDataType = checkHeaderDataType(newDataType);
	if (errsDataType.length > 0) return errsDataType;
	
	var errs = [];
	
	tablo.data.forEach(function (line, numLine) {
		try { 
			var oldVal = getCell(tablo, header, numLine);
			switch (newDataType) {
				case DATA_TYPE.INT:
					parseInt(oldVal);
					break;
				case DATA_TYPE.FLOAT:
					parseFloat(oldVal);
					break;
				case DATA_TYPE.STRING:
					new String(oldVal).valueOf();
					break;
				case DATA_TYPE.JSON:
					JSON.parse(oldVal);
					break;
				default: throw ERR.HEADER.DATA_TYPE.UNKNOWN;
			}
			// TODO: check updDataCell
		}
		catch (error){ 
			errs.push(ERR.HEADER.DATA_TYPE.CELL_PARSE_ERROR); 
		}
	});
	
	return errs;
}

function updHeaderDataType (tabenv, tablo, header, newDataType) {
	
	if (header.dataType == newDataType) return;
	
	header.dataType = newDataType;
	
	tablo.data.forEach(function (line, numLine) {
		var oldVal = getCell(tablo, header, numLine);
		var newVal ;
		switch (newDataType) {
			case DATA_TYPE.INT:
				newVal = parseInt(oldVal);
				break;
			case DATA_TYPE.FLOAT:
				newVal = parseFloat(oldVal);
				break;
			case DATA_TYPE.STRING:
				newVal = new String(oldVal).valueOf();
				break;
			case DATA_TYPE.JSON:
				newVal = JSON.parse(oldVal);
				break;
			default:
				res.addError("unknown data type " + newDataType);
		}
		updDataCell(tabenv, tablo, header, numLine, newVal);
	});
}

// check args for updHeaderArgs()
// tabenv, tablo, and header are not checked
function checkUpdHeaderArgs (tabenv, tablo, header, newArgs) {
	if (header.type != FUNC_HEADER) return [ ERR.HEADER.NOT_FUNC ];
	var errsArgs = checkHeaderArgs (tabenv, newArgs);
	// TODO check delAllArgsFromHeader
	return errsArgs
}

function updHeaderArgs (tabenv, tablo, header, newArgs) {

	var fullAlias = aliasesToStr(tablo.alias, header.alias);
	
	// it is simpler to delete all args then add new args
	
	delAllArgsFromHeader (tabenv, tablo, header);
	
	newArgs.forEach(function (newArg) {
		newHeaderArg (tabenv, tablo, header, newArg);
	});
}

// check args for updHeaderFunc()
// tabenv, tablo and header are not checked
function checkUpdHeaderFunc (tabenv, tablo, header, newFunc) {
	return checkHeaderFunc(newFunc);
	// TODO check updFuncHeaderAllCells
}

function updHeaderFunc (tabenv, tablo, header, newFunc) {
	header.func = newFunc ;
	updFuncHeaderAllCells(tabenv, tablo, header);
}

// check args for updFuncHeaderAllCells()
function checkUpdFuncHeaderAllCells (tabenv, tablo, header) {
	if (header.type != FUNC_HEADER) return [ ERR.HEADER.NOT_FUNC ];
	var errs = [];
	for (var i = 0 ; i < tablo.data.length ; i ++) {
		errs.concat(checkUpdFuncCell(tabenv, tablo, header, i));
	} 
	return errs;
}

function updFuncHeaderAllCells (tabenv, tablo, header) {
	for (var i = 0 ; i < tablo.data.length ; i ++) {
		updFuncCell(tabenv, tablo, header, i);
	} 
}

// check args for updTabloAllFuncHeadersAllCells()
function checkUpdTabloAllFuncHeadersAllCells (tabenv, tablo) {
	var errs = [];
	tablo.headers.forEach(function (header) {
		if (header.type == FUNC_HEADER) {
			errs.concat(checkUpdFuncHeaderAllCells(tabenv, tablo, header));
		}
	});
	return errs;
}

function updTabloAllFuncHeadersAllCells (tabenv, tablo) {
	tablo.headers.forEach(function (header) {
		if (header.type == FUNC_HEADER) {
			updFuncHeaderAllCells(tabenv, tablo, header);
		}
	});
}

// check args for updLineAllFuncCells()
function checkUpdLineAllFuncCells (tabenv, tablo, numLine) {
	if (numLine < 0 || numLine >= tablo.data.length) {
		return [ ERR.TABLO.LINE.OUT_OF_BOUNDS ] ;
	}
	var errs = [];
	tablo.headers.forEach(function (header) {
		if (header.type == FUNC_HEADER) {
			errs.concat(checkUpdFuncCell(tabenv, tablo, header, numLine));
		}
	});
	return errs;
}

function updLineAllFuncCells (tabenv, tablo, numLine) {
	tablo.headers.forEach(function (header) {
		if (header.type == FUNC_HEADER) {
			updFuncCell(tabenv, tablo, header, numLine);
		}
	});
}

// check updFuncCell()
function checkUpdFuncCell (tabenv, tablo, header, numLine) {

	if (numLine < 0 || numLine >= tablo.data.length) {
		return [ ERR.TABLO.LINE.OUT_OF_BOUNDS ] ;
	}

	try {

		// compute the args for the cell
		var funcArgs = new Array(header.args.length);

		funcArgs.fill(null);
		header.args.forEach(function (headerArg, index) {
			switch (headerArg.type) {
				case NULL_ARG: break;
				case COL_SAMELINE_ARG:
					var errs = checkGetCellByAliases (
						tabenv, 
						headerArg.alias.tablo, headerArg.alias.header, 
						numLine
					);
					if (errs.length > 0) throw errs;
					else {
						funcArgs[index] = getCellByAliases (
							tabenv, 
							headerArg.alias.tablo, headerArg.alias.header, 
							numLine
						);
					}
					break;
				default: throw [ ERR.HEADER.ARG.UNKNOWN_TYPE ];
			}
		});
		
		// compute the func applied to the args, for the cell
		try {
			var funcResult = header.func.apply(null, funcArgs);
		}
		catch (error) { throw [ ERR.HEADER.FUNCTION.APP_ERROR ] }
		
		// trigger the reactions of other cells
		var fullHeaderAlias = aliasesToStr(tablo.alias, header.alias);
		var reactions = getReactions(tabenv.reactMap, fullHeaderAlias);
		reactions.forEach(function (reaction) {
			var reactionAlias = aliasObjFromStr(reaction);
			var reactionTablo = tabenv.tablos.get(reactionAlias.tablo);
			var reactionHeader = 
				reactionTablo.getHeaderByAlias(reactionAlias.header);
			var errs = checkUpdFuncCell(
				tabenv, reactionTablo, reactionHeader, numLine);
			if (errs.length > 0) throw errs;
		});
	}
	catch (errors) { return errors; }
}

function updFuncCell (tabenv, tablo, header, numLine) {

	// compute the args for the cell
	var funcArgs = new Array(header.args.length);
	funcArgs.fill(null);
	header.args.forEach(function (headerArg, index) {
		switch (headerArg.type) {
			case NULL_ARG: break;
			case COL_SAMELINE_ARG:
				funcArgs[index] = getCellByAliases (
					tabenv, 
					headerArg.alias.tablo, headerArg.alias.header, 
					numLine
				);
				break;
			default: console.log("unknown arg type");
		}
	});
	
	// compute the func applied to the args, for the cell
	var funcResult = header.func.apply(null, funcArgs);
	tablo.data[numLine][header.order] = funcResult;
	
	// trigger the reactions of other cells because of the update of this one
	var fullHeaderAlias = aliasesToStr(tablo.alias, header.alias);
	var reactions = getReactions(tabenv.reactMap, fullHeaderAlias);
	reactions.forEach(function (reaction) {
		var reactionAlias = aliasObjFromStr(reaction);
		var reactionTablo = tabenv.tablos.get(reactionAlias.tablo);
		var reactionHeader = 
			reactionTablo.getHeaderByAlias(reactionAlias.header);
		updFuncCell(tabenv, reactionTablo, reactionHeader, numLine);
	});
}

// check updDataCell()
function checkUpdDataCell (tabenv, tablo, header, numLine, newVal) {
	
	if (numLine < 0 || numLine >= tablo.data.length) {
		return [ ERR.TABLO.LINE.OUT_OF_BOUNDS ] ;
	}
	
	// trigger the reactions of other cells because of the update of this one
	try {
		var fullHeaderAlias = aliasesToStr(tablo.alias, header.alias);
		var reactions = getReactions(tabenv.reactMap, fullHeaderAlias);
		reactions.forEach(function (reaction) {
			var reactionAlias = aliasObjFromStr(reaction);
			var reactionTablo = tabenv.tablos.get(reactionAlias.tablo);
			var reactionHeader = 
				reactionTablo.getHeaderByAlias(reactionAlias.header);
			var errs = checkUpdFuncCell(
				tabenv, reactionTablo, reactionHeader, numLine);
			if (errs.length > 0) throw errs;
		});
	}
	catch (errors) { return errors; }
}

function updDataCell (tabenv, tablo, header, numLine, newVal) {
	tablo.data[numLine][header.order] = newVal;
	
	// trigger the reactions of other cells because of the update of this one
	var fullHeaderAlias = aliasesToStr(tablo.alias, header.alias);
	var reactions = getReactions(tabenv.reactMap, fullHeaderAlias);
	reactions.forEach(function (reaction) {
		var reactionAlias = aliasObjFromStr(reaction);
		var reactionTablo = tabenv.tablos.get(reactionAlias.tablo);
		var reactionHeader = 
			reactionTablo.getHeaderByAlias(reactionAlias.header);
		updFuncCell(tabenv, reactionTablo, reactionHeader, numLine);
	});
}


// ==================== DEL FUNCTIONS =======================

function delTablo (tabenv, tablo) {
	
	// delete headers (this will delete reactions too)
	var loop = true;
	while (loop) {
		if (tablo.headers.length == 0) loop = false;
		else delHeader(tabenv, tablo, tablo.headers[0]);
	}
	
	tabenv.tablos.delete(tablo.alias);
}



function delHeader (tabenv, tablo, header) { 
	
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
				default: throw ERR.HEADER.ARG.TYPE.UNKNOWN ;
			}
		});
		// updHeaderArgs delete the reactions associated to nullified args.
		// That is why we iterate on a copy of the reactions,
		// to be sure to treat every reaction.
		updHeaderArgs(
			tabenv, reactionTablo, reactionHeader, reactionArgs);
	});

	// delete reactKey
	delReactKey(tabenv.reactMap, headerFullAlias);
	
	// delete reactions (if func header)
	if (header.type == FUNC_HEADER) {
		// this function takes care of deleting reactions 
		delAllArgsFromHeader(tabenv, tablo, header);
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
}

// careful : does not update data
function delArgFromHeader (tabenv, tablo, header, indexArg) {
	
	var arg = header.args[indexArg];
	
	// remove the arg
	header.args.splice(indexArg, 1);
	
	// delete an eventual reaction associated to the arg
	switch (arg.type) {
		case NULL_ARG: break;
		case COL_SAMELINE_ARG:
			// Careful ! we must not delete the reaction if
			// there was another arg pointing to the same alias
			var anotherSame = header.args.find(function (otherArg) {
				return (
					otherArg.type == COL_SAMELINE_ARG &&
					otherArg.alias.tablo == arg.alias.tablo &&
					otherArg.alias.header == arg.alias.header );
			});
			if (! anotherSame) {
				delReaction(
					tabenv.reactMap, 
					aliasesToStr(arg.alias.tablo, arg.alias.header), 
					aliasesToStr(tablo.alias, header.alias));
			}
			break;
		default: throw ERR.HEADER.ARG.TYPE.UNKNOWN;
	}
}

// careful : does not update data
function delAllArgsFromHeader (tabenv, tablo, header) {
	
	// looping deleting all args, each time the first one
	var loop = true;
	while (loop) {
		if (header.args.length == 0) loop = false;
		else delArgFromHeader(tabenv, tablo, header, 0);
	}
}




