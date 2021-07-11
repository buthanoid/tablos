"use strict";

export { 
	// constants
	HEADER,
	ERR,
	PROP,
	// utilities
	parseStrToFunction,
	aliasesToStr,
	newErr,
	// reactMap functions
	newReactMap,
	newReactKey,
	newReaction,
	hasReactKey,
	hasReaction,
	getReactions,
	getReactionsTree,
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
	newLine, checkNewLine,
	newHeaderArg,
	copyArg,
	// get functions
	getHeader,
	getCell,
	getCellByAliases,
	// upd functions
	updTabloAlias, checkUpdTabloAlias,
	updTabloLabel, checkUpdTabloLabel,
	updTabloDisplayNumLines, checkUpdTabloDisplayNumLines,
	updHeaderAlias, checkUpdHeaderAlias,
	updHeaderLabel, checkUpdHeaderLabel,
	updHeaderType, checkUpdHeaderType,
	updHeaderOrder, checkUpdHeaderOrder,
	updHeaderDataType, checkUpdHeaderDataType,
	updHeaderArgs, checkUpdHeaderArgs,
	updHeaderFunc, checkUpdHeaderFunc, 
	updLineAllFuncCells,
	updFuncHeaderAllCells, checkUpdFuncHeaderAllCells,
	updTabloAllFuncHeadersAllCells,
	updFuncCell,
	updDataCell,
	updCellReactions,
	// del functions
	delTablo,
	delHeader,
	delArgFromHeader,
	delAllArgsFromHeader
};


// ================ CONSTANTS =========================

const HEADER = {
	TYPE: {
		DATA: "HEADER.TYPE.DATA",
		FUNC: "HEADER.TYPE.FUNC"
	},
	ARG: {
		TYPE: {
			NULL: "HEADER.ARG.TYPE.NULL",
			COL_SAME_LINE: "HEADER.ARG.TYPE.COL_SAME_LINE"
		}
	},
	DATA_TYPE: {
		INT: "HEADER.DATA_TYPE.INT",
		FLOAT: "HEADER.DATA_TYPE.FLOAT",
		STRING: "HEADER.DATA_TYPE.STRING",
		JSON: "HEADER.DATA_TYPE.JSON"
	}
};

const ERR = {
	REACT_MAP: { 
		BAD_CONTENT: "ERR.REACT_MAP.BAD_CONTENT",
		KEY: {
			NOT_FOUND: "ERR.REACT_MAP.KEY.NOT_FOUND"
		}
	},
	TABENV: { 
		BAD_CONTENT: "ERR.TABENV.BAD_CONTENT"
	},
	TABLO: {
		ALIAS: {
			BAD_CONTENT: "ERR.TABLO.ALIAS.BAD_CONTENT",
			EMPTY: "ERR.TABLO.ALIAS.EMPTY",
			EXISTING: "ERR.TABLO.ALIAS.EXISTING",
			NOT_FOUND: "ERR.TABLO.ALIAS.NOT_FOUND"
		},
		LABEL: {
			BAD_CONTENT: "ERR.TABLO.LABEL.BAD_CONTENT",
			EMPTY: "ERR.TABLO.LABEL.EMPTY"
		}
	},
	HEADER: {
		ALIAS: {
			EMPTY: "ERR.HEADER.ALIAS.EMPTY",
			BAD_CONTENT: "ERR.HEADER.ALIAS.BAD_CONTENT",
			EXISTING: "ERR.HEADER.ALIAS.EXISTING",
			NOT_FOUND: "ERR.HEADER.ALIAS.NOT_FOUND"
		},
		LABEL: {
			BAD_CONTENT: "ERR.HEADER.LABEL.BAD_CONTENT",
			EMPTY: "ERR.HEADER.LABEL.EMPTY"
		},
		TYPE: {
			UNKNOWN: "ERR.HEADER.TYPE.UNKNOWN",
			NOT_FUNC: "ERR.HEADER.TYPE.NOT_FUNC"
		},
		DATA_TYPE: {
			UNKNOWN: "ERR.HEADER.DATA_TYPE.UNKNOWN"
		},
		FUNCTION: {
			BAD_CONTENT: "ERR.HEADER.FUNCTION.BAD_CONTENT",
			PARSE_ERROR: "ERR.HEADER.FUNCTION.PARSE_ERROR",
			APP_ERROR: "ERR.HEADER.FUNCTION.APP_ERROR"
		},
		ARGS: {
			BAD_CONTENT: "ERR.HEADER.ARGS.BAD_CONTENT"
		},
		ARG: {
			TYPE: {
				UNKNOWN: "ERR.HEADER.ARG.TYPE.UNKNOWN"
			},
			BAD_CONTENT: "ERR.HEADER.ARG.BAD_CONTENT",
			TABLO_ALIAS: {
				NON_EXISTING: "ERR.HEADER.ARG.TABLO_ALIAS.NON_EXISTING"
			},
			HEADER_ALIAS: {
				NON_EXISTING: "ERR.HEADER.ARG.HEADER_ALIAS.NON_EXISTING"
			}
		}
	},
	LINE: {
		OUT_OF_BOUNDS: "ERR.LINE.OUT_OF_BOUNDS"
	},
	PROP: {
		TABLO: {
			UNKNOWN: "ERR.PROP.TABLO.UNKNOWN"
		},
		HEADER: {
			UNKNOWN: "ERR.PROP.HEADER.UNKNOWN"
		}
	}
};

