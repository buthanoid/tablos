import { assert } from "chai" ;
import * as T from "@/tablos.js";

// tabenv
// tablo1 
function makenv1Tablo () {
	var env = {};

	env.tabenv = T.newTabenv();
	
	var tablo1Alias = "tablo1";
	var tablo1Label = "Tablo 1";
	env.tablo1 = T.newTablo(env.tabenv, tablo1Alias, tablo1Label).value;

	return env;
};	

// makenv1Tablo
// header1 data in tablo1
// one line for header1 with cell = 33
function makenv1Tablo1Data1Line () {
	var env = makenv1Tablo();
	
	var header1Alias = "header1";
	var header1Label = "Header 1";
	env.header1FullAlias = T.aliasesToStr(env.tablo1.alias, header1Alias);
	env.header1 = T.newDataHeader(
		env.tabenv, env.tablo1, header1Alias, header1Label).value;
	T.newLine(env.tabenv, env.tablo1);
	T.updDataCell(env.tabenv, env.tablo1, env.header1, 0, 33);
		
	return env;
}

// makenv1Tablo1Data1Line
// tablo2
// header2 func in tablo2, one arg to tablo1.header1
// one line for header2 (by reaction cell = 34)
function makenv2Tablo1Func1Line () {
	var env = makenv1Tablo1Data1Line();

	var tablo2Alias = "tablo2";
	var tablo2Label = "Tablo 2";
	env.tablo2 = T.newTablo(env.tabenv, tablo2Alias, tablo2Label).value;
	
	var header2Alias = "header2";
	var header2Label = "Header 2";
	env.header2FullAlias = T.aliasesToStr(tablo2Alias, header2Alias);
	env.header2 = T.newFuncHeader(
		env.tabenv, env.tablo2, header2Alias, header2Label,
		[ T.newColSamelineArg(env.tablo1.alias, env.header1.alias) ],
		function (data) { return data + 1 }
	).value;
	T.newLine(env.tabenv, env.tablo2);
	
	return env;
}

function makenv1Tablo2Data1Line () {
	var env = makenv1Tablo1Data1Line();
	var header2Alias = "header2";
	var header2Label = "Header 2";
	env.header2FullAlias = T.aliasesToStr(env.tablo1.alias, header2Alias);
	env.header2 = T.newDataHeader(
		env.tabenv, env.tablo1, header2Alias, header2Label
	).value;
	T.updDataCell(env.tabenv, env.tablo1, env.header2, 0, 1000);
	return env;
}

function makenv2Tablo2Data1Func1Line () {
	var env = makenv1Tablo2Data1Line ();
	
	var tablo2Alias = "tablo2";
	var tablo2Label = "Tablo 2";
	env.tablo2 = T.newTablo(env.tabenv, tablo2Alias, tablo2Label).value;
	
	var header3Alias = "header3";
	var header3Label = "Header 3";
	env.header3FullAlias = T.aliasesToStr(tablo2Alias, header3Alias);
	env.header3 = T.newFuncHeader(
		env.tabenv, env.tablo2, header3Alias, header3Label,
		[ T.newColSamelineArg(env.tablo1.alias, env.header1.alias) ],
		function (data) { return data + 1 }
	).value;
	T.newLine(env.tabenv, env.tablo2);
	
	return env;
}

function makenv2Tablo2Data2Func1Line () {
	var env = makenv2Tablo2Data1Func1Line();
	
	var header4Alias = "header4";
	var header4Label = "Header 4";
	env.header4FullAlias = T.aliasesToStr(env.tablo2.alias, header4Alias);
	env.header4 = T.newFuncHeader(
		env.tabenv, env.tablo2, header4Alias, header4Label,
		[ T.newColSamelineArg(env.tablo1.alias, env.header2.alias) ],
		function (data) { return data + 1 }
	).value;
	
	return env;
}

