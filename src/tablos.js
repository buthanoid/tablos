"use strict";

export { 
	getByAlias,
	DATAHEADER,
	FUNCHEADER,
	NULLARG,
	COLSAMELINEARG,
	newTabenv, 
	newTablo,
	newDataHeader,
	newFuncHeader,
	delHeader,
	newColSamelineArg,
	addNewLine,
	updCell,
	updTabloAlias,
	updHeaderAlias,
	updHeaderFunc,
	updHeaderOrder
};

const DATAHEADER = 0 ;
const FUNCHEADER = 1 ;

const NULLARG = -1 ;
const COLSAMELINEARG = 0 ;

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
		
	var fullalias = tablo.alias + "." + header.alias;
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

function newColSamelineArg (alias) {
	return {
		type: COLSAMELINEARG,
		alias: alias
	};
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

	var fullalias = tablo.alias + "." + header.alias;
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
						var aliases = arg.alias.split(".");
						if (! tabenv.tablos.has(aliases[0])) {
							console.log("tablo alias not found");
							return false;
						}
						var tablo2 = tabenv.tablos.get(aliases[0]);
						var header2 = getByAlias(tablo2.headers, aliases[1]);
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
		var aliases = follow.split(".");
		if (! tabenv.tablos.has(aliases[0])) {
			console.log("tablo alias not found");
			return false;
		}
		var tablo2 = tabenv.tablos.get(aliases[0]);
		var header2 = getByAlias(tablo2.headers, aliases[1]);
		if (header2 == undefined) {
			console.log("header alias not found");
			return false;
		}
		updCell(tabenv, tablo2, header2, numLine, null);
	});
	
	return true;
}

function updHeaderAlias (tabenv, tablo, oldAlias, newAlias) {
	
	// the header himself
	var theHeader = getByAlias(tablo.headers, oldAlias);
	theHeader.alias = newAlias;
	
	var oldFullAlias = tablo.alias + "." + oldAlias;
	var newFullAlias = tablo.alias + "." + newAlias;
	
	// the args referencing the header
	tabenv.tablos.forEach(function (tablo) {
		tablo.headers.forEach(function (header) {
			if (header.args) { header.args.forEach(function (arg) {
				switch(arg.type) {
					case NULLARG: break;
					case COLSAMELINEARG: 
						if (arg.alias == oldFullAlias) {
							arg.alias = newFullAlias; 
						}
						break;
					default: console.log("unknown arg type " + arg.type);
				}
			})}
		});
	});
	
	// the follows 
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
						var argAliases = arg.alias.split(".");
						if (argAliases[0] == oldAlias) {
							arg.alias = newAlias + "." + argAliases[1]; 
						}
						break;
					default: console.log("unknown arg type " + arg.type);
				}
			})}
		});
	});
	
	// update the follows keys
	tablo.headers.forEach(function (header) {
		var fullOldAlias = oldAlias + "." + header.alias;
		var hfs = tabenv.follows.get(fullOldAlias);
		tabenv.follows.delete(fullOldAlias);
		tabenv.follows.set(newAlias + "." + header.alias, hfs);
	});
	
	// update the follows values
	tabenv.follows.forEach(function (followers, followersKey) {
		tabenv.follows.set(followersKey, followers.map(function (follower) {
			var folAliases = follower.split(".");
			if (folAliases[0] == oldAlias) {
				return newAlias + "." + folAliases[1];
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
	var fullAlias = tablo.alias + "." + header.alias;
	// remove followers for old args
	if (header.args) {
		for (var i = 0; i < header.args.length; i ++) {
			switch (header.args[i].type) {
				case NULLARG: break;
				case COLSAMELINEARG:
					var follows = tabenv.follows.get(header.args[i].alias);
					if (follows != undefined) {
						tabenv.follows.set(
							header.args[i].alias,
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
				if (tabenv.follows.has(newArgs[i].alias)) {
					tabenv.follows.get(newArgs[i].alias).push(fullAlias);
				}
				else tabenv.follows.set(newArgs[i].alias, [fullAlias]);
				break;
			default:
				console.log("unknown arg type");
				return false;
		}
	}
	header.args = newArgs;
	return true;
}