const PROP = {
	NULL: "PROP.NULL",
	TABLO: {
		ALIAS: "PROP.TABLO.ALIAS",
		LABEL: "PROP.TABLO.LABEL",
		DISPLAY_LINE_NUMBERS: "PROP.TABLO.DISPLAY_LINE_NUMBERS",
	},
	HEADER: {
		ALIAS: "PROP.HEADER.ALIAS",
		LABEL: "PROP.HEADER.LABEL",
		TYPE: "PROP.HEADER.TYPE",
		ORDER: "PROP.HEADER.ORDER",
		DATA_TYPE: "PROP.HEADER.DATA_TYPE",
		ARGS: "PROP.HEADER.ARGS",
		FUNC: "PROP.HEADER.FUNC"
	}
};

// ================= UTILITIES =======================

function parseStrToFunction (strFunc) {
	var parsedFunc ;
	try {
		parsedFunc = new Function(
			"\"use strict\"; return " + strFunc + ";"
		) ();
	}
	catch (error) { 
		var err = newErr(ERR.HEADER.FUNCTION.PARSE_ERROR, {
			func: strFunc, jsError: error });
		throw err;
	}
	
	if (typeof parsedFunc == "function") return parsedFunc;
	else {
		var err = newErr(ERR.HEADER.FUNCTION.BAD_CONTENT, {
			parsedFunc: parsedFunc });
		throw err;
	}
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

function newNode (data, childs) {
	return { data: data, childs: childs } ;
}

function treeForEachDeepFirst (node, fun) {
	fun(node.data);
	node.childs.forEach(function (child) {
		treeForEachDeepFirst (child, fun);
	});
}

function newErr (type, data) {
	return { type: type, data: data };
}

// ==================== REACTS FUNCTIONS =======================

// checks that arg is a reactMap 
// (it just checks that it is a Map, actually
//  there is no checks on keys or values)
function checkIsReactMap (reactMap) {
	if (Object.getPrototypeOf(reactMap) === Map.prototype) return [];
	else {
		var err = newErr(ERR.REACT_MAP.BAD_CONTENT, { reactMap: reactMap });
		return [ err ];
	}
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
	// TODO
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

// get the complete tree of reactions with reactKey as root
function getReactionsTree (reactMap, reactKey) {
	if (hasReactKey(reactMap, reactKey)) {
		var node = {
			data: reactKey,
			childs: new Array()
		};
		getReactions(reactMap, reactKey).forEach(function (childKey) {
			var childNode = getReactionsTree (reactMap, childKey);
			if (childNode != undefined) node.childs.push(childNode);
		});
		return node;
	}
	else return undefined;
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
	else {
		var err = newErr(ERR.TABENV.BAD_CONTENT, { tabenv: tabenv });
		return [ err ] ; 
	}
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
	if (typeof alias != "string") { 
		var err = newErr(ERR.TABLO.ALIAS.BAD_CONTENT, { alias: alias });
		return [ err ];
	}
	else if (alias.length == 0) {
		var err = newErr(ERR.TABLO.ALIAS.EMPTY, { alias: alias });
		return [ err ];
	}
	// TODO : check that only latin small letter, and digits but not first
	else return [];
}

// checks the label for a tablo
function checkTabloLabel (label) {
	if (typeof label != "string") {
		var err = newErr(ERR.TABLO.LABEL.BAD_CONTENT, { label: label });
		return [ err ];
	}
	else if (label.length == 0) {
		var err = newErr(ERR.TABLO.LABEL.EMPTY, { label: label });
		return [ err ];
	}
	else return [];
}

// check args for newTablo()
// tabenv is not checked
function checkNewTablo (tabenv, alias, label) {
	var errsAlias = checkTabloAlias(alias) ;
	if (tabenv.tablos.has(alias)) {
		var err = newErr(ERR.TABLO.ALIAS.EXISTING, { alias: alias });
		errsAlias.push(err);
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
	};
	
	tabenv.tablos.set(alias, tablo);

	return tablo;
}

// check alias a of a new header
function checkHeaderAlias (alias) {
	if (typeof alias != "string") {
		var err = newErr(ERR.HEADER.ALIAS.BAD_CONTENT, { alias: alias });
		return [ err ];
	}
	else if (alias.length == 0) {
		var err = newErr(ERR.HEADER.ALIAS.EMPTY, { alias: alias });
		return [ err ];
	}
	// TODO : check that only latin small letter, and digits but not first
	else return [];
}

// checks the label of a header
function checkHeaderLabel (label) {
	if (typeof label != "string") {
		var err = newErr(ERR.HEADER.LABEL.BAD_CONTENT, { label: label });
		return [ err ];
	}
	else if (label.length == 0) {
		var err = newErr(ERR.HEADER.LABEL.EMPTY, { label: label });
		return [ err ];
	}
	else return [];
}

// checks the type of a header
function checkHeaderType (type) {
	if (! Object.values(HEADER.TYPE).includes(type)) {
		var err = newErr(ERR.HEADER.TYPE.UNKNOWN, { type: type });
		return [ err ];
	}
	else return [];
}

// check args for newHeader()
// tabenv and tablo are not checked
function checkNewHeader (tabenv, tablo, alias, label, type) {
	var errsAlias = checkHeaderAlias(alias);
	if (getHeader(tablo, alias) != undefined) {
		var err = newErr(ERR.HEADER.ALIAS.EXISTING, {
			tabloAlias: tablo.alias, headerAlias: alias
		});
		errsAlias.push(err);
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
	if (! Object.values(HEADER.DATA_TYPE).includes(dataType)) {
		var err = newErr(ERR.HEADER.DATA_TYPE.UNKNOWN, { dataType: dataType });
		return [ err ];
	}
	else return [];
}

// check args for checkNewDataHeader()
// tabenv and tablo are not checked
function checkNewDataHeader (tabenv, tablo, alias, label, dataType) {
	var errsNewHeader = checkNewHeader(
		tabenv, tablo, alias, label, HEADER.TYPE.DATA);
	var errsDataType = checkHeaderDataType(dataType);
	return errsNewHeader.concat(errsDataType);
}

// create a new data header and add it to tablo
function newDataHeader (tabenv, tablo, alias, label, dataType) {
	var header = newHeader(tabenv, tablo, alias, label, HEADER.TYPE.DATA);
	header.dataType = dataType;
	return header;
} 

// check args for newColSamelineArg()
function checkNewColSamelineArg (tabenv, tabloAlias, headerAlias) {
	var tablo = tabenv.tablos.get(tabloAlias);
	if (tablo == undefined) {
		var err = newErr(ERR.HEADER.ARG.TABLO_ALIAS.NON_EXISTING, {
			tabloAlias: tabloAlias
		});
		return [ err ];
	}
	var header = getHeader(tablo, headerAlias);
	if (header == undefined) {
		var err = newErr(ERR.HEADER.ARG.HEADER_ALIAS.NON_EXISTING, {
			tabloAlias: tabloAlias, headerAlias: headerAlias
		});
		return [ err ];
	}
	else return [];
}

// create a new arg with type HEADER.ARG.TYPE.COL_SAME_LINE
function newColSamelineArg(tabloAlias, headerAlias) {
	return {
		type: HEADER.ARG.TYPE.COL_SAME_LINE,
		alias: {
			tablo: tabloAlias,
			header: headerAlias
		}
	};
}

// check arg of a func header
function checkHeaderArg (tabenv, arg) { switch (arg.type) {
	case HEADER.ARG.TYPE.NULL: return [];
	case HEADER.ARG.TYPE.COL_SAME_LINE:
		if (arg.hasOwnProperty("alias") &&
			arg.alias.hasOwnProperty("tablo") &&
			arg.alias.hasOwnProperty("header")
		){
			return checkNewColSamelineArg(
				tabenv, arg.alias.tablo, arg.alias.header);
		}
		else {
			var err = newErr(ERR.HEADER.ARG.BAD_CONTENT, { arg: arg });
			return [ err ];
		}
	default: 
		var err = newErr(ERR.HEADER.ARG.TYPE.UNKNOWN, { type: arg.type });
		return [ err ];
}}

// check all args of a func header
// tabenv is not checked
function checkHeaderArgs (tabenv, args) {
	if (Object.getPrototypeOf(args) != Array.prototype) {
		var err = newErr(ERR.HEADER.ARGS.BAD_CONTENT, { args: args });
		return [ err ];
	}
	else {
		var errs = [];
		args.forEach(function (arg) {
			errs = errs.concat(checkHeaderArg(tabenv, arg));
		});
		return errs;
	}
}

// check the func of a func header
function checkHeaderFunc (func) {
	if (typeof func != "function") {
		var err = newErr(ERR.HEADER.FUNCTION.BAD_CONTENT, { func: func });
		return [ err ];
	}
	else return [];
}

// check args for newFuncHeader()
// tabenv and tablo are not checked
function checkNewFuncHeader (tabenv, tablo, alias, label, args, func) {
	var errsNewHeader = checkNewHeader(
		tabenv, tablo, alias, label, HEADER.TYPE.FUNC);
	var errsArgs = checkHeaderArgs (tabenv, args);
	var errsFunc = checkHeaderFunc (func) ;
	// TODO: check updFuncHeaderAllCells
	return errsNewHeader.concat(errsArgs, errsFunc);
}

// create a new func header and add it to tablo
function newFuncHeader (tabenv, tablo, alias, label, args, func) {

	var header = newHeader(tabenv, tablo, alias, label, HEADER.TYPE.FUNC);
	
	header.args = args;
	header.func = func;

	// add reactions
	var fullHeaderAlias = aliasesToStr(tablo.alias, alias); 
	args.forEach(function (arg) {
		switch (arg.type) {
			case HEADER.ARG.TYPE.NULL: break;
			case HEADER.ARG.TYPE.COL_SAME_LINE: 
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

function checkNewLine (tabenv, tablo) {
	// we cannot really check something
	return [] ;
}

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
	if (header.type != HEADER.TYPE.FUNC) {
		var err = newErr(ERR.HEADER.TYPE.NOT_FUNC, { headerType: header.type });
		return [ err ];
	}
	else return checkHeaderArg (tabenv, arg);
	// TODO: check updFuncHeaderAllCells
}

// add a new arg to a header 
function newHeaderArg (tabenv, tablo, header, newArg) {

	// add arg to tab arg
	header.args.push(newArg);
	
	// add reaction
	switch (newArg.type) {
		case HEADER.ARG.TYPE.NULL: break;
		case HEADER.ARG.TYPE.COL_SAME_LINE: 
			var argAliasStr = aliasObjToStr(newArg.alias);
			var fullHeaderAlias = aliasesToStr(tablo.alias, header.alias);
			newReaction(
				tabenv.reactMap, argAliasStr, fullHeaderAlias
			);
			break;
		default: throw newErr(
			ERR.HEADER.ARG.UNKNOWN_TYPE, { type: newArg.type });
	}
	
	updFuncHeaderAllCells (tabenv, tablo, header);
}

// return a strict copy of the header arg
function copyArg (arg) {
	switch (arg.type) {
		case HEADER.ARG.TYPE.NULL: return { type: HEADER.ARG.TYPE.NULL };
		case HEADER.ARG.TYPE.COL_SAME_LINE: 
			return {
				type: HEADER.ARG.TYPE.COL_SAME_LINE,
				alias: {
					tablo: arg.alias.tablo,
					header: arg.alias.header
				}
			};
		default: throw newErr(ERR.HEADER.ARG.UNKNOWN_TYPE, { type: arg.type });
	}
}


// ==================== GET FUNCTIONS =======================

function getHeader (tablo, targetHeaderAlias) {
	return tablo.headers.find(function (header) {
		return header.alias == targetHeaderAlias;
	});
}

// get cell without checks 
function getCell (tablo, header, numLine) {
	return tablo.data[numLine][header.order];
}


// check getCellByAliases()
function checkGetCellByAliases (tabenv, tabloAlias, headerAlias, numLine) {
	var tablo = tabenv.tablos.get(tabloAlias);
	if (tablo === undefined) {
		var err = newErr(ERR.TABLO.NOT_FOUND, { tabloAlias: tabloAlias });
		return [ err ];
	}
	
	var header = getHeader(tablo, headerAlias);
	if (header === undefined) {
		var err = newErr(ERR.HEADER.NOT_FOUND, {
			tabloAlias: tabloAlias, headerAlias: headerAlias });
		return [ err ];
	}
	
	if (numLine < 0 || numLine >= tablo.data.length) {
		var err = newErr(ERR.LINE.OUT_OF_BOUNDS, {
			tabloAlias: tabloAlias, headerAlias: headerAlias, numLine: numLine
		});
		return [ err ];
	}
	
	return [];
}

// get cell value by aliases and do checks
function getCellByAliases (tabenv, tabloAlias, headerAlias, numLine) {
	var tablo = tabenv.tablos.get(tabloAlias);
	var header = getHeader(tablo, headerAlias);
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
			var err = newErr(ERR.TABLO.ALIAS.EXISTING, { alias: newAlias });
			errsAlias.push(err);
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
			var header2 = getHeader(tablo2, reactionAlias.header);
			header2.args.forEach(function (arg, index) {
				if (arg.alias.tablo == oldAlias) arg.alias.tablo = newAlias;
			});
		});
		
		// 3. upd old tablo alias in reactions
		switch (header.type) {
			case HEADER.TYPE.DATA: break;
			// reactions correspond to args of this header
			case HEADER.TYPE.FUNC:
				header.args.forEach (function (arg) { switch(arg.type) {
					case HEADER.ARG.TYPE.NULL: break;
					case HEADER.ARG.TYPE.COL_SAME_LINE:
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
		var err = newErr(ERR.TABLO.DISPLAY_NUM_LINES.NOT_BOOLEAN, {
			displayNumLines: displayNumLines });
		return [ err ];
	}
	else return [];
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
		if (getHeader(tablo, newAlias) != undefined) {
			var err = newErr(ERR.HEADER.ALIAS.EXISTING, { 
				tabloAlias: tablo.alias, headerAlias: newAlias });
			errsAlias.push(err);
		}
		else return errsAlias;
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
		var header2 = getHeader(tablo2, reactionAlias.header);
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
		case HEADER.TYPE.DATA: break;
		case HEADER.TYPE.FUNC:
			header.args.forEach (function (arg) { switch(arg.type) {
				case HEADER.ARG.TYPE.NULL: break;
				case HEADER.ARG.TYPE.COL_SAME_LINE:
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
		case HEADER.TYPE.DATA:
			switch (header.type) {
				case HEADER.TYPE.DATA: break;
				case HEADER.TYPE.FUNC: 
					delAllArgsFromHeader(tabenv, tablo, header);
					header.type = HEADER.TYPE.DATA;
					header.dataType = HEADER.DATA_TYPE.INT;
					header.args = undefined;
					header.func = undefined;
					break;
				default: throw newErr(
					ERR.HEADER.UNKNOWN_TYPE, { type: header.type });
			}
			break;
		case HEADER.TYPE.FUNC:
			switch (header.type) {
				case HEADER.TYPE.DATA:
					header.type = HEADER.TYPE.FUNC;
					header.dataType = undefined;
					header.args = [];
					header.func = function () { return null; };
					updFuncHeaderAllCells(tabenv, tablo, header);
					break;
				case HEADER.TYPE.FUNC: break;
				default: throw newErr(
					ERR.HEADER.UNKNOWN_TYPE, { type: header.type });
			}
			break;
		default: throw newErr(ERR.HEADER.UNKNOWN_TYPE, { type: newType });
	}
}

// checks the order of a header
function checkHeaderOrder (tablo, order) {
	if (order < 0 || order >= tablo.headers.length) {
		var err = newErr(ERR.HEADER.ORDER.OUT_OF_BOUNDS, { 
			tabloAlias: tablo.alias, order: order });
		return [ err ];
	}
	else return [];
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
				case HEADER.DATA_TYPE.INT:
					parseInt(oldVal);
					break;
				case HEADER.DATA_TYPE.FLOAT:
					parseFloat(oldVal);
					break;
				case HEADER.DATA_TYPE.STRING:
					new String(oldVal).valueOf();
					break;
				case HEADER.DATA_TYPE.JSON:
					JSON.parse(oldVal);
					break;
				default: throw newErr(
					ERR.HEADER.DATA_TYPE.UNKNOWN, { dataType: newDataType });
			}
			// TODO: check updDataCell and updCellReactions
		}
		catch (error){ 
			var err = newErr(ERR.HEADER.DATA_TYPE.CELL_PARSE_ERROR, {
				tabloAlias: tablo.alias, headerAlias: header.alias,
				numLine: numLine 
			});
			errs.push(err); 
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
			case HEADER.DATA_TYPE.INT:
				newVal = parseInt(oldVal);
				break;
			case HEADER.DATA_TYPE.FLOAT:
				newVal = parseFloat(oldVal);
				break;
			case HEADER.DATA_TYPE.STRING:
				newVal = new String(oldVal).valueOf();
				break;
			case HEADER.DATA_TYPE.JSON:
				newVal = JSON.parse(oldVal);
				break;
			default:
				throw newErr(ERR.HEADER.DATA_TYPE.UNKNOWN, { 
					dataType: newDataType });
		}
		updDataCell(tabenv, tablo, header, numLine, newVal);
		updCellReactions(tabenv, tablo, header, numLine);
	});
}

// check args for updHeaderArgs()
// tabenv, tablo, and header are not checked
function checkUpdHeaderArgs (tabenv, tablo, header, newArgs) {
	if (header.type != HEADER.TYPE.FUNC) {
		var err = newErr(ERR.HEADER.TYPE.NOT_FUNC, { 
			tabloAlias: tablo.alias, headerAlias: header.alias });
		return [ err ];
	}
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
	if (header.type != HEADER.TYPE.FUNC) {
		var err = newErr(ERR.HEADER.TYPE.NOT_FUNC, {
			tabloAlias: tablo.alias, headerAlias: header.alias });
		return [ err ];
	}
	var errs = [];
	for (var i = 0 ; i < tablo.data.length ; i ++) {
		errs = errs.concat(
			checkUpdFuncCell(tabenv, tablo, header, i),
			checkUpdCellReactions(tabenv, tablo, header, i)
		);
	} 
	return errs;
}

function updFuncHeaderAllCells (tabenv, tablo, header) {
	for (var i = 0 ; i < tablo.data.length ; i ++) {
		updFuncCell(tabenv, tablo, header, i);
		updCellReactions(tabenv, tablo, header, i);
	} 
}

// check args for updTabloAllFuncHeadersAllCells()
function checkUpdTabloAllFuncHeadersAllCells (tabenv, tablo) {
	var errs = [];
	tablo.headers.forEach(function (header) {
		if (header.type == HEADER.TYPE.FUNC) {
			errs = errs.concat(
				checkUpdFuncHeaderAllCells(tabenv, tablo, header));
		}
	});
	return errs;
}

function updTabloAllFuncHeadersAllCells (tabenv, tablo) {
	tablo.headers.forEach(function (header) {
		if (header.type == HEADER.TYPE.FUNC) {
			updFuncHeaderAllCells(tabenv, tablo, header);
		}
	});
}

// check args for updLineAllFuncCells()
function checkUpdLineAllFuncCells (tabenv, tablo, numLine) {
	if (numLine < 0 || numLine >= tablo.data.length) {
		var err = newErr(ERR.LINE.OUT_OF_BOUNDS, {
			tabloAlias: tablo.alias, numLine: numLine });
		return [ err ] ;
	}
	var errs = [];
	tablo.headers.forEach(function (header) {
		if (header.type == HEADER.TYPE.FUNC) {
			errs = errs.concat(
				checkUpdFuncCell(tabenv, tablo, header, numLine),
				checkUpdCellReactions(tabenv, tablo, header, numLine)
			);
		}
	});
	return errs;
}

function updLineAllFuncCells (tabenv, tablo, numLine) {
	tablo.headers.forEach(function (header) {
		if (header.type == HEADER.TYPE.FUNC) {
			updFuncCell(tabenv, tablo, header, numLine);
			updCellReactions(tabenv, tablo, header, numLine);
		}
	});
}

function checkUpdCellReactions (tabenv, tablo, header, numLine) {
	var cellFullAlias = aliasesToStr(tablo.alias, header.alias);
	var reactionsTree = getReactionsTree(tabenv.reactMap, cellFullAlias);
	
	if (reactionsTree == undefined) {
		var err = newErr(ERR.REACT_MAP.KEY.NOT_FOUND, {
			tabloAlias: tablo.alias, headerAlias: header.alias,
			numLine: numLine
		});
		return [ err ];
	}
	
	var errs = [];
	reactionsTree.childs.forEach(function (childOfRoot) {
		treeForEachDeepFirst(childOfRoot, function (aliasStr) {
			var aliasObj = aliasObjFromStr(aliasStr);
			var tablo2 = tabenv.tablos.get(aliasObj.tablo);
			var header2 = getHeader(tablo2, aliasObj.header);
			errs = errs.concat(checkUpdFuncCell(
				tabenv, tablo2, header2, numLine));
		});
	});
	
	return errs;
}

// update cells that depend on the one in argument
function updCellReactions (tabenv, tablo, header, numLine) {
	var cellFullAlias = aliasesToStr(tablo.alias, header.alias);
	var reactionsTree = getReactionsTree(tabenv.reactMap, cellFullAlias);
	
	if (reactionsTree == undefined) {
		var err = newErr(ERR.REACT_MAP.KEY.NOT_FOUND, { key: cellFullAlias });
		throw err;
	}
	
	// we update every subtree of the root
	// not the root himself because it is the argument cell 
	reactionsTree.childs.forEach(function (childOfRoot) {
		treeForEachDeepFirst(childOfRoot, function (aliasStr) {
			var aliasObj = aliasObjFromStr(aliasStr);
			var tablo2 = tabenv.tablos.get(aliasObj.tablo);
			var header2 = getHeader(tablo2, aliasObj.header);
			
			// we have to check here, because in the normal course of 
			// the application there can be errors
			var errs = checkUpdFuncCell (tabenv, tablo2, header2, numLine);
			var onlyLineErrors = errs.every(function (err) { 
				return err.type == ERR.LINE.OUT_OF_BOUNDS ;
			});
			if (errs.length > 0 && onlyLineErrors) { 
				// a line error is "normal". for exemple :
				// tablo1 has data header1.
				// tablo2 has func header2 poiting to tablo1[#][header1].
				// when you add a line to tablo1, it is possible that tablo2 
				// have inferior number of tablo1.
				// so we don't update data in tablo2.
				// TODO maybe we should display a warning then
			}
			else if (errs.length > 0 && ! onlyLineErrors) {
				// if there is other kind of errors it is serious we throw them
				throw (errs) ;
			}
			else {
				// no errors we go on
				updFuncCell(tabenv, tablo2, header2, numLine);
			}
		});
	});
}

// check updFuncCell()
function checkUpdFuncCell (tabenv, tablo, header, numLine) {

	if (numLine < 0 || numLine >= tablo.data.length) {
		var err = newErr(ERR.LINE.OUT_OF_BOUNDS, {
			tabloAlias: tablo.alias, headerAlias: header.alias,
			numLine: numLine
		});
		return [ err ] ;
	}

	try {

		// compute the args for the cell
		var funcArgs = new Array(header.args.length);

		funcArgs.fill(null);
		header.args.forEach(function (headerArg, index) {
			switch (headerArg.type) {
				case HEADER.ARG.TYPE.NULL: break;
				case HEADER.ARG.TYPE.COL_SAME_LINE:
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
				default: 
					var err = newErr(ERR.HEADER.ARG.TYPE.UNKNOWN, {
						type: headerArg.type });
					throw [ err ];
			}
		});
		
		// compute the func applied to the args, for the cell
		try {
			var funcResult = header.func.apply(null, funcArgs);
		}
		catch (error) { 
			var err = newErr(ERR.HEADER.FUNCTION.APP_ERROR, {
				tabloAlias: tablo.alias, headerAlias: header.alias,
				numLine: numLine
			});
			throw [ err ] 
		}
	}
	catch (errors) { return errors; }
	
	return [];
}

function updFuncCell (tabenv, tablo, header, numLine) {

	// compute the args for the cell
	var funcArgs = new Array(header.args.length);
	funcArgs.fill(null);
	header.args.forEach(function (headerArg, index) {
		switch (headerArg.type) {
			case HEADER.ARG.TYPE.NULL: break;
			case HEADER.ARG.TYPE.COL_SAME_LINE:
			
				var errs = checkGetCellByAliases(
					tabenv, 
					headerArg.alias.tablo, headerArg.alias.header, 
					numLine
				);
				
				if (errs.length > 0) {
					// TODO : display a warning
					funcArgs[index] = null;
				}
				else {
					funcArgs[index] = getCellByAliases (
						tabenv, 
						headerArg.alias.tablo, headerArg.alias.header, 
						numLine
					);
				}
				break;
			default: console.log("unknown arg type");
		}
	});
	
	// compute the func applied to the args, for the cell
	var funcResult = header.func.apply(null, funcArgs);
	tablo.data[numLine][header.order] = funcResult;	
}

// check updDataCell()
function checkUpdDataCell (tabenv, tablo, header, numLine, newVal) {
	
	if (numLine < 0 || numLine >= tablo.data.length) {
		var err = newErr(ERR.LINE.OUT_OF_BOUNDS, {
			tabloAlias: tablo.alias, headerAlias: header.alias,
			numLine: numLine
		});
		return [ err ] ;
	}
	
	return [];
}

function updDataCell (tabenv, tablo, header, numLine, newVal) {
	tablo.data[numLine][header.order] = newVal;
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
			getHeader(reactionTablo, reactionAlias.header);
		var reactionArgs = reactionHeader.args.map(function (arg) {
			switch (arg.type) {
				case HEADER.ARG.TYPE.NULL: return arg;
				case HEADER.ARG.TYPE.COL_SAME_LINE: 
					if (arg.alias.tablo == tablo.alias &&
						arg.alias.header == header.alias
					){
						return { type: HEADER.ARG.TYPE.NULL };
					}
					else return arg;
				default: throw newErr(ERR.HEADER.ARG.TYPE.UNKNOWN, {
					type: arg.type });
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
	if (header.type == HEADER.TYPE.FUNC) {
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
		case HEADER.ARG.TYPE.NULL: break;
		case HEADER.ARG.TYPE.COL_SAME_LINE:
			// Careful ! we must not delete the reaction if
			// there was another arg pointing to the same alias
			var anotherSame = header.args.find(function (otherArg) {
				return (
					otherArg.type == HEADER.ARG.TYPE.COL_SAME_LINE &&
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
		default: throw newErr(ERR.HEADER.ARG.TYPE.UNKNOWN, { type: arg.type });
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