describe("newTablo() basique", function () {

	var tabenv, resTablo, tablo, tabloAlias, tabloLabel;

	before(function() {
		tabloAlias = "tablo1";
		tabloLabel = "Tablo 1";
		tabenv = T.newTabenv ();
	});
	
	it("newTablo()", function () {
		resTablo = T.newTablo(tabenv, tabloAlias, tabloLabel);
		tablo = resTablo.value;
	});
	
	it("return value", function () {	
		assert.isTrue(resTablo.success);
		assert.equal(tablo.alias, tabloAlias);
		assert.equal(tablo.label, tabloLabel); 
	});
	it("tabenv udpated", function () {
		assert.equal(tabenv.tablos.get(tabloAlias), tablo)
	});
});

describe("newDataHeader() basique", function () {

	var env, header, headerAlias, headerLabel, headerFullAlias, res;
		
	before(function () {
		env = makenv1Tablo();
		headerAlias = "header1";
		headerLabel = "Header 1";
		headerFullAlias = T.aliasesToStr(env.tablo1.alias, headerAlias);
	});

	it("newDataHeader()", function () {
		res = T.newDataHeader(env.tabenv, env.tablo1, headerAlias, headerLabel);
		header = res.value;
	});
	
	it("return value", function () { 
		assert.isTrue(res.success);
		assert.equal(header.alias, headerAlias);
		assert.equal(header.label, headerLabel);
		assert.equal(header.type, T.DATA_HEADER);
	});
	it("tablo udpated", function () {
		assert.equal(env.tablo1.getHeaderByAlias(headerAlias), header);
	});
	it("follows udpated", function () {
		assert.isTrue(env.tabenv.follows.has(headerFullAlias));
		assert.equal(env.tabenv.follows.get(headerFullAlias).length, 0);
	});
});

describe("newColSamelineArg()", function () {
	
	var tabloAlias, headerAlias, arg;
	
	before(function() {
		tabloAlias = "tablo1";
		headerAlias = "header1";
	});
	
	it("newColSamelineArg()", function () {
		arg = T.newColSamelineArg(tabloAlias, headerAlias);
	});
	
	it("return value", function () { 
		assert.equal(arg.type, T.COL_SAMELINE_ARG);
		assert.equal(arg.alias.tablo, tabloAlias);
		assert.equal(arg.alias.header, headerAlias);
	});
});

describe("newFuncHeader() pointant un data header", function () {

	var env, header2, header2Alias, header2Label, header2FullAlias, 
		header2Args, header2Func, res;

	before(function () {
		env = makenv1Tablo1Data1Line();
		header2Alias = "header2";
		header2Label = "Header 2";
		header2FullAlias = T.aliasesToStr(env.tablo1.alias, header2Alias);
		header2Args = [ 
			T.newColSamelineArg(env.tablo1.alias, env.header1.alias) 
		];
		header2Func = function (data) { return data + 1 };
	});
		
	it("newFuncHeader()", function () {
		res = T.newFuncHeader(
			env.tabenv, env.tablo1, 
			header2Alias, header2Label, header2Args, header2Func);
		header2 = res.value;
	});
	
	it("return value", function () { 
		assert.isTrue(res.success);
		assert.equal(header2.alias, header2Alias);
		assert.equal(header2.label, header2Label);
		assert.equal(header2.type, T.FUNC_HEADER);
		assert.equal(header2.args.length, 1);
		assert.equal(header2.args[0], header2Args[0]);
	});
	it("tablo udpated", function () {
		assert.equal(env.tablo1.getHeaderByAlias(header2Alias), header2);
		assert.equal(
			T.getCell(env.tablo1, header2, 0),
			header2Func(T.getCell(env.tablo1, env.header1, 0))
		);
	});
	it("follows udpated", function () {
		assert.isTrue(env.tabenv.follows.has(header2FullAlias));
		assert.equal(env.tabenv.follows.get(header2FullAlias).length, 0);
		assert.equal(env.tabenv.follows.get(env.header1FullAlias).length, 1);
		assert.equal(
			env.tabenv.follows.get(env.header1FullAlias)[0], 
			header2FullAlias);
	});
});

