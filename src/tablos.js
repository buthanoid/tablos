"use strict";

export { 
	getByAlias,
	DATAHEADER,
	FUNCHEADER,
	TABTYPEHEADER,
	NULLARG,
	COLSAMELINEARG,
	TABTYPEARG,
	newTabenv, 
	newTablo,
	newDataHeader,
	newFuncHeader,
	delHeader,
	newColSamelineArg,
	addNewLine,
	updCell,
	updFuncHeaderCells,
	updTabloAlias,
	updHeaderAlias,
	updHeaderType,
	updHeaderOrder,
	updHeaderArgs,
	updHeaderFunc
};

const DATAHEADER = 0 ;
const FUNCHEADER = 1 ;
const TABTYPEHEADER = [ DATAHEADER, FUNCHEADER ];

const NULLARG = -1 ;
const COLSAMELINEARG = 0 ;
const TABTYPEARG = [ NULLARG, COLSAMELINEARG ];

function getByAlias (tab, alias) {
	return tab.find(function (elt) { 
		return elt.alias == alias;
	});
}

function newTabenv () {
	return {
		tablos: new Map(),
		follows: new Map()
	}
}

function newTablo (tabenv, alias, label) {
	if (tabenv.tablos.has(alias)) {
		console.log("already existing alias");
		return null;
	}
	var tablo = {
		alias: alias,
		label: label,
		headers: [],
		data:[],
		nbLines: 0,
		displayNumLines: true
	};
	tabenv.tablos.set(alias, tablo);
	
	return tablo;
}

function newHeader (tabenv, tablo, alias, type, label) {
	if (getByAlias(tablo.headers, alias)) {
		console.log("already existing alias");
		return null;
	}
	var header = {
		alias: alias,
		type: type,
		label: label,
		order: tablo.headers.length
	};
	tablo.headers.push(header);
	tabenv.follows.set(tablo.alias + "." + header.alias, []);
	return header;
}

function newDataHeader (tabenv, tablo, alias, label) {
	var header = newHeader(tabenv, tablo, alias, DATAHEADER, label);
	if (header == null) {
		console.log("could not create header");
		return null;
	};
	return header;
} 

function newFuncHeader (tabenv, tablo, alias, label, args, func) {
	var header = newHeader(tabenv, tablo, alias, FUNCHEADER, label);
	if (header == null) {
		console.log("could not create header");
		return null;
	};
	updHeaderArgs (tabenv, tablo, header, args);
	header.func = func;
	return header;
}

function delHeader (tabenv, tablo, alias) {
	var header = getByAlias(tablo.headers, alias);
	
	// delete data
	for (var numLine = 0; numLine < tablo.nbLines ; numLine ++) {
		tablo.data[numLine].splice(header.order, 1);
	}
	
	// delete header
	tablo.headers.splice(header.order, 1);
	
	// recompute the orders
	for (var i = 0; i < tablo.headers.length; i ++) {
		tablo.headers[i].order = i ; 
	}
		
	var fullalias = aliasesToStr(tablo.alias, header.alias);
	var followers = tabenv.follows.get(fullalias);
	
	// delete follows
	//tabenv.follows.delete(fullalias);
	tabenv.follows.forEach(function (value, key) {
		if (value.includes(fullalias)) {
			tabenv.follows.set(key, value.filter(function (follow) {
				return follow != fullalias;
			}));
		}
	});
	
	// set to null : args which were pointing to the deleted header
	/*followers.forEach(function (follower) {
	
		var folAliases = follower.split(".");
		var folTablo = tabenv.tablos.get(folAliases[0]);
		var folHeader = getByAlias(folTablo.headers, folAliases[1]);
		
		folHeader.args.forEach(function (arg, index) {
			if (arg.type == COLSAMELINEARG && arg.alias == fullalias) {
				folHeader.args[index] = { type: NULLARG };
			}
		});
		
		// update data (it will surely fail since it haves a null arg)
		updFuncHeaderCells(tabenv, folTablo, folHeader);
	});*/
	
	return true;
}

function newColSamelineArg (tabloAlias, headerAlias) {
	return {
		type: COLSAMELINEARG,
		alias: {
			tablo: tabloAlias,
			header: headerAlias
		}
	};
}

function aliasObjToStr (alias) { return alias.tablo + "." + alias.header }
function aliasesToStr (tabloAlias, headerAlias) {
	return tabloAlias + "." + headerAlias ;
}
function aliasObjFromStr (str) { 
	var tab = str.split(".");
	return { tablo: tab[0], header: tab[1] }
}

