/*import { expect } from 'chai'
import { shallowMount } from '@vue/test-utils'
import HelloWorld from '@/components/HelloWorld.vue'

describe('HelloWorld.vue', () => {
  it('renders props.msg when passed', () => {
    const msg = 'new message'
    const wrapper = shallowMount(HelloWorld, {
      props: { msg }
    })
    expect(wrapper.text()).to.include(msg)
  })
})
*/

import { assert } from "chai" ;
import * as T from "@/tablos.js";

// tabenv
// tablo1 
function makenv1Tablo () {
	var tabenv = T.newTabenv();
	
	var tablo1Alias = "tablo1";
	var tablo1Label = "Tablo 1";
	var tablo1 = T.newTablo(tabenv, tablo1Alias, tablo1Label).value;

	return {
		tabenv: tabenv,
		tablo1: tablo1 
	};
};	

// makenv1Tablo
// header1 data in tablo1
// one line for header1 with cell = 33
function makenv1Tablo1Data1Line () {
	var env = makenv1Tablo();
	
	var header1Alias = "header1";
	var header1FullAlias = T.aliasesToStr(env.tablo1.alias, header1Alias);
	var header1Label = "Header 1";
	var header1 = T.newDataHeader(
		env.tabenv, env.tablo1, header1Alias, header1Label).value;
	T.newLine(env.tabenv, env.tablo1);
	T.updDataCell(env.tabenv, env.tablo1, header1, 0, 33);
		
	return {
		tabenv: env.tabenv,
		tablo1: env.tablo1,
		header1: header1, header1FullAlias: header1FullAlias
	}
}