describe("newLine()", function () {

	var env, resNewLine1, resNewLine2;

	before(function () {
		env = makenv2Tablo1Func1Line();
	});
		
	it("newLine()", function () {
		resNewLine1 = T.newLine(env.tabenv, env.tablo1);
		resNewLine2 = T.newLine(env.tabenv, env.tablo2);
	});
	
	it("return value", function () {
		assert.isTrue(resNewLine1.success);
		assert.isTrue(resNewLine2.success);
	});
	it("tablo updated", function () {
		// the number of lines is two because one line existed in env
		assert.equal(env.tablo1.data.length, 2);
		assert.equal(T.getCell(env.tablo1, env.header1, 1), null);
		assert.equal(
			T.getCell(env.tablo2, env.header2, 1), 
			env.header2.func(T.getCell(env.tablo1, env.header1, 1)));
	});
});

describe("newHeaderArg() avec zéro arg initialement", function () {

	var env, header2, header2FullAlias, newArg, res;

	before(function () {
		env = makenv1Tablo1Data1Line();
		var header2Alias = "header2";
		header2FullAlias = T.aliasesToStr(env.tablo1.alias, header2Alias);
		var header2Label = "Header 2"
		var header2Args = [];
		var header2Func = function (data) { return data };
		header2 = T.newFuncHeader(
			env.tabenv, env.tablo1, header2Alias, 
			header2Label, header2Args, header2Func
		).value;
		newArg = T.newColSamelineArg(env.tablo1.alias, env.header1.alias);
	});
		
	it("newHeaderArg()", function () {
		res = T.newHeaderArg(env.tabenv, env.tablo1, header2, newArg);
	});
	
	it("return value", function () {
		assert.isTrue(res.success);
	});
	it("header updated", function () {
		assert.equal(header2.args.length, 1);
		assert.equal(header2.args[0], newArg);
	});
	it("data updated", function () {
		assert.equal(
			T.getCell(env.tablo1, header2, 0),
			header2.func(T.getCell(env.tablo1, env.header1, 0))
		);
	});
	it("follows udpated", function () {
		assert.equal(env.tabenv.follows.get(env.header1FullAlias).length, 1);
		assert.equal(
			env.tabenv.follows.get(env.header1FullAlias)[0], 
			header2FullAlias);
	});
});

describe ("copyArg()", function () {
	var nullArg1, nullArg2, 
		colSamelineArg1, colSamelineArg2;
	
	before(function() {
		nullArg1 = { type: T.NULL_ARG };
		var tabloAlias = "tablo1";
		var headerAlias = "header1";
		colSamelineArg1 = T.newColSamelineArg(tabloAlias, headerAlias);
	});
	
	it("copyArg() NULL et COL_SAMELINE", function() {
		nullArg2 = T.copyArg(nullArg1);
		colSamelineArg2 = T.copyArg(colSamelineArg1);
	});
	
	it("return values", function () {
		assert.notEqual(nullArg1, nullArg2);
		assert.equal(nullArg1.type, nullArg2.type);
		assert.notEqual(colSamelineArg1, colSamelineArg2);
		assert.equal(colSamelineArg1.type, colSamelineArg2.type);
		assert.equal(colSamelineArg1.alias.tablo, colSamelineArg2.alias.tablo);
		assert.equal(
			colSamelineArg1.alias.header, colSamelineArg2.alias.header);
	});
});

describe("getCell()", function() {
	var cellVal, env;
	
	before(function () {
		env = makenv1Tablo1Data1Line();
	});
	
	it("getCell()", function() {
		cellVal = T.getCell(env.tablo1, env.header1, 0);
	});
	
	it("return value", function () {
		assert.equal(cellVal, 33);
	});
});

describe("getCellByAliases()", function() {
	var env,res;
	
	before(function () {
		env = makenv1Tablo1Data1Line();
	});
	
	it("getCellByAliases()", function() {
		res = T.getCellByAliases(
			env.tabenv, env.tablo1.alias, env.header1.alias, 0);
	});
	
	it("return value", function () {
		assert.isTrue(res.success);
		assert.equal(res.value, 33);
	});
});