function addNewLine (tabenv, tablo) {	
	var line = [];
	for (var i = 0 ; i < tablo.headers.length ; i ++) {
		line.push(null);
	}
	tablo.data.push(line);
	tablo.nbLines ++;
	updLineCells(tabenv, tablo, tablo.nbLines - 1);
	return true;
}

function updCell (tabenv, tablo, header, numLine, newVal) {
	if (numLine >= tablo.nbLines) {
		console.log("wrong line number");
		return false;
	}

	var fullalias = aliasesToStr(tablo.alias, header.alias);
	if (! tabenv.follows.has(fullalias)) {
		console.log("cannot find follows : " + fullalias);
		return false;
	}

	switch (header.type) {
		case DATAHEADER: 
			tablo.data[numLine][header.order] = newVal;
			break;
		case FUNCHEADER: 
			var args_vals = [];
			for (var i = 0; i < header.args.length; i++) {
				var arg = header.args[i];
				switch (arg.type) {
					case NULLARG:
						args_vals.push(null); 
						break;
					case COLSAMELINEARG: 
						if (! tabenv.tablos.has(arg.alias.tablo)) {
							console.log("tablo alias not found");
							return false;
						}
						var tablo2 = tabenv.tablos.get(arg.alias.tablo);
						var header2 = 
							getByAlias(tablo2.headers, arg.alias.header);
						if (header2 == undefined) {
							console.log("header alias not found");
							return false;
						}
						if (numLine >= tablo2.nbLines) {
							console.log("incorrect num line");
							return false;
						}
						var val2 = tablo2.data[numLine][header2.order];
						args_vals.push(val2);
						break;
					default:
						console.log("unknown arg type");
						return false;
				}
			}
			var result = header.func.apply(null, args_vals);
			tablo.data[numLine][header.order] = result;
			break;
		default:
			console.log("unknown header type");
			return false;
	}
	
	tabenv.follows.get(fullalias).forEach(function (follow) {
		var folAlias = aliasObjFromStr(follow);
		if (! tabenv.tablos.has(folAlias.tablo)) {
			console.log("tablo alias not found");
			return false;
		}
		var tablo2 = tabenv.tablos.get(folAlias.tablo);
		var header2 = getByAlias(tablo2.headers, folAlias.header);
		if (header2 == undefined) {
			console.log("header alias not found");
			return false;
		}
		updCell(tabenv, tablo2, header2, numLine, null);
	});
	
	return true;
}

function updHeaderAlias (tabenv, tablo, oldHeaderAlias, newHeaderAlias) {
	
	// the header himself
	var theHeader = getByAlias(tablo.headers, oldHeaderAlias);
	theHeader.alias = newHeaderAlias;
	
	// the args referencing the header
	tabenv.tablos.forEach(function (tablo) {
		tablo.headers.forEach(function (header) {
			if (header.args) { header.args.forEach(function (arg) {
				switch(arg.type) {
					case NULLARG: break;
					case COLSAMELINEARG: 
						if (arg.alias.tablo == tablo.alias &&
							arg.alias.header == oldHeaderAlias
						) {
							arg.alias.header = newHeaderAlias; 
						}
						break;
					default: console.log("unknown arg type " + arg.type);
				}
			})}
		});
	});
	
	// the follows 
	var oldFullAlias = aliasesToStr(tablo.alias, oldHeaderAlias);
	var newFullAlias = aliasesToStr(tablo.alias, newHeaderAlias);
	var theFollowers = tabenv.follows.get(oldFullAlias);
	tabenv.follows.delete(oldFullAlias);
	tabenv.follows.set(newFullAlias, theFollowers);
	tabenv.follows.forEach(function (followers) {
		followers.forEach(function (follower, index) {
			if (follower == oldFullAlias) {
				followers[index] = newFullAlias;
			}
		});
	});
}

function updHeaderType (tabenv, tablo, header, newType) {
	if (header.type == DATAHEADER && newType == FUNCHEADER) {
		header.type = FUNCHEADER;
		header.args = [];
		header.func = function () { return null; };
		updFuncHeaderCells(tabenv, tablo, header);
	}
	else if (header.type == FUNCHEADER && newType == DATAHEADER) {
		updHeaderArgs(tabenv, tablo, header, []);
		header.type = DATAHEADER;
		header.args = undefined;
		header.func = undefined;
	}
	else return false;
	return true;
}