// makenv1Tablo1Data1Line
// tablo2
// header2 func in tablo2, one arg to tablo1.header1
// one line for header2 (by reaction cell = 34)
function makenv2Tablo1Func1Line () {
	var env = makenv1Tablo1Data1Line();

	var tablo2Alias = "tablo2";
	var tablo2Label = "Tablo 2";
	var tablo2 = T.newTablo(env.tabenv, tablo2Alias, tablo2Label).value;
	
	var header2Alias = "header2";
	var header2FullAlias = T.aliasesToStr(tablo2Alias, header2Alias);
	var header2Label = "Header 2";
	var header2 = T.newFuncHeader(
		env.tabenv, tablo2, header2Alias, header2Label,
		[ T.newColSamelineArg(env.tablo1.alias, env.header1.alias) ],
		function (data) { return data + 1 }
	).value;
	T.newLine(env.tabenv, tablo2);
	
	return {
		tabenv: env.tabenv,
		tablo1: env.tablo1, tablo2: tablo2,
		header1: env.header1, header1FullAlias: env.header1FullAlias,
		header2: header2, header2FullAlias: header2FullAlias
	};
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

	var tabenv, tabloAlias, tablo, funcHeader, 
		dataHeaderFullAlias, funcHeaderFullAlias, arg, res;

	before(function () {
		tabloAlias = "tablo1";
		var dataHeaderAlias ="dataheader1";
		var funcHeaderAlias = "funcheader1";
		dataHeaderFullAlias = T.aliasesToStr(tabloAlias, dataHeaderAlias);
		funcHeaderFullAlias = T.aliasesToStr(tabloAlias, funcHeaderAlias);
		var funcFunc = function () { return null };
		tabenv = T.newTabenv ();
		tablo = T.newTablo(tabenv, tabloAlias, "Tablo 1").value;
		var dataHeader = T.newDataHeader(
			tabenv, tablo, dataHeaderAlias, "Data Header 1"
		).value;
		funcHeader = T.newFuncHeader(
			tabenv, tablo, funcHeaderAlias, "Func Header 1", [], funcFunc
		).value;
		arg = T.newColSamelineArg(tabloAlias, dataHeaderAlias);
	});
		
	it("newHeaderArg()", function () {
		res = T.newHeaderArg(tabenv, tablo, funcHeader, arg);
	});
	
	it("return value", function () {
		assert.isTrue(res.success);
	});
	it("header updated", function () {
		assert.equal(funcHeader.args.length, 1);
		assert.equal(funcHeader.args[0], arg);
	});
	it("follows udpated", function () {
		assert.equal(tabenv.follows.get(dataHeaderFullAlias).length, 1);
		assert.equal(
			tabenv.follows.get(dataHeaderFullAlias)[0], 
			funcHeaderFullAlias);
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
	var tablo, header, numLine, cell, val;
	
	before(function () {
		var tabloAlias = "tablo1";
		var headerAlias ="dataheader1";
		var tabenv = T.newTabenv ();
		tablo = T.newTablo(tabenv, tabloAlias, "Tablo 1").value;
		header = T.newDataHeader(
			tabenv, tablo, headerAlias, "Data Header 1"
		).value;
		numLine = 0;
		T.newLine(tabenv, tablo);
		val = 33;
		T.updDataCell(tabenv, tablo, header, numLine, val);
	});
	
	it("getCell()", function() {
		cell = T.getCell(tablo, header, numLine);
	});
	
	it("return value", function () {
		assert.equal(cell, val);
	});
});

describe("getCellByAliases()", function() {
	var tabenv, tabloAlias, headerAlias, numLine, res, val;
	
	before(function () {
		tabloAlias = "tablo1";
		headerAlias ="dataheader1";
		tabenv = T.newTabenv ();
		var tablo = T.newTablo(tabenv, tabloAlias, "Tablo 1").value;
		var dataHeader = T.newDataHeader(
			tabenv, tablo, headerAlias, "Data Header 1"
		).value;
		numLine = 0;
		T.newLine(tabenv, tablo);
		val = 33;
		T.updDataCell(tabenv, tablo, dataHeader, numLine, val);
	});
	
	it("getCellByAliases()", function() {
		res = T.getCellByAliases(tabenv, tabloAlias, headerAlias, numLine);
	});
	
	it("return value", function () {
		assert.isTrue(res.success);
		assert.equal(res.value, val);
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

		var env, newHeader1Alias, res;

		before(function() { 
			env = makenv2Tablo1Func1Line() 
			newHeader1Alias = "newheader1";
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
			var oldHeader1FullAlias = env.header1FullAlias;
			var newHeader1FullAlias = 
				T.aliasesToStr(env.tablo1.alias, newHeader1Alias);
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
		var env, newHeader2Alias, res;

		before(function() { 
			env = makenv2Tablo1Func1Line() 
			newHeader2Alias = "newheader2";
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
			var oldHeader2FullAlias = env.header2FullAlias;
			var newHeader2FullAlias = 
				T.aliasesToStr(env.tablo2.alias, newHeader2Alias);
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

	before(function() { env = makenv2Tablo1Func1Line() });

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
	var tabenv, tablo1, header2, res;

	before(function() {
		tabenv = T.newTabenv();
		tablo1 = T.newTablo(tabenv, "tablo1", "Tablo 1").value;
		var header1 = 
			T.newDataHeader(tabenv, tablo1, "header1", "Header 1").value;
		T.newLine(tabenv, tablo1);
		T.updDataCell(tabenv, tablo1, header1, 0, 33);
		header2 = T.newFuncHeader(tabenv, tablo1, "header2", "Header 2",
			[ T.newColSamelineArg("tablo1", "header1") ],
			function (data) { return data }
		).value;
		T.newLine(tabenv, tablo1);
	});

	it("updHeaderType()", function() {
		res = T.updHeaderType(tabenv, tablo1, header1, T.FUNC_HEADER);
	});
	
	it("result value", function() {
		assert.isTrue(res.success);
	});
	it("header updated", function() {
		assert.equal(header1.type, T.FUNC_HEADER);
		assert.equal(header1.args.length, 0);
		assert.equal(typeof header1.func, "function");
	});
	it("tablo data updated", function() {
		assert.equal(T.getCell(tablo1, header1, 0), null);
	});
});