describe("updTabloAlias() tablo2 pointing to tablo1. we change tablo1 alias", 
	function () {
	
		var env, newTablo1Alias, res,
			oldHeader1FullAlias, newHeader1FullAlias;
		
		before(function(){
			env = makenv2Tablo1Func1Line() 
			newTablo1Alias = "newtablo1";
			oldHeader1FullAlias = env.header1FullAlias;
			newHeader1FullAlias = 
				T.aliasesToStr(newTablo1Alias, env.header1.alias);
		});
		
		it("updTabloAlias()", function() {
			res = T.updTabloAlias(env.tabenv, env.tablo1, newTablo1Alias);
		});
		
		it("return value", function() {
			assert.isTrue(res.success);
		});
		it("tablo1 updated", function() {
			assert.equal(env.tablo1.alias, newTablo1Alias);
		});
		it("tablo2 updated", function() {
			assert.equal(
				env.tablo2.headers[0].args[0].alias.tablo, 
				newTablo1Alias);
		});
		it("follows updated", function() {
			assert.isFalse(env.tabenv.follows.has(oldHeader1FullAlias));
			assert.isTrue(env.tabenv.follows.has(newHeader1FullAlias));
			assert.equal(
				env.tabenv.follows.get(newHeader1FullAlias)[0], 
				env.header2FullAlias);
		});
	}
);

describe("updTabloAlias() tablo2 pointing to tablo1. we change tablo2 alias", 
	function () {
	
		var env, newTablo2Alias, res,
			oldHeader2FullAlias, newHeader2FullAlias;
		
		before(function(){
			env = makenv2Tablo1Func1Line() 
			newTablo2Alias = "newtablo2";
			oldHeader2FullAlias = env.header2FullAlias;
			newHeader2FullAlias = 
				T.aliasesToStr(newTablo2Alias, env.header2.alias);
		});
		
		it("updTabloAlias()", function() {
			res = T.updTabloAlias(env.tabenv, env.tablo2, newTablo2Alias);
		});
		
		it("return value", function() {
			assert.isTrue(res.success);
		});
		it("tablo2 updated", function() {
			assert.equal(env.tablo2.alias, newTablo2Alias);
		});
		it("follows updated", function() {
			assert.isFalse(env.tabenv.follows.has(oldHeader2FullAlias));
			assert.isTrue(env.tabenv.follows.has(newHeader2FullAlias));
			assert.equal(
				env.tabenv.follows.get(env.header1FullAlias)[0], 
				newHeader2FullAlias
			);
		});
	}
);

describe("updTabloLabel()", function () {

	var tablo, newLabel, res;
	
	before(function() {
		var tabenv = T.newTabenv();
		tablo = T.newTablo(tabenv, "tablo1", "Tablo 1").value;
		newLabel = "Tablo 1 new label";
	});

	it("updTabloLabel()", function () {
		res = T.updTabloLabel(tablo, newLabel);
	});
	
	it("result value", function () {
		assert.isTrue(res.success);
	});
	it("tablo updated", function () {
		assert.equal(tablo.label, newLabel);
	});
});

describe("updTabloDisplayNumLines()", function () {

	var tablo, res;
	
	before(function() {
		var tabenv = T.newTabenv();
		tablo = T.newTablo(tabenv, "tablo1", "Tablo 1").value;
	});

	it("updTabloDisplayNumLines()", function () {
		res = T.updTabloDisplayNumLines(tablo, false);
	});
	
	it("result value", function () {
		assert.isTrue(res.success);
	});
	it("tablo updated", function () {
		assert.isFalse(tablo.displayNumLines);
	});
});

describe(
	"updHeaderAlias() tablo2 header2 pointing to tablo1 header1. " +
	"update header1 alias", 
	function() {

		var env, newHeader1Alias, oldHeader1FullAlias, newHeader1FullAlias, res;

		before(function() { 
			env = makenv2Tablo1Func1Line() 
			newHeader1Alias = "newheader1";
			oldHeader1FullAlias = env.header1FullAlias;
			newHeader1FullAlias = 
				T.aliasesToStr(env.tablo1.alias, newHeader1Alias);
		});

		it("updHeaderAlias()", function() {
			res = T.updHeaderAlias(
				env.tabenv, env.tablo1, env.header1, newHeader1Alias);
		});

		it("return value", function() {
			assert.isTrue(res.success);
		});
		it("header1 updated", function () {
			assert.equal(env.header1.alias, newHeader1Alias);
		});
		it("header2 updated", function () {
			assert.equal(env.header2.args[0].alias.header, newHeader1Alias);
		});
		it("follows updated", function () {
			assert.isFalse(env.tabenv.follows.has(oldHeader1FullAlias));
			assert.isTrue(env.tabenv.follows.has(newHeader1FullAlias));
			assert.equal(
				env.tabenv.follows.get(newHeader1FullAlias)[0],
				env.header2FullAlias
			);
		});
});