function updTabloAlias (tabenv, tablo, newAlias) {
	var oldAlias = tablo.alias;
	
	// update the tablo
	tablo.alias = newAlias;
	tabenv.tablos.delete(oldAlias);
	tabenv.tablos.set(newAlias, tablo);
	
	// update args referencing the old tablo
	tabenv.tablos.forEach(function (tablo) {
		tablo.headers.forEach(function (header) {
			if (header.args) { header.args.forEach(function (arg) {
				switch(arg.type) {
					case NULLARG: break;
					case COLSAMELINEARG: 
						if (arg.alias.tablo == oldAlias) {
							arg.alias.tablo = newAlias; 
						}
						break;
					default: console.log("unknown arg type " + arg.type);
				}
			})}
		});
	});
	
	// update the follows keys
	tablo.headers.forEach(function (header) {
		var fullOldAlias = aliasesToStr(oldAlias, header.alias);
		var hfs = tabenv.follows.get(fullOldAlias);
		tabenv.follows.delete(fullOldAlias);
		tabenv.follows.set(aliasesToStr(newAlias, header.alias), hfs);
	});
	
	// update the follows values
	tabenv.follows.forEach(function (followers, followersKey) {
		tabenv.follows.set(followersKey, followers.map(function (follower) {
			var folAlias = aliasObjFromStr(follower);
			if (folAlias.tablo == oldAlias) {
				return aliasesToStr(newAlias, folAlias.header);
			}
			else return follower;
		}));
	});
}

function updFuncHeaderCells (tabenv, tablo, header) {
	for (var i = 0 ; i < tablo.nbLines ; i ++) {
		updCell(tabenv, tablo, header, i, null);
	} 
}

function updTabloFuncHeadersCells (tabenv, tablo) {
	tablo.headers.forEach(function (header) {
		if (header.type == FUNCHEADER) {
			updFuncHeaderCells(tabenv, tablo, header);
		}
	});
}

function updLineCells (tabenv, tablo, numLine) {
	tablo.headers.forEach(function (header) {
		if (header.type == FUNCHEADER) {
			updCell(tabenv, tablo, header, numLine, null);
		}
	});
}

function updHeaderFunc (tabenv, tablo, header, newfunc) {
	header.func = newfunc ;
	updFuncHeaderCells(tabenv, tablo, header);
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

function updHeaderOrder (tabenv, tablo, header, newOrder) {
	
	var oldOrder = header.order;
	
	arrayMove (tablo.headers, oldOrder, newOrder);
	
	// recompute the orders
	for (var i = 0; i < tablo.headers.length; i ++) {
		tablo.headers[i].order = i ; 
	}
	
	// same thing for the data
	for (var numLine = 0 ; numLine < tablo.nbLines ; numLine ++) {
		arrayMove (tablo.data[numLine], oldOrder, newOrder) ;
	}
}

function updHeaderArgs (tabenv, tablo, header, newArgs) {
	if (header.type != FUNCHEADER) {
		console.log("header is not func type so has no args to update");
		return false;
	}
	var fullAlias = aliasesToStr(tablo.alias, header.alias);
	// remove followers for old args
	if (header.args) {
		for (var i = 0; i < header.args.length; i ++) {
			switch (header.args[i].type) {
				case NULLARG: break;
				case COLSAMELINEARG:
					var argAlias = aliasObjToStr(header.args[i].alias);
					var follows = tabenv.follows.get(argAlias);
					if (follows != undefined) {
						tabenv.follows.set(
							argAlias,
							follows.filter(function (fa) {
								return fa != fullAlias;
							})
						);
					}
					break;
				default:	
					console.log("unknown arg type");
					return false;
			}
		}
	}
	// add followers for new args
	for (var i = 0; i < newArgs.length; i ++) {
		switch (newArgs[i].type) {
			case NULLARG: break;
			case COLSAMELINEARG: 
				var argAlias = aliasObjToStr(newArgs[i].alias);
				if (tabenv.follows.has(argAlias)) {
					tabenv.follows.get(argAlias).push(fullAlias);
				}
				else tabenv.follows.set(argAlias, [fullAlias]);
				break;
			default:
				console.log("unknown arg type");
				return false;
		}
	}
	header.args = newArgs;
	return true;
}