describe(
	"updHeaderAlias() tablo2 header2 pointing to tablo1 header1. " +
	"update header2 alias", 
	function() {
		var env, newHeader2Alias, oldHeader2FullAlias, newHeader2FullAlias, res;

		before(function() { 
			env = makenv2Tablo1Func1Line() 
			newHeader2Alias = "newheader2";
			oldHeader2FullAlias = env.header2FullAlias;
			newHeader2FullAlias = 
				T.aliasesToStr(env.tablo2.alias, newHeader2Alias);
		});

		it("updHeaderAlias()", function() {
			res = T.updHeaderAlias(
				env.tabenv, env.tablo2, env.header2, newHeader2Alias);
		});

		it("return value", function() {
			assert.isTrue(res.success);
		});
		it("header2 updated", function () {
			assert.equal(env.header2.alias, newHeader2Alias);
		});
		it("follows updated", function () {
			assert.isFalse(env.tabenv.follows.has(oldHeader2FullAlias));
			assert.isTrue(env.tabenv.follows.has(newHeader2FullAlias));
			assert.equal(
				env.tabenv.follows.get(env.header1FullAlias)[0],
				newHeader2FullAlias
			);
		});
});

describe("updHeaderLabel()", function () {
	var header1, newLabel, res;

	before(function() {
		var tabenv = T.newTabenv();
		var tablo1 = T.newTablo(tabenv, "tablo1", "Tablo 1").value;
		var oldLabel = "Old Label";
		newLabel = "New Label";
		header1 = T.newDataHeader(tabenv, tablo1, "header1", oldLabel).value;
	});

	it("updHeaderLabel()", function() {
		res = T.updHeaderLabel(header1, newLabel);
	});
	
	it("result value", function() {
		assert.isTrue(res.success);
	});
	it("header updated", function() {
		assert.equal(header1.label, newLabel);
	});
});

describe("updHeaderType() DATA to FUNC", function () {
	var env, res;

	before(function() { 
		env = makenv2Tablo1Func1Line() ;
	});

	it("updHeaderType()", function() {
		res = T.updHeaderType(
			env.tabenv, env.tablo1, env.header1, T.FUNC_HEADER);
	});
	
	it("result value", function() {
		assert.isTrue(res.success);
	});
	it("header updated", function() {
		assert.equal(env.header1.type, T.FUNC_HEADER);
		assert.equal(env.header1.args.length, 0);
		assert.equal(typeof env.header1.func, "function");
	});
	it("tablo data updated", function() {
		assert.equal(T.getCell(env.tablo1, env.header1, 0), null);
	});
});



describe("updHeaderType() FUNC to DATA", function () {
	var env, res;

	before(function() {
		env = makenv2Tablo1Func1Line() ;
	});

	it("updHeaderType()", function() {
		res = T.updHeaderType(
			env.tabenv, env.tablo2, env.header2, T.DATA_HEADER);
	});
	
	it("result value", function() {
		assert.isTrue(res.success);
	});
	it("header updated", function() {
		assert.equal(env.header2.type, T.DATA_HEADER);
		assert.isUndefined(env.header2.args);
		assert.isUndefined(env.header2.func);
	});
	it("tablo data keeped", function() {
		assert.equal(T.getCell(env.tablo2, env.header2, 0), 34);
	});
});

describe("updHeaderOrder()", function() {
	var env, res;

	before(function() {
		env = makenv1Tablo2Data1Line();
	});

	it("updHeaderOrder()", function () {
		res = T.updHeaderOrder(env.tabenv, env.tablo1, env.header2, 0);
	});
	
	it("return value", function () {
		assert.isTrue(res.success);
	});
	it("headers updated", function () {
		assert.equal(env.header1.order, 1);
		assert.equal(env.header2.order, 0);
	});
	it("tablo and data updated", function () {
		assert.equal(env.tablo1.headers[0], env.header2);
		assert.equal(env.tablo1.headers[1], env.header1);
		assert.equal(env.tablo1.data[0][0], 1000);
		assert.equal(env.tablo1.data[0][1], 33);
	});
});

describe("updHeaderArgs()", function() {
	var env, newArg, res;
	
	before(function() {
		env = makenv2Tablo2Data1Func1Line();
	});
	
	it("updHeaderArgs()", function() {
		newArg = T.newColSamelineArg(env.tablo1.alias, env.header2.alias);
		res = T.updHeaderArgs(env.tabenv, env.tablo2, env.header3, [newArg]);
	});
	
	it("return value", function() {
		assert.isTrue(res.success);
	});
	it("header updated", function() {
		assert.equal(env.header3.args.length, 1);
		assert.equal(env.header3.args[0], newArg);
	});
	it("tablo data updated", function() {
		assert.equal(
			T.getCell(env.tablo2, env.header3, 0),
			env.header3.func(T.getCell(env.tablo1, env.header2, 0))
		);
	});
	it("follows updated", function() {
		assert.equal(env.tabenv.follows.get(env.header1FullAlias).length, 0);
		assert.equal(env.tabenv.follows.get(env.header2FullAlias).length, 1);
		assert.equal(
			env.tabenv.follows.get(env.header2FullAlias)[0],
			env.header3FullAlias
		);
	});
});

describe("updHeaderFunc()", function() {
	var env, newFunc, res;
	
	before(function () {
		env = makenv2Tablo1Func1Line();
	});
	
	it("updHeaderFunc()", function() {
		newFunc = function(data) { return data + 1000 };
		res = T.updHeaderFunc(env.tabenv, env.tablo2, env.header2, newFunc);
	});
	
	it("return value", function() {
		assert.isTrue(res.success);
	});
	it("header updated", function() {
		assert.equal(env.header2.func, newFunc);
	});
	it("tablo data updated", function() {
		assert.equal(
			T.getCell(env.tablo2, env.header2, 0),
			env.header2.func(T.getCell(env.tablo1, env.header1, 0))
		);
	});
});

describe("updFuncHeaderAllCells()", function() {
	var env, res;
	
	before(function() {
		env = makenv2Tablo1Func1Line();
		env.tablo1.data[0][0] = 1000;
	});
	
	it("updFuncHeaderAllCells()", function() {
		res = T.updFuncHeaderAllCells(env.tabenv, env.tablo2, env.header2);
	});
	
	it("result value", function() {
		assert.isTrue(res.success);
	});
	it("tablo data updated", function () {
		assert.equal(
			T.getCell(env.tablo2, env.header2, 0),
			env.header2.func(T.getCell(env.tablo1, env.header1, 0))
		);
	});
});

describe("updTabloAllFuncHeadersAllCells()", function() {
	var env, res;
	
	before(function() {
		env = makenv2Tablo2Data2Func1Line();
		env.tablo1.data[0][0] = 66;
		env.tablo1.data[0][1] = 2000;
	});
	
	it("updTabloAllFuncHeadersAllCells()", function() {
		res = T.updTabloAllFuncHeadersAllCells(env.tabenv, env.tablo2);
	});
	
	it("result value", function() {
		assert.isTrue(res.success);
	});
	it("tablo data updated", function () {
		assert.equal(
			T.getCell(env.tablo2, env.header3, 0),
			env.header3.func(T.getCell(env.tablo1, env.header1, 0))
		);
		assert.equal(
			T.getCell(env.tablo2, env.header4, 0),
			env.header4.func(T.getCell(env.tablo1, env.header2, 0))
		);
	});
});

describe("updLineAllFuncCells()", function() {
	var env, res;
	
	before(function() {
		env = makenv2Tablo2Data2Func1Line();
		env.tablo1.data[0][0] = 66;
		env.tablo1.data[0][1] = 2000;
	});
	
	it("updLineAllFuncCells()", function() {
		res = T.updLineAllFuncCells(env.tabenv, env.tablo2, 0);
	});
	
	it("result value", function() {
		assert.isTrue(res.success);
	});
	it("tablo data updated", function () {
		assert.equal(
			T.getCell(env.tablo2, env.header3, 0),
			env.header3.func(T.getCell(env.tablo1, env.header1, 0))
		);
		assert.equal(
			T.getCell(env.tablo2, env.header4, 0),
			env.header4.func(T.getCell(env.tablo1, env.header2, 0))
		);
	});
});

describe("updFuncCell()", function() {
	var env, res;
	
	before(function() {
		env = makenv2Tablo1Func1Line();
		env.tablo1.data[0][0] = 1000;
	});
	
	it("updFuncCell()", function() {
		res = T.updFuncCell(env.tabenv, env.tablo2, env.header2, 0);
	});
	
	it("result value", function() {
		assert.isTrue(res.success);
	});
	it("tablo data updated", function () {
		assert.equal(
			T.getCell(env.tablo2, env.header2, 0),
			env.header2.func(T.getCell(env.tablo1, env.header1, 0))
		);
	});
});

describe("updDataCell()", function() {
	var env;
	
	before(function() {
		env = makenv1Tablo1Data1Line();
	});
	
	it("updDataCell()", function() {
		T.updDataCell(env.tabenv, env.tablo1, env.header1, 0, 1000);
	});
	
	it("tablo data updated", function () {
		assert.equal(1000, T.getCell(env.tablo1, env.header1, 0));
	});
});


describe("delTablo", function() {
	var env, res;
	
	before(function() {
		env = makenv2Tablo1Func1Line();
	});
	
	it("delTablo()", function() {
		res = T.delTablo(env.tabenv, env.tablo1);
	});
	
	it("result value", function() {
		assert.isTrue(res.success);
	});
	it("tablo deleted", function() {
		assert.isFalse(env.tabenv.tablos.has(env.tablo1.alias));
	});
	it("follows updated", function () {
		assert.isFalse(env.tabenv.follows.has(env.header1FullAlias));
	});
	it("other tablo updated", function () {
		assert.equal(env.header2.args[0].type, T.NULL_ARG);
		assert.equal(
			T.getCell(env.tablo2, env.header2, 0),
			env.header2.func(null)
		);
	});
});

describe("delHeader", function() {
	var env, res;
	
	before(function() {
		env = makenv2Tablo1Func1Line();
	});
	
	it("delHeader()", function() {
		res = T.delHeader(env.tabenv, env.tablo1, env.header1);
	});
	
	it("result value", function() {
		assert.isTrue(res.success);
	});
	it("header deleted", function() {
		assert.isEmpty(env.tablo1.headers);
	});
	it("follows updated", function () {
		assert.isFalse(env.tabenv.follows.has(env.header1FullAlias));
	});
	it("other tablo updated", function () {
		assert.equal(env.header2.args[0].type, T.NULL_ARG);
		assert.equal(
			T.getCell(env.tablo2, env.header2, 0),
			env.header2.func(null)
		);
	});
});

describe("delArgFromHeader", function() {
	var env, res;
	
	before(function() {
		env = makenv2Tablo1Func1Line();
	});
	
	it("delArgFromHeader()", function() {
		res = T.delArgFromHeader(env.tabenv, env.tablo2, env.header2, 0);
	});
	
	it("result value", function() {
		assert.isTrue(res.success);
	});
	it("arg deleted", function() {
		assert.isEmpty(env.header2.args);
	});
	it("follows updated", function () {
		assert.isEmpty(env.tabenv.follows.get(env.header1FullAlias));
	});
});

describe("delAllArgsFromHeader", function() {
	var env, res;
	
	before(function() {
		env = makenv2Tablo1Func1Line();
	});
	
	it("delAllArgsFromHeader()", function() {
		res = T.delAllArgsFromHeader(env.tabenv, env.tablo2, env.header2);
	});
	
	it("result value", function() {
		assert.isTrue(res.success);
	});
	it("arg deleted", function() {
		assert.isEmpty(env.header2.args);
	});
	it("follows updated", function () {
		assert.isEmpty(env.tabenv.follows.get(env.header1FullAlias));
	});
});