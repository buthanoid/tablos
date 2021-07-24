import { assert } from "chai" ;
import * as T from "@/tablos.js";

// tabenv
// tablo1 
function makenv1Tablo () {
	var env = {};

	env.tabenv = T.newTabenv();
	
	var tablo1Alias = "tablo1";
	var tablo1Label = "Tablo 1";
	env.tablo1 = T.newTablo(env.tabenv, tablo1Alias, tablo1Label);

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
		env.tabenv, env.tablo1, header1Alias, header1Label, 
		T.HEADER.DATA_TYPE.INT);
	T.newLine(env.tabenv, env.tablo1);
	T.updDataCell(env.tablo1, env.header1, 0, 33);
		
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
	env.tablo2 = T.newTablo(env.tabenv, tablo2Alias, tablo2Label);
	
	var header2Alias = "header2";
	var header2Label = "Header 2";
	env.header2FullAlias = T.aliasesToStr(tablo2Alias, header2Alias);
	env.header2 = T.newFuncHeader(
		env.tabenv, env.tablo2, header2Alias, header2Label,
		[ T.newColSamelineArg(env.tablo1.alias, env.header1.alias) ],
		function (data) { return data + 1 }
	);
	T.newLine(env.tabenv, env.tablo2);
	
	return env;
}

function makenv1Tablo2Data1Line () {
	var env = makenv1Tablo1Data1Line();
	var header2Alias = "header2";
	var header2Label = "Header 2";
	env.header2FullAlias = T.aliasesToStr(env.tablo1.alias, header2Alias);
	env.header2 = T.newDataHeader(
		env.tabenv, env.tablo1, header2Alias, header2Label,
		T.HEADER.DATA_TYPE.INT
	);
	T.updDataCell(env.tablo1, env.header2, 0, 1000);
	return env;
}

function makenv2Tablo2Data1Func1Line () {
	var env = makenv1Tablo2Data1Line ();
	
	var tablo2Alias = "tablo2";
	var tablo2Label = "Tablo 2";
	env.tablo2 = T.newTablo(env.tabenv, tablo2Alias, tablo2Label);
	
	var header3Alias = "header3";
	var header3Label = "Header 3";
	env.header3FullAlias = T.aliasesToStr(tablo2Alias, header3Alias);
	env.header3 = T.newFuncHeader(
		env.tabenv, env.tablo2, header3Alias, header3Label,
		[ T.newColSamelineArg(env.tablo1.alias, env.header1.alias) ],
		function (data) { return data + 1 }
	);
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
	);
	
	return env;
}


// ================= UTILITIES =======================

describe ("parseStrToFunction", function () {

	var strFunc, parsedFunc ;
	
	before(function() {
		strFunc = "function (x, y) { var z = 3 ; return x + y + z ; }";
	});

	it("parseStrToFunction()", function () {
		parsedFunc = T.parseStrToFunction(strFunc);
	});

	it("result value", function () {
		assert.equal(typeof parsedFunc, "function");
		assert.equal(parsedFunc(10, 100), 113);
	});
});

describe ("parseStrToFunction PARSE_ERROR", function () {

	var strFunc, err ;
	
	before(function() {
		strFunc = "function (x, y) { var z = 3 return x + y + z ; }";
	});

	it("parseStrToFunction()", function () {
		try { T.parseStrToFunction(strFunc) }
		catch (e) { err = e }
	});

	it("error thrown", function () {
		assert.equal(err.type, T.ERR.FUNCTION_PARSE_ERROR);
	});

});

describe ("parseStrToFunction BAD_CONTENT", function () {

	var strFunc, err ;
	
	before(function() {
		strFunc = "33";
	});

	it("parseStrToFunction()", function () {
		try { T.parseStrToFunction(strFunc) }
		catch (e) { err = e }
	});

	it("error thrown", function () {
		assert.equal(err.type, T.ERR.HEADER.FUNCTION.BAD_CONTENT);
	});

});

describe ("aliasObjToStr", function () {

	var obj, str ;
	
	before(function() {
		obj = { tablo: "tablo1", header: "header1" };
	});

	it("aliasObjToStr()", function () {
		str = T.aliasObjToStr(obj);
	});

	it("error thrown", function () {
		assert.equal(str, T.aliasesToStr("tablo1", "header1"));
	});

});

describe ("aliasesToStr", function () {

	var tabloAlias, headerAlias, str ;
	
	before(function() {
		tabloAlias = "tablo1";
		headerAlias = "header1";
	});

	it("aliasesToStr()", function () {
		str = T.aliasesToStr(tabloAlias, headerAlias);
	});

	it("error thrown", function () {
		assert.equal(str, T.aliasesToStr("tablo1", "header1"));
	});
});

describe ("aliasObjFromStr", function () {

	var obj, str ;
	
	before(function() {
		str = T.aliasesToStr("tablo1", "header1");
	});

	it("aliasObjFromStr()", function () {
		obj = T.aliasObjFromStr(str);
	});

	it("error thrown", function () {
		assert.equal(obj.tablo, "tablo1");
		assert.equal(obj.header, "header1");
	});
});

describe ("aliasesToObj", function () {

	var tabloAlias, headerAlias, obj ;
	
	before(function() {
		tabloAlias = "tablo1";
		headerAlias = "header1";
	});

	it("aliasesToObj()", function () {
		obj = T.aliasesToObj(tabloAlias, headerAlias);
	});

	it("error thrown", function () {
		assert.equal(obj.tablo, "tablo1");
		assert.equal(obj.header, "header1");
	});
});

describe ("arrayMove to right", function () {

	var array ;
	
	before(function() {
		array = [ 'A', 'B', 'C', 'D', 'E' ];
	});

	it("arrayMove()", function () {
		T.arrayMove(array, 1, 3);
	});

	it("array updated", function () {
		assert.isTrue(array.every(function (elt, index) {
			return elt == [ 'A', 'C', 'D', 'B', 'E' ][index] ;
		}));
	});
});

describe ("arrayMove to left", function () {

	var array ;
	
	before(function() {
		array = [ 'A', 'B', 'C', 'D', 'E' ];
	});

	it("arrayMove()", function () {
		T.arrayMove(array, 3, 1);
	});

	it("array updated", function () {
		assert.isTrue(array.every(function (elt, index) {
			return elt == [ 'A', 'D', 'B', 'C', 'E' ][index] ;
		}));
	});
});

describe ("arrayMove to right extreme", function () {

	var array ;
	
	before(function() {
		array = [ 'A', 'B', 'C', 'D', 'E' ];
	});

	it("arrayMove()", function () {
		T.arrayMove(array, 0, 4);
	});

	it("array updated", function () {
		assert.isTrue(array.every(function (elt, index) {
			return elt == [ 'B', 'C', 'D', 'E', 'A' ][index] ;
		}));
	});
});

describe ("arrayMove to left extreme", function () {

	var array ;
	
	before(function() {
		array = [ 'A', 'B', 'C', 'D', 'E' ];
	});

	it("arrayMove()", function () {
		T.arrayMove(array, 4, 0);
	});

	it("array updated", function () {
		assert.isTrue(array.every(function (elt, index) {
			return elt == [ 'E', 'A', 'B', 'C', 'D' ][index] ;
		}));
	});
});

describe ("arrayMove same place", function () {

	var array ;
	
	before(function() {
		array = [ 'A', 'B', 'C', 'D', 'E' ];
	});

	it("arrayMove()", function () {
		T.arrayMove(array, 2, 2);
	});

	it("array updated", function () {
		assert.isTrue(array.every(function (elt, index) {
			return elt == [ 'A', 'B', 'C', 'D', 'E' ][index] ;
		}));
	});
});

describe ("newNode", function () {

	var node, data, childs ;
	
	before(function() {
		data = "data";
		childs = [];
	});

	it("newNode()", function () {
		node = T.newNode(data, childs);
	});

	it("return value", function () {
		assert.equal(node.data, data);
		assert.equal(node.childs, childs);
	});
});

describe ("treeForEachDeepFirst", function () {

	var dataList, dataTree ;
	
	before(function() {
		dataList = [];
		dataTree = 
			T.newNode('A', [
				T.newNode('B', [
					T.newNode('C', []),
					T.newNode('D', [])
				]),
				T.newNode('E', [])
			]);
	});

	it("treeForEachDeepFirst()", function () {
		T.treeForEachDeepFirst(dataTree, function (data) {
			dataList.push(data);
		});
	});

	it("dataList", function () {
		assert.isTrue(dataList.every(function (elt, index) {
			return elt == ['A','B','C','D','E'][index] ;
		}));
	});
});

describe ("newErr", function () {

	var err, type, data;
	
	before(function() {
		type = "type";
		data = "data";
	});

	it("newErr()", function () {
		err = T.newErr(type, data);
	});

	it("return value", function () {
		assert.equal(err.type, type);
		assert.equal(err.data, data);
	});
});

describe ("isJSON", function () {

	var res1, res2, res3, res4, res5, res6, res7, res8, res9, res10,
		json1, json2, json3, json4, json5, json6, json7, json8, json9, json10;
	
	before(function() {
		json1 = "toto" ;
		json2 = 33 ;
		json3 = true;
		json4 = null ;
		json5 = [ "toto", 33 ];
		json6 = [ "toto", undefined, 33 ];
		json7 = { x: "toto", y: 33 };
		json8 = { x: "toto", y: undefined, z: 33 };
		json9 = new Set();
		json10 = undefined;
	});

	it("isJSON()", function () {
		res1 = T.isJSON(json1);
		res2 = T.isJSON(json2);
		res3 = T.isJSON(json3);
		res4 = T.isJSON(json4);
		res5 = T.isJSON(json5);
		res6 = T.isJSON(json6);
		res7 = T.isJSON(json7);
		res8 = T.isJSON(json8);
		res9 = T.isJSON(json9);
		res10 = T.isJSON(json10);
	});

	it("return value", function () {
		assert.isTrue(res1);
		assert.isTrue(res2);
		assert.isTrue(res3);
		assert.isTrue(res4);
		assert.isTrue(res5);
		assert.isFalse(res6);
		assert.isTrue(res7);
		assert.isFalse(res8);
		assert.isFalse(res9);
		assert.isFalse(res10);
	});
});

// ==================== REACTS FUNCTIONS =======================

describe ("checkIsReactMap", function () {
	var res, reactMap ;
	
	before(function() {
		reactMap = T.newReactMap();
	});
	
	it("checkIsReactMap()", function() {
		res = T.checkIsReactMap(reactMap);
	});
	
	it("result value", function() {
		assert.isEmpty(res);
	});
});

describe ("checkIsReactMap BAD_CONTENT", function () {
	var errs, reactMap ;
	
	before(function() {
		reactMap = new Set();
	});
	
	it("checkIsReactMap()", function() {
		errs = T.checkIsReactMap(reactMap);
	});
	
	it("result value", function() {
		assert.equal(errs[0].type, T.ERR.REACT_MAP.BAD_CONTENT);
	});
});

describe ("newReactMap", function () {
	var reactMap ;
	
	it("newReactMap()", function() {
		reactMap = T.newReactMap();
	});
	
	it("result value", function() {
		assert.equal(Object.getPrototypeOf(reactMap), Map.prototype);
		assert.isEmpty(reactMap);
	});
});

describe ("newReactKey", function () {
	var reactMap, reactKey1;
	
	before(function() {
		reactKey1 = "key1";
		reactMap = T.newReactMap();
	});
	
	it("newReactKey()", function() {
		T.newReactKey(reactMap, reactKey1);
	});
	
	it("reactMap updated", function() {
		assert.isTrue(reactMap.has(reactKey1));
		assert.equal(reactMap.get(reactKey1).__proto__, Set.prototype);
	});
});

describe ("checkNewReaction", function () {
	var reactMap, key1, key2, key3, errs;
	
	before(function() {
		key1 = "key1";
		key2 = "key2";
		key3 = "key3";
		reactMap = T.newReactMap();
		T.newReactKey(reactMap, key1);
		T.newReactKey(reactMap, key2);
		T.newReactKey(reactMap, key3);
		T.newReaction(reactMap, key1, key2);
	});
	
	it("checkNewReaction()", function() {
		errs = T.checkNewReaction(reactMap, key2, key3);
	});
	
	it("reactMap updated", function() {
		assert.isEmpty(errs);
	});
});

describe ("checkNewReaction several childs", function () {
	var reactMap, key1, key2, key3, key4, errs;
	
	before(function() {
		key1 = "key1";
		key2 = "key2";
		key3 = "key3";
		key4 = "key4";
		reactMap = T.newReactMap();
		T.newReactKey(reactMap, key1);
		T.newReactKey(reactMap, key2);
		T.newReactKey(reactMap, key3);
		T.newReactKey(reactMap, key4);
		T.newReaction(reactMap, key1, key2);
		T.newReaction(reactMap, key2, key3);
		T.newReaction(reactMap, key1, key3);
	});
	
	it("checkNewReaction()", function() {
		errs = T.checkNewReaction(reactMap, key3, key4);
	});
	
	it("reactMap updated", function() {
		assert.isEmpty(errs);
	});
});

describe ("checkNewReaction loop of length 1", function () {
	var reactMap, key1, errs;
	
	before(function() {
		key1 = "key1";
		reactMap = T.newReactMap();
		T.newReactKey(reactMap, key1);
	});
	
	it("checkNewReaction()", function() {
		errs = T.checkNewReaction(reactMap, key1, key1);
	});
	
	it("reactMap updated", function() {
		assert.equal(errs[0].type, T.ERR.REACT_MAP.LOOP);
		assert.isTrue(errs[0].data.sequence.every(function(elt, index) {
			return elt == [key1,key1][index] ;
		}));
	});
});

describe ("checkNewReaction loop of length 2", function () {
	var reactMap, key1, key2, key3, errs;
	
	before(function() {
		key1 = "key1";
		key2 = "key2";
		key3 = "key3";
		reactMap = T.newReactMap();
		T.newReactKey(reactMap, key1);
		T.newReactKey(reactMap, key2);
		T.newReactKey(reactMap, key3);
		T.newReaction(reactMap, key1, key2);
		T.newReaction(reactMap, key2, key3);
	});
	
	it("checkNewReaction()", function() {
		errs = T.checkNewReaction(reactMap, key3, key1);
	});
	
	it("reactMap updated", function() {
		assert.equal(errs[0].type, T.ERR.REACT_MAP.LOOP);
		assert.isTrue(errs[0].data.sequence.every(function(elt, index) {
			return elt == [key3,key1,key2,key3][index] ;
		}));
	});
});

describe ("checkNewReaction loop of length 3", function () {
	var reactMap, key1, key2, errs;
	
	before(function() {
		key1 = "key1";
		key2 = "key2";
		reactMap = T.newReactMap();
		T.newReactKey(reactMap, key1);
		T.newReactKey(reactMap, key2);
		T.newReaction(reactMap, key1, key2);
	});
	
	it("checkNewReaction()", function() {
		errs = T.checkNewReaction(reactMap, key2, key1);
	});
	
	it("reactMap updated", function() {
		assert.equal(errs[0].type, T.ERR.REACT_MAP.LOOP);
		assert.isTrue(errs[0].data.sequence.every(function(elt, index) {
			return elt == [key2,key1,key2][index] ;
		}));
	});
});

describe ("checkNewReaction KEY.NOT_FOUND", function () {
	var reactMap, key1, key2, errs;
	
	before(function() {
		key1 = "key1";
		key2 = "key2";
		reactMap = T.newReactMap();
		T.newReactKey(reactMap, key1);
	});
	
	it("checkNewReaction()", function() {
		errs = T.checkNewReaction(reactMap, key1, key2);
	});
	
	it("reactMap updated", function() {
		assert.equal(errs[0].type, T.ERR.REACT_MAP.KEY.NOT_FOUND);
		assert.equal(errs[0].data.key, key2);
	});
});

describe ("checkNewReaction KEY.NOT_FOUND (2)", function () {
	var reactMap, key1, errs;
	
	before(function() {
		key1 = "key1";
		reactMap = T.newReactMap();
	});
	
	it("checkNewReaction()", function() {
		errs = T.checkNewReaction(reactMap, key1, key1);
	});
	
	it("reactMap updated", function() {
		assert.equal(errs[0].type, T.ERR.REACT_MAP.KEY.NOT_FOUND);
		assert.equal(errs[0].data.key, key1);
	});
});

describe ("newReaction", function () {
	var reactMap, reactKey1, reaction1;
	
	before(function() {
		reactKey1 = "key1";
		reactMap = T.newReactMap();
		T.newReactKey(reactMap, reactKey1);
		reaction1 = "reaction1";
	});
	
	it("newReaction()", function() {
		T.newReaction(reactMap, reactKey1, reaction1);
	});
	
	it("reactMap updated", function() {
		assert.isTrue(reactMap.get(reactKey1).has(reaction1));
	});
});

describe ("newReaction with bad reactKey", function () {
	var reactMap, reactKey1, badReactKey1, reaction1;
	
	before(function() {
		reactKey1 = "key1";
		badReactKey1 = "badkey1";
		reactMap = T.newReactMap();
		T.newReactKey(reactMap, reactKey1);
		reaction1 = "reaction1";
	});
	
	it("newReaction()", function() {
		T.newReaction(reactMap, badReactKey1, reaction1);
	});
	
	it("reactMap not updated", function() {
		assert.isFalse(T.hasReaction(reactMap, reactKey1, reaction1));
	});
});

describe ("hasReactKey", function () {
	var reactMap, reactKey1, result;
	
	before(function() {
		reactKey1 = "key1";
		reactMap = T.newReactMap();
		T.newReactKey(reactMap, reactKey1);
	});
	
	it("hasReactKey()", function() {
		result = T.hasReactKey(reactMap, reactKey1);
	});
	
	it("result value", function() {
		assert.isTrue(result);
	});
});

describe ("hasReactKey false", function () {
	var reactMap, reactKey1, result;
	
	before(function() {
		reactKey1 = "key1";
		reactMap = T.newReactMap();
	});
	
	it("hasReactKey()", function() {
		result = T.hasReactKey(reactMap, reactKey1);
	});
	
	it("result value", function() {
		assert.isFalse(result);
	});
});

describe ("hasReaction", function () {
	var reactMap, reactKey1, reaction1, result;
	
	before(function() {
		reactKey1 = "key1";
		reactMap = T.newReactMap();
		T.newReactKey(reactMap, reactKey1);
		reaction1 = "reaction1";
		T.newReaction(reactMap, reactKey1, reaction1);
	});
	
	it("hasReaction()", function() {
		result = T.hasReaction(reactMap, reactKey1, reaction1);
	});
	
	it("result value", function() {
		assert.isTrue(result);
	});
});

describe ("hasReaction false", function () {
	var reactMap, reactKey1, reaction1, result;
	
	before(function() {
		reactKey1 = "key1";
		reactMap = T.newReactMap();
		T.newReactKey(reactMap, reactKey1);
		reaction1 = "reaction1";
	});
	
	it("hasReaction()", function() {
		result = T.hasReaction(reactMap, reactKey1, reaction1);
	});
	
	it("result value", function() {
		assert.isFalse(result);
	});
});

describe ("hasReaction false", function () {
	var reactMap, reactKey1, reaction1, result;
	
	before(function() {
		reactKey1 = "key1";
		reactMap = T.newReactMap();
		reaction1 = "reaction1";
	});
	
	it("hasReaction()", function() {
		result = T.hasReaction(reactMap, reactKey1, reaction1);
	});
	
	it("result value", function() {
		assert.isFalse(result);
	});
});

describe ("getReactions", function () {
	var reactMap, reactKey1, reaction1, reactions;
	
	before(function() {
		reactKey1 = "key1";
		reactMap = T.newReactMap();
		T.newReactKey(reactMap, reactKey1);
		reaction1 = "reaction1";
		T.newReaction(reactMap, reactKey1, reaction1);
	});
	
	it("getReactions()", function() {
		reactions = T.getReactions(reactMap, reactKey1, reaction1);
	});
	
	it("result value", function() {
		assert.equal(Object.getPrototypeOf(reactions), Set.prototype);
		assert.equal(reactions.size, 1);
		assert.isTrue(reactions.has(reaction1));
	});
});

describe ("getReactionsTree", function () {
	var reactMap, key1, key2, key3, key4, tree;
	
	before(function() {
		key1 = "key1";
		key2 = "key2";
		key3 = "key3";
		key4 = "key4";
		reactMap = T.newReactMap();
		T.newReactKey(reactMap, key1);
		T.newReactKey(reactMap, key2);
		T.newReactKey(reactMap, key3);
		T.newReactKey(reactMap, key4);
		T.newReaction(reactMap, key1, key2);
		T.newReaction(reactMap, key1, key3);
		T.newReaction(reactMap, key2, key3);
		T.newReaction(reactMap, key3, key4);
	});
	
	it("getReactionsTree()", function() {
		tree = T.getReactionsTree(reactMap, key1);
	});
	
	it("result value", function() {
		assert.equal(tree.data, key1);
		assert.equal(tree.childs[0].data, key2);
		assert.equal(tree.childs[1].data, key3);
		assert.equal(tree.childs[0].childs[0].data, key3);
		assert.equal(tree.childs[1].childs[0].data, key4);
		assert.equal(tree.childs[0].childs[0].childs[0].data, key4);
	});
});

describe ("getReactKeysFromReaction", function () {
	var reactMap, reactKey1, reactKey2, reaction1, keys;
	
	before(function() {
		reactKey1 = "key1";
		reactKey2 = "key2";
		reactMap = T.newReactMap();
		T.newReactKey(reactMap, reactKey1);
		T.newReactKey(reactMap, reactKey2);
		reaction1 = "reaction1";
		T.newReaction(reactMap, reactKey1, reaction1);
		T.newReaction(reactMap, reactKey2, reaction1);
	});
	
	it("getReactKeysFromReaction()", function() {
		keys = T.getReactKeysFromReaction(reactMap, reaction1);
	});
	
	it("result value", function() {
		assert.equal(2, keys.size);
		assert.isTrue(keys.has(reactKey1));
		assert.isTrue(keys.has(reactKey2));
	});
});

describe("updReactKey", function () {
	var reactMap, reactKey1, newReactKey1, reaction1;
	
	before(function() {
		reactKey1 = "key1";
		newReactKey1 = "newkey1";
		reactMap = T.newReactMap();
		T.newReactKey(reactMap, reactKey1);
		reaction1 = "reaction1";
		T.newReaction(reactMap, reactKey1, reaction1);
	});
	
	it("updReactKey()", function() {
		T.updReactKey(reactMap, reactKey1, newReactKey1);
	});
	
	it("reactMap updated", function () {
		assert.isFalse(T.hasReactKey(reactMap, reactKey1));
		assert.isTrue(T.hasReactKey(reactMap, newReactKey1));
		assert.isTrue(T.hasReaction(reactMap, newReactKey1, reaction1));
	});	
});

describe ("delReactKey", function () {
	var reactMap, reactKey1, reaction1;
	
	before(function() {
		reactKey1 = "key1";
		reactMap = T.newReactMap();
		T.newReactKey(reactMap, reactKey1);
		reaction1 = "reaction1";
		T.newReaction(reactMap, reactKey1, reaction1);
	});
	
	it("delReactKey()", function() {
		T.delReactKey(reactMap, reactKey1);
	});
	
	it("reactMap updated", function () {
		assert.isFalse(T.hasReactKey(reactMap, reactKey1));
	});
});

describe ("delReaction", function () {
	var reactMap, reactKey1, reaction1;
	
	before(function() {
		reactKey1 = "key1";
		reactMap = T.newReactMap();
		T.newReactKey(reactMap, reactKey1);
		reaction1 = "reaction1";
		T.newReaction(reactMap, reactKey1, reaction1);
	});
	
	it("delReaction()", function() {
		T.delReaction(reactMap, reactKey1, reaction1);
	});
	
	it("reactMap updated", function () {
		assert.isFalse(
			T.hasReaction(reactMap, reactKey1, reaction1)
		);
	});
});

describe ("delReactionFromAllKeys", function () {
	var reactMap, reactKey1, reactKey2, reaction1;
	
	before(function() {
		reactKey1 = "key1";
		reactKey1 = "key2";
		reactMap = T.newReactMap();
		T.newReactKey(reactMap, reactKey1);
		T.newReactKey(reactMap, reactKey2);
		reaction1 = "reaction1";
		T.newReaction(reactMap, reactKey1, reaction1);
		T.newReaction(reactMap, reactKey2, reaction1);
	});
	
	it("delReactionFromAllKeys()", function() {
		T.delReactionFromAllKeys(reactMap, reaction1);
	});
	
	it("reactMap updated", function () {
		assert.isFalse(
			T.hasReaction(reactMap, reactKey1, reaction1)
		);
		assert.isFalse(
			T.hasReaction(reactMap, reactKey2, reaction1)
		);
	});
});

// ==================== NEW FUNCTIONS =======================

describe("checkIsTabenv", function () {
	var tabenv, errs;

	before(function() {
		tabenv = T.newTabenv ();
	});
	
	it("checkIsTabenv()", function () {
		errs = T.checkIsTabenv(tabenv);
	});
	
	it("return value", function () {	
		assert.isEmpty(errs);
	});
});

describe("checkIsTabenv BAD_CONTENT", function () {
	var tabenv, errs;

	before(function() {
		tabenv = new Set();
	});
	
	it("checkIsTabenv()", function () {
		errs = T.checkIsTabenv(tabenv);
	});
	
	it("return value", function () {	
		assert.equal(errs[0].type, T.ERR.TABENV.BAD_CONTENT);
	});
});

describe("newTabenv", function () {
	var tabenv;

	before(function() {});
	
	it("newTabenv()", function () {
		tabenv = T.newTabenv();
	});
	
	it("return value", function () {	
		assert.isEmpty(tabenv.tablos);
		assert.isEmpty(tabenv.reactMap);
	});
});

describe("checkTabloAlias", function () {
	var alias1, alias2, alias3, errs1, errs2, errs3;

	before(function() {
		alias1 = "alias1";
		alias2 = 33;
		alias3 = "";
	});
	
	it("checkTabloAlias()", function () {
		errs1 = T.checkTabloAlias(alias1);
		errs2 = T.checkTabloAlias(alias2);
		errs3 = T.checkTabloAlias(alias3);
	});
	
	it("return value", function () {	
		assert.isEmpty(errs1);
		assert.equal(errs2[0].type, T.ERR.TABLO.ALIAS.BAD_CONTENT);
		assert.equal(errs3[0].type, T.ERR.TABLO.ALIAS.EMPTY);
	});
});

describe("checkTabloLabel", function () {
	var label1, label2, label3, errs1, errs2, errs3;

	before(function() {
		label1 = "label1";
		label2 = 33;
		label3 = "";
	});
	
	it("checkTabloLabel()", function () {
		errs1 = T.checkTabloLabel(label1);
		errs2 = T.checkTabloLabel(label2);
		errs3 = T.checkTabloLabel(label3);
	});
	
	it("return value", function () {	
		assert.isEmpty(errs1);
		assert.equal(errs2[0].type, T.ERR.TABLO.LABEL.BAD_CONTENT);
		assert.equal(errs3[0].type, T.ERR.TABLO.LABEL.EMPTY);
	});
});

describe("checkNewTablo", function () {
	var tabenv, alias, label, errs;

	before(function() {
		tabenv = T.newTabenv();
		alias = "alias1";
		label = "label1";
	});
	
	it("checkNewTablo()", function () {
		errs = T.checkNewTablo(tabenv, alias, label);
	});
	
	it("return value", function () {	
		assert.isEmpty(errs);
	});
});

describe("checkNewTablo fail alias", function () {
	var tabenv, alias, label, errs;

	before(function() {
		tabenv = T.newTabenv();
		alias = "";
		label = "label1";
	});
	
	it("checkNewTablo()", function () {
		errs = T.checkNewTablo(tabenv, alias, label);
	});
	
	it("return value", function () {	
		assert.equal(errs[0].type, T.ERR.TABLO.ALIAS.EMPTY);
	});
});

describe("checkNewTablo fail label", function () {
	var tabenv, alias, label, errs;

	before(function() {
		tabenv = T.newTabenv();
		alias = "alias1";
		label = "";
	});
	
	it("checkNewTablo()", function () {
		errs = T.checkNewTablo(tabenv, alias, label);
	});
	
	it("return value", function () {	
		assert.equal(errs[0].type, T.ERR.TABLO.LABEL.EMPTY);
	});
});

describe("checkNewTablo existing alias", function () {
	var tabenv, alias1, label1, alias2, label2, errs;

	before(function() {
		tabenv = T.newTabenv();
		alias1 = "alias1";
		alias2 = "alias1";
		label1 = "label1";
		label2 = "label2";
		T.newTablo(tabenv, alias1, label1);
	});
	
	it("checkNewTablo()", function () {
		errs = T.checkNewTablo(tabenv, alias2, label2);
	});
	
	it("return value", function () {	
		assert.equal(errs[0].type, T.ERR.TABLO.ALIAS.EXISTING);
	});
});

describe("newTablo", function () {

	var tabenv, tablo, tabloAlias, tabloLabel;

	before(function() {
		tabloAlias = "tablo1";
		tabloLabel = "Tablo 1";
		tabenv = T.newTabenv ();
	});
	
	it("newTablo()", function () {
		tablo = T.newTablo(tabenv, tabloAlias, tabloLabel);
	});
	
	it("return value", function () {	
		assert.equal(tablo.alias, tabloAlias);
		assert.equal(tablo.label, tabloLabel); 
	});
	it("tabenv udpated", function () {
		assert.equal(tabenv.tablos.get(tabloAlias), tablo)
	});
});

describe("checkHeaderAlias", function () {
	var alias1, alias2, alias3, errs1, errs2, errs3;

	before(function() {
		alias1 = "alias1";
		alias2 = 33;
		alias3 = "";
	});
	
	it("checkHeaderAlias()", function () {
		errs1 = T.checkHeaderAlias(alias1);
		errs2 = T.checkHeaderAlias(alias2);
		errs3 = T.checkHeaderAlias(alias3);
	});
	
	it("return value", function () {	
		assert.isEmpty(errs1);
		assert.equal(errs2[0].type, T.ERR.HEADER.ALIAS.BAD_CONTENT);
		assert.equal(errs3[0].type, T.ERR.HEADER.ALIAS.EMPTY);
	});
});

describe("checkHeaderLabel", function () {
	var label1, label2, label3, errs1, errs2, errs3;

	before(function() {
		label1 = "label1";
		label2 = 33;
		label3 = "";
	});
	
	it("checkHeaderLabel()", function () {
		errs1 = T.checkHeaderLabel(label1);
		errs2 = T.checkHeaderLabel(label2);
		errs3 = T.checkHeaderLabel(label3);
	});
	
	it("return value", function () {	
		assert.isEmpty(errs1);
		assert.equal(errs2[0].type, T.ERR.HEADER.LABEL.BAD_CONTENT);
		assert.equal(errs3[0].type, T.ERR.HEADER.LABEL.EMPTY);
	});
});

describe("checkHeaderType", function () {
	var type1, type2, errs1, errs2;

	before(function() {
		type1 = T.HEADER.TYPE.DATA;
		type2 = null;
	});
	
	it("checkHeaderType()", function () {
		errs1 = T.checkHeaderType(type1);
		errs2 = T.checkHeaderType(type2);
	});
	
	it("return value", function () {	
		assert.isEmpty(errs1);
		assert.equal(errs2[0].type, T.ERR.HEADER.TYPE.UNKNOWN);
	});
});

describe("checkNewHeader", function () {
	var tabenv, tablo, alias, label, type, errs;

	before(function() {
		tabenv = T.newTabenv();
		tablo = T.newTablo(tabenv, "tablo1", "Tablo 1");
		alias = "header1";
		label = "Header 1";
		type = T.HEADER.TYPE.DATA;
	});
	
	it("checkNewHeader()", function () {
		errs = T.checkNewHeader(tabenv, tablo, alias, label, type);
	});
	
	it("return value", function () {	
		assert.isEmpty(errs);
	});
});

describe("checkNewHeader fail alias", function () {
	var tabenv, tablo, alias, label, type, errs;

	before(function() {
		tabenv = T.newTabenv();
		tablo = T.newTablo(tabenv, "tablo1", "Tablo 1");
		alias = "";
		label = "Header 1";
		type = T.HEADER.TYPE.DATA;
	});
	
	it("checkNewHeader()", function () {
		errs = T.checkNewHeader(tabenv, tablo, alias, label, type);
	});
	
	it("return value", function () {	
		assert.equal(errs[0].type, T.ERR.HEADER.ALIAS.EMPTY);
	});
});

describe("checkNewHeader fail label", function () {
	var tabenv, tablo, alias, label, type, errs;

	before(function() {
		tabenv = T.newTabenv();
		tablo = T.newTablo(tabenv, "tablo1", "Tablo 1");
		alias = "header1";
		label = "";
		type = T.HEADER.TYPE.DATA;
	});
	
	it("checkNewHeader()", function () {
		errs = T.checkNewHeader(tabenv, tablo, alias, label, type);
	});
	
	it("return value", function () {	
		assert.equal(errs[0].type, T.ERR.HEADER.LABEL.EMPTY);
	});
});

describe("checkNewHeader fail type", function () {
	var tabenv, tablo, alias, label, type, errs;

	before(function() {
		tabenv = T.newTabenv();
		tablo = T.newTablo(tabenv, "tablo1", "Tablo 1");
		alias = "header1";
		label = "Header 1";
		type = null;
	});
	
	it("checkNewHeader()", function () {
		errs = T.checkNewHeader(tabenv, tablo, alias, label, type);
	});
	
	it("return value", function () {	
		assert.equal(errs[0].type, T.ERR.HEADER.TYPE.UNKNOWN);
	});
});

describe("checkNewHeader fail existing alias", function () {
	var tabenv, tablo, alias, label, type, errs;

	before(function() {
		tabenv = T.newTabenv();
		tablo = T.newTablo(tabenv, "tablo1", "Tablo 1");
		T.newHeader(tabenv, tablo, alias, label, type);
		alias = "header1";
		label = "Header 1";
		type = T.HEADER.TYPE.DATA;
		T.newHeader(tabenv, tablo, alias, label, type);
	});
	
	it("checkNewHeader()", function () {
		errs = T.checkNewHeader(tabenv, tablo, alias, label, type);
	});
	
	it("return value", function () {	
		assert.equal(errs[0].type, T.ERR.HEADER.ALIAS.EXISTING);
	});
});

describe("newHeader", function () {
	var env, alias, label, type, header, fullAlias ;
	
	before(function () {
		env = makenv1Tablo();
		alias = "header1";
		label = "Header 1";
		type = T.HEADER.TYPE.DATA;
		fullAlias = T.aliasesToStr(env.tablo1.alias, alias);
	});
	
	it("newHeader()", function () {
		header = T.newHeader(env.tabenv, env.tablo1, alias, label, type);
	});
	
	it("return value", function () {
		assert.equal(header.alias, alias);
		assert.equal(header.label, label);
		assert.equal(header.type, type);
		assert.equal(header.order, 0);
	});
	it("tablos updated", function () {
		assert.equal(env.tablo1.headers[0], header);
	});
	it("reactMap updated", function () {
		assert.isTrue(T.hasReactKey(env.tabenv.reactMap, fullAlias));
	});
});

describe("checkHeaderDataType", function () {
	var dataType1, dataType2, errs1, errs2 ;
	
	before(function () {
		dataType1 = T.HEADER.DATA_TYPE.INT ;
		dataType2 = null;
	});
	
	it("checkHeaderDataType()", function () {
		errs1 = T.checkHeaderDataType(dataType1);
		errs2 = T.checkHeaderDataType(dataType2);
	});
	
	it("return value", function () {
		assert.isEmpty(errs1);
		assert.equal(errs2[0].type, T.ERR.HEADER.DATA_TYPE.UNKNOWN);
	});
});

describe("newDataHeader", function () {

	var env, header, headerAlias, headerLabel, headerDataType, headerFullAlias;
		
	before(function () {
		env = makenv1Tablo();
		headerAlias = "header1";
		headerLabel = "Header 1";
		headerDataType = T.HEADER.DATA_TYPE.INT;
		headerFullAlias = T.aliasesToStr(env.tablo1.alias, headerAlias);
	});

	it("newDataHeader()", function () {
		header = T.newDataHeader(
			env.tabenv, env.tablo1, headerAlias, headerLabel, headerDataType);
	});
	
	it("return value", function () { 
		assert.equal(header.alias, headerAlias);
		assert.equal(header.label, headerLabel);
		assert.equal(header.type, T.HEADER.TYPE.DATA);
	});
	it("tablo udpated", function () {
		assert.equal(T.getHeader(env.tablo1, headerAlias), header);
	});
	it("reactMap udpated", function () {
		assert.isTrue(T.hasReactKey(env.tabenv.reactMap, headerFullAlias));
		assert.isEmpty(
			T.getReactions(env.tabenv.reactMap, headerFullAlias)
		);
	});
});

describe("checkNewColSamelineArg", function () {
	var env, errs ;
	
	before(function () {
		env = makenv1Tablo1Data1Line();
	});
	
	it("checkNewColSamelineArg()", function () {
		errs = T.checkNewColSamelineArg(
			env.tablo1.alias, env.header1.alias, env.tabenv);
	});
	
	it("return value", function () {
		assert.isEmpty(errs);
	});
});

describe("checkNewColSamelineArg fail tablo alias", function () {
	var env, errs ;
	
	before(function () {
		env = makenv1Tablo1Data1Line();
	});
	
	it("checkNewColSamelineArg()", function () {
		errs = T.checkNewColSamelineArg(
			null, env.header1.alias, env.tabenv);
	});
	
	it("return value", function () {
		assert.equal(errs[0].type, T.ERR.HEADER.ARG.TABLO_ALIAS.NON_EXISTING);
	});
});

describe("checkNewColSamelineArg fail header alias", function () {
	var env, errs ;
	
	before(function () {
		env = makenv1Tablo1Data1Line();
	});
	
	it("checkNewColSamelineArg()", function () {
		errs = T.checkNewColSamelineArg(
			env.tablo1.alias, null, env.tabenv);
	});
	
	it("return value", function () {
		assert.equal(errs[0].type, T.ERR.HEADER.ARG.HEADER_ALIAS.NON_EXISTING);
	});
});

describe("checkNewColSamelineArg fail reactMap", function () {
	var env, errs ;
	
	before(function () {
		env = makenv1Tablo1Data1Line();
		T.delReactKey(env.tabenv.reactMap, env.header1FullAlias);
	});
	
	it("checkNewColSamelineArg()", function () {
		errs = T.checkNewColSamelineArg(
			env.tablo1.alias, env.header1.alias, env.tabenv);
	});
	
	it("return value", function () {
		assert.equal(errs[0].type, T.ERR.REACT_MAP.KEY.NOT_FOUND);
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
		assert.equal(arg.type, T.HEADER.ARG.TYPE.COL_SAME_LINE);
		assert.equal(arg.alias.tablo, tabloAlias);
		assert.equal(arg.alias.header, headerAlias);
	});
});

describe("checkHeaderArg null arg", function () {
	var env, arg, errs ;
	
	before(function () {
		env = makenv1Tablo1Data1Line();
		arg = { type: T.HEADER.ARG.TYPE.NULL };
	});
	
	it("checkHeaderArg()", function () {
		errs = T.checkHeaderArg(env.tabenv, arg);
	});
	
	it("return value", function () {
		assert.isEmpty(errs);
	});
});

describe("checkHeaderArg colSameLine arg", function () {
	var env, arg, errs ;
	
	before(function () {
		env = makenv1Tablo1Data1Line();
		arg = T.newColSamelineArg(env.tablo1.alias, env.header1.alias);
	});
	
	it("checkHeaderArg()", function () {
		errs = T.checkHeaderArg(env.tabenv, arg);
	});
	
	it("return value", function () {
		assert.isEmpty(errs);
	});
});

describe("checkHeaderArg colSameLine fail BAD_CONTENT", function () {
	var env, arg, errs ;
	
	before(function () {
		env = makenv1Tablo1Data1Line();
		arg = T.newColSamelineArg(env.tablo1.alias, env.header1.alias);
		delete arg.alias.tablo ;
	});
	
	it("checkHeaderArg()", function () {
		errs = T.checkHeaderArg(env.tabenv, arg);
	});
	
	it("return value", function () {
		assert.equal(errs[0].type, T.ERR.HEADER.ARG.BAD_CONTENT);
	});
});

describe("checkHeaderArg colSameLine fail NON_EXISTING", function () {
	var env, arg, errs ;
	
	before(function () {
		env = makenv1Tablo1Data1Line();
		arg = T.newColSamelineArg(env.tablo1.alias, env.header1.alias);
		arg.alias.tablo = null ;
	});
	
	it("checkHeaderArg()", function () {
		errs = T.checkHeaderArg(env.tabenv, arg);
	});
	
	it("return value", function () {
		assert.equal(errs[0].type, T.ERR.HEADER.ARG.TABLO_ALIAS.NON_EXISTING);
	});
});

describe("checkHeaderArg fail UNKNOWN", function () {
	var env, arg, errs ;
	
	before(function () {
		env = makenv1Tablo1Data1Line();
		arg = { type: null };
	});
	
	it("checkHeaderArg()", function () {
		errs = T.checkHeaderArg(env.tabenv, arg);
	});
	
	it("return value", function () {
		assert.equal(errs[0].type, T.ERR.HEADER.ARG.TYPE.UNKNOWN);
	});
});

describe("checkHeaderArgs", function () {
	var env, arg1, arg2, args, errs ;
	
	before(function () {
		env = makenv1Tablo2Data1Line();
		arg1 = T.newColSamelineArg(env.tablo1.alias, env.header1.alias);
		arg2 = T.newColSamelineArg(env.tablo1.alias, env.header2.alias);
		args = [ arg1, arg2 ];
	});
	
	it("checkHeaderArgs()", function () {
		errs = T.checkHeaderArgs(env.tabenv, args);
	});
	
	it("return value", function () {
		assert.isEmpty(errs);
	});
});

describe("checkHeaderArgs fail BAD_CONTENT", function () {
	var env, arg1, arg2, args, errs ;
	
	before(function () {
		env = makenv1Tablo2Data1Line();
		arg1 = T.newColSamelineArg(env.tablo1.alias, env.header1.alias);
		arg2 = T.newColSamelineArg(env.tablo1.alias, env.header2.alias);
		args = new Set([ arg1, arg2 ]);
	});
	
	it("checkHeaderArgs()", function () {
		errs = T.checkHeaderArgs(env.tabenv, args);
	});
	
	it("return value", function () {
		assert.equal(errs[0].type, T.ERR.HEADER.ARGS.BAD_CONTENT);
	});
});

describe("checkHeaderArgs fail both args", function () {
	var env, arg1, arg2, args, errs ;
	
	before(function () {
		env = makenv1Tablo2Data1Line();
		arg1 = T.newColSamelineArg(null, env.header1.alias);
		arg2 = T.newColSamelineArg(env.tablo1.alias, null);
		args = [ arg1, arg2 ];
	});
	
	it("checkHeaderArgs()", function () {
		errs = T.checkHeaderArgs(env.tabenv, args);
	});
	
	it("return value", function () {
		assert.equal(errs[0].type, T.ERR.HEADER.ARG.TABLO_ALIAS.NON_EXISTING);
		assert.equal(errs[1].type, T.ERR.HEADER.ARG.HEADER_ALIAS.NON_EXISTING);
	});
});

describe("checkHeaderFunc", function () {
	var func1, func2, errs1, errs2 ;
	
	before(function () {
		func1 = function (x) { return x + 3 };
		func2 = 33;
	});
	
	it("checkHeaderFunc()", function () {
		errs1 = T.checkHeaderFunc(func1);
		errs2 = T.checkHeaderFunc(func2);
	});
	
	it("return value", function () {
		assert.isEmpty(errs1);
		assert.equal(errs2[0].type, T.ERR.HEADER.FUNCTION.BAD_CONTENT);
	});
});

describe("checkNewFuncHeader", function () {
	var env, tablo, alias, label, args, func, errs ;
	
	before(function () {
		env = makenv1Tablo1Data1Line();
		tablo = env.tablo1;
		alias = "header2";
		label = "Header 2";
		args = [ T.newColSamelineArg(env.tablo1.alias, env.header1.alias) ];
		func = function (x) { return x + 3 }
	});
	
	it("checkNewFuncHeader()", function () {;
		errs = T.checkNewFuncHeader(
			env.tabenv, tablo, alias, label, args, func);
	});
	
	it("return value", function () {
		assert.isEmpty(errs);
	});
});

describe("checkNewFuncHeader fail checkNewHeader", function () {
	var env, tablo, alias, label, args, func, errs ;
	
	before(function () {
		env = makenv1Tablo1Data1Line();
		tablo = env.tablo1;
		alias = null;
		label = "Header 2";
		args = [ T.newColSamelineArg(env.tablo1.alias, env.header1.alias) ];
		func = function (x) { return x + 3 };
	});
	
	it("checkNewFuncHeader()", function () {;
		errs = T.checkNewFuncHeader(
			env.tabenv, tablo, alias, label, args, func);
	});
	
	it("return value", function () {
		assert.equal(errs[0].type, T.ERR.HEADER.ALIAS.BAD_CONTENT);
	});
});

describe("checkNewFuncHeader fail checkHeaderArgs", function () {
	var env, tablo, alias, label, args, func, errs ;
	
	before(function () {
		env = makenv1Tablo1Data1Line();
		tablo = env.tablo1;
		alias = "header2";
		label = "Header 2";
		args = [ T.newColSamelineArg(env.tablo1.alias, null) ];
		func = function (x) { return x + 3 };
	});
	
	it("checkNewFuncHeader()", function () {;
		errs = T.checkNewFuncHeader(
			env.tabenv, tablo, alias, label, args, func);
	});
	
	it("return value", function () {
		assert.equal(errs[0].type, T.ERR.HEADER.ARG.HEADER_ALIAS.NON_EXISTING);
	});
});

describe("checkNewFuncHeader fail checkNewReaction", function () {
	var env, tablo, alias, label, args, func, errs ;
	
	before(function () {
		env = makenv1Tablo1Data1Line();
		tablo = env.tablo1;
		alias = "header2";
		label = "Header 2";
		args = [ T.newColSamelineArg(env.tablo1.alias, env.header1.alias) ];
		func = function (x) { return x + 3 };
		T.delReactKey(env.tabenv.reactMap, env.header1FullAlias);
	});
	
	it("checkNewFuncHeader()", function () {;
		errs = T.checkNewFuncHeader(
			env.tabenv, tablo, alias, label, args, func);
	});
	
	it("return value", function () {
		assert.equal(errs[0].type, T.ERR.REACT_MAP.KEY.NOT_FOUND);
	});
});

describe("checkNewFuncHeader fail checkHeaderFunc", function () {
	var env, tablo, alias, label, args, func, errs ;
	
	before(function () {
		env = makenv1Tablo1Data1Line();
		tablo = env.tablo1;
		alias = "header2";
		label = "Header 2";
		args = [ T.newColSamelineArg(env.tablo1.alias, env.header1.alias) ];
		func = null;
	});
	
	it("checkNewFuncHeader()", function () {;
		errs = T.checkNewFuncHeader(
			env.tabenv, tablo, alias, label, args, func);
	});
	
	it("return value", function () {
		assert.equal(errs[0].type, T.ERR.HEADER.FUNCTION.BAD_CONTENT);
	});
});

describe("newFuncHeader", function () {

	var env, header2, header2Alias, header2Label, header2FullAlias, 
		header2Args, header2Func;

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
		header2 = T.newFuncHeader(
			env.tabenv, env.tablo1, 
			header2Alias, header2Label, header2Args, header2Func);
	});
	
	it("return value", function () { 
		assert.equal(header2.alias, header2Alias);
		assert.equal(header2.label, header2Label);
		assert.equal(header2.type, T.HEADER.TYPE.FUNC);
		assert.equal(header2.args.length, 1);
		assert.equal(header2.args[0], header2Args[0]);
	});
	it("tablo udpated", function () {
		assert.equal(T.getHeader(env.tablo1, header2Alias), header2);
		assert.equal(
			T.getCell(env.tablo1, header2, 0),
			header2Func(T.getCell(env.tablo1, env.header1, 0))
		);
	});
	it("reactMap udpated", function () {
		assert.isTrue(T.hasReactKey(env.tabenv.reactMap, header2FullAlias));
		assert.equal(
			T.getReactions(env.tabenv.reactMap, header2FullAlias).size, 
			0
		);
		assert.equal(
			T.getReactions(
				env.tabenv.reactMap, env.header1FullAlias
			).size, 
			1
		);
		assert.isTrue(T.hasReaction(
			env.tabenv.reactMap, env.header1FullAlias, header2FullAlias
		));
	});
});

describe("checkNewLine", function() {
	
});

describe("newLine()", function () {

	var env;

	before(function () {
		env = makenv2Tablo1Func1Line();
	});
		
	it("newLine()", function () {
		T.newLine(env.tabenv, env.tablo1);
		T.newLine(env.tabenv, env.tablo2);
	});
	
	it("tablo updated", function () {
		// the number of lines is two because one line existed in env
		assert.equal(env.tablo1.data.length, 2);
		// 0 is the default value for INT cells
		assert.equal(T.getCell(env.tablo1, env.header1, 1), 0);
		assert.equal(
			T.getCell(env.tablo2, env.header2, 1), 
			env.header2.func(T.getCell(env.tablo1, env.header1, 1)));
	});
});

describe("checkNewHeaderArg", function () {
	var env, tablo, header, arg, errs;
	
	before(function () {
		env = makenv2Tablo1Func1Line();
		tablo = env.tablo2;
		header = env.header2;
		arg = T.newColSamelineArg(env.tablo1.alias, env.header1.alias);
	});
	
	it("checkNewHeaderArg()", function () {;
		errs = T.checkNewHeaderArg(env.tabenv, tablo, header, arg);
	});
	
	it("return value", function () {
		assert.isEmpty(errs);
	});
});

describe("checkNewHeaderArg fail NOT_FUNC", function () {
	var env, tablo, header, arg, errs;
	
	before(function () {
		env = makenv2Tablo1Func1Line();
		tablo = env.tablo1;
		header = env.header1;
		arg = T.newColSamelineArg(env.tablo1.alias, env.header1.alias);
	});
	
	it("checkNewHeaderArg()", function () {;
		errs = T.checkNewHeaderArg(env.tabenv, tablo, header, arg);
	});
	
	it("return value", function () {
		assert.equal(errs[0].type, T.ERR.HEADER.TYPE.NOT_FUNC);
	});
});

describe("checkNewHeaderArg fail checkHeaderArg", function () {
	var env, tablo, header, arg, errs;
	
	before(function () {
		env = makenv2Tablo1Func1Line();
		tablo = env.tablo2;
		header = env.header2;
		arg = T.newColSamelineArg(env.tablo1.alias, null);
	});
	
	it("checkNewHeaderArg()", function () {;
		errs = T.checkNewHeaderArg(env.tabenv, tablo, header, arg);
	});
	
	it("return value", function () {
		assert.equal(errs[0].type, T.ERR.HEADER.ARG.HEADER_ALIAS.NON_EXISTING);
	});
});

describe("checkNewHeaderArg fail checkNewReaction", function () {
	var env, tablo, header, arg, errs;
	
	before(function () {
		env = makenv2Tablo1Func1Line();
		tablo = env.tablo2;
		header = env.header2;
		arg = T.newColSamelineArg(env.tablo2.alias, env.header2.alias);
	});
	
	it("checkNewHeaderArg()", function () {;
		errs = T.checkNewHeaderArg(env.tabenv, tablo, header, arg);
	});
	
	it("return value", function () {
		assert.equal(errs[0].type, T.ERR.REACT_MAP.LOOP);
	});
});

describe("checkNewHeaderArg fail UNKNOWN", function () {
	var env, tablo, header, arg, errs;
	
	before(function () {
		env = makenv2Tablo1Func1Line();
		tablo = env.tablo2;
		header = env.header2;
		arg = T.newColSamelineArg(env.tablo1.alias, env.header1.alias);
		arg.type = null;
	});
	
	it("checkNewHeaderArg()", function () {;
		errs = T.checkNewHeaderArg(env.tabenv, tablo, header, arg);
	});
	
	it("return value", function () {
		assert.equal(errs[0].type, T.ERR.HEADER.ARG.TYPE.UNKNOWN);
	});
});

describe("newHeaderArg() avec zéro arg initialement", function () {

	var env, header2, header2FullAlias, newArg;

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
		);
		newArg = T.newColSamelineArg(env.tablo1.alias, env.header1.alias);
	});
		
	it("newHeaderArg()", function () {
		T.newHeaderArg(env.tabenv, env.tablo1, header2, newArg);
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
	it("reactMap udpated", function () {
		assert.equal(
			T.getReactions(
				env.tabenv.reactMap, env.header1FullAlias
			).size, 
			1
		);
		assert.isTrue(T.hasReaction(
			env.tabenv.reactMap, env.header1FullAlias, header2FullAlias
		));
	});
});

describe ("copyArg()", function () {
	var nullArg1, nullArg2, 
		colSamelineArg1, colSamelineArg2;
	
	before(function() {
		nullArg1 = { type: T.HEADER.ARG.TYPE.NULL };
		var tabloAlias = "tablo1";
		var headerAlias = "header1";
		colSamelineArg1 = T.newColSamelineArg(tabloAlias, headerAlias);
	});
	
	it("copyArg() NULL et COL_SAME_LINE", function() {
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

// ==================== GET FUNCTIONS =======================

describe("getHeader", function() {
	var tablo, header, alias, env;
	
	before(function () {
		env = makenv1Tablo1Data1Line();
		tablo = env.tablo1 ;
		alias = env.header1.alias;
	});
	
	it("getHeader()", function() {
		header = T.getHeader(tablo, alias);
	});
	
	it("return value", function () {
		assert.equal(header, env.header1);
	});
});

describe("getHeader fail undefined", function() {
	var tablo, header, alias, env;
	
	before(function () {
		env = makenv1Tablo1Data1Line();
		tablo = env.tablo1 ;
		alias = null;
	});
	
	it("getHeader()", function() {
		header = T.getHeader(tablo, alias);
	});
	
	it("return value", function () {
		assert.isUndefined(header);
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

describe("checkGetCellByAliases", function() {
	var tabloAlias, headerAlias, numLine, errs, env;
	
	before(function () {
		env = makenv1Tablo1Data1Line();
		tabloAlias = env.tablo1.alias ;
		headerAlias = env.header1.alias;
		numLine = 0;
	});
	
	it("checkGetCellByAliases()", function() {
		errs = T.checkGetCellByAliases(
			env.tabenv, tabloAlias, headerAlias, numLine);
	});
	
	it("return value", function () {
		assert.isEmpty(errs);
	});
});

describe("checkGetCellByAliases fail TABLO.NOT_FOUND", function() {
	var tabloAlias, headerAlias, numLine, errs, env;
	
	before(function () {
		env = makenv1Tablo1Data1Line();
		tabloAlias = null ;
		headerAlias = env.header1.alias;
		numLine = 0;
	});
	
	it("checkGetCellByAliases()", function() {
		errs = T.checkGetCellByAliases(
			env.tabenv, tabloAlias, headerAlias, numLine);
	});
	
	it("return value", function () {
		assert.equal(errs[0].type, T.ERR.TABLO.NOT_FOUND);
	});
});

describe("checkGetCellByAliases fail HEADER.NOT_FOUND", function() {
	var tabloAlias, headerAlias, numLine, errs, env;
	
	before(function () {
		env = makenv1Tablo1Data1Line();
		tabloAlias = env.tablo1.alias ;
		headerAlias = null;
		numLine = 0;
	});
	
	it("checkGetCellByAliases()", function() {
		errs = T.checkGetCellByAliases(
			env.tabenv, tabloAlias, headerAlias, numLine);
	});
	
	it("return value", function () {
		assert.equal(errs[0].type, T.ERR.HEADER.NOT_FOUND);
	});
});

describe("checkGetCellByAliases fail OUT_OF_BOUNDS", function() {
	var tabloAlias, headerAlias, numLine, errs, env;
	
	before(function () {
		env = makenv1Tablo1Data1Line();
		tabloAlias = env.tablo1.alias ;
		headerAlias = env.header1.alias;
		numLine = 1;
	});
	
	it("checkGetCellByAliases()", function() {
		errs = T.checkGetCellByAliases(
			env.tabenv, tabloAlias, headerAlias, numLine);
	});
	
	it("return value", function () {
		assert.equal(errs[0].type, T.ERR.LINE.OUT_OF_BOUNDS);
	});
});


describe("getCellByAliases()", function() {
	var env, cell;
	
	before(function () {
		env = makenv1Tablo1Data1Line();
	});
	
	it("getCellByAliases()", function() {
		cell = T.getCellByAliases(
			env.tabenv, env.tablo1.alias, env.header1.alias, 0);
	});
	
	it("return value", function () {
		assert.equal(cell, 33);
	});
});

// ==================== UPD FUNCTIONS =======================

describe("checkUpdTabloAlias", function() {
	var env, newAlias, errs;
	
	before(function () {
		env = makenv1Tablo1Data1Line();
		newAlias = "newtablo1" ;
	});
	
	it("checkUpdTabloAlias()", function() {
		errs = T.checkUpdTabloAlias(env.tabenv, env.tablo1, newAlias);
	});
	
	it("return value", function () {
		assert.isEmpty(errs);
	});
});

describe("checkUpdTabloAlias same alias", function() {
	var env, newAlias, errs;
	
	before(function () {
		env = makenv1Tablo1Data1Line();
		newAlias = env.tablo1.alias;
	});
	
	it("checkUpdTabloAlias()", function() {
		errs = T.checkUpdTabloAlias(env.tabenv, env.tablo1, newAlias);
	});
	
	it("return value", function () {
		assert.isEmpty(errs);
	});
});

describe("checkUpdTabloAlias fail ALIAS.EXISTING", function() {
	var env, newAlias, errs;
	
	before(function () {
		env = makenv2Tablo1Func1Line();
		newAlias = env.tablo2.alias ;
	});
	
	it("checkUpdTabloAlias()", function() {
		errs = T.checkUpdTabloAlias(env.tabenv, env.tablo1, newAlias);
	});
	
	it("return value", function () {
		assert.equal(errs[0].type, T.ERR.TABLO.ALIAS.EXISTING);
	});
});

describe("updTabloAlias() tablo2 pointing to tablo1. we change tablo1 alias", 
	function () {
	
		var env, newTablo1Alias,
			oldHeader1FullAlias, newHeader1FullAlias;
		
		before(function(){
			env = makenv2Tablo1Func1Line() 
			newTablo1Alias = "newtablo1";
			oldHeader1FullAlias = env.header1FullAlias;
			newHeader1FullAlias = 
				T.aliasesToStr(newTablo1Alias, env.header1.alias);
		});
		
		it("updTabloAlias()", function() {
			T.updTabloAlias(env.tabenv, env.tablo1, newTablo1Alias);
		});
		
		it("tablo1 updated", function() {
			assert.equal(env.tablo1.alias, newTablo1Alias);
		});
		it("tablo2 updated", function() {
			assert.equal(
				env.tablo2.headers[0].args[0].alias.tablo, 
				newTablo1Alias);
		});
		it("reactMap updated", function() {
			assert.isFalse(
				T.hasReactKey(env.tabenv.reactMap, oldHeader1FullAlias)
			);
			assert.isTrue(
				T.hasReactKey(env.tabenv.reactMap, newHeader1FullAlias)
			);
			assert.isTrue(T.hasReaction(
				env.tabenv.reactMap, newHeader1FullAlias, env.header2FullAlias
			));
		});
	}
);

describe("updTabloAlias() tablo2 pointing to tablo1. we change tablo2 alias", 
	function () {
	
		var env, newTablo2Alias,
			oldHeader2FullAlias, newHeader2FullAlias;
		
		before(function(){
			env = makenv2Tablo1Func1Line() 
			newTablo2Alias = "newtablo2";
			oldHeader2FullAlias = env.header2FullAlias;
			newHeader2FullAlias = 
				T.aliasesToStr(newTablo2Alias, env.header2.alias);
		});
		
		it("updTabloAlias()", function() {
			T.updTabloAlias(env.tabenv, env.tablo2, newTablo2Alias);
		});
		
		it("tablo2 updated", function() {
			assert.equal(env.tablo2.alias, newTablo2Alias);
		});
		it("reactMap updated", function() {
			assert.isFalse(
				T.hasReactKey(env.tabenv.reactMap, oldHeader2FullAlias)
			);
			assert.isTrue(
				T.hasReactKey(env.tabenv.reactMap, newHeader2FullAlias)
			);
			assert.isTrue(T.hasReaction(
				env.tabenv.reactMap, env.header1FullAlias, newHeader2FullAlias
			));
		});
	}
);

describe("checkUpdTabloLabel", function() {
	// tests already done in checkTabloLabel
});

describe("updTabloLabel()", function () {

	var tablo, newLabel;
	
	before(function() {
		var tabenv = T.newTabenv();
		tablo = T.newTablo(tabenv, "tablo1", "Tablo 1");
		newLabel = "Tablo 1 new label";
	});

	it("updTabloLabel()", function () {
		T.updTabloLabel(tablo, newLabel);
	});
	
	it("tablo updated", function () {
		assert.equal(tablo.label, newLabel);
	});
});

describe("checkTabloDisplayNumLines", function() {
	var displayNumLines, errs;
	
	before(function () {
		displayNumLines = false ;
	});
	
	it("checkTabloDisplayNumLines()", function() {
		errs = T.checkTabloDisplayNumLines(displayNumLines);
	});
	
	it("return value", function () {
		assert.isEmpty(errs);
	});
});

describe("checkTabloDisplayNumLines fail BAD_CONTENT", function() {
	var displayNumLines, errs;
	
	before(function () {
		displayNumLines = 33 ;
	});
	
	it("checkTabloDisplayNumLines()", function() {
		errs = T.checkTabloDisplayNumLines(displayNumLines);
	});
	
	it("return value", function () {
		assert.equal(errs[0].type, T.ERR.TABLO.DISPLAY_NUM_LINES.BAD_CONTENT);
	});
});

describe("checkUpdTabloDisplayNumLines", function() {
	var env, displayNumLines, errs;
	
	before(function () {
		env = makenv1Tablo1Data1Line();
		displayNumLines = false ;
	});
	
	it("checkUpdTabloDisplayNumLines()", function() {
		errs = T.checkUpdTabloDisplayNumLines(env.tablo1, displayNumLines);
	});
	
	it("return value", function () {
		assert.isEmpty(errs);
	});
});

describe("checkUpdTabloDisplayNumLines fail BAD_CONTENT", function() {
	var env, displayNumLines, errs;
	
	before(function () {
		env = makenv1Tablo1Data1Line();
		displayNumLines = 33 ;
	});
	
	it("checkTabloDisplayNumLines()", function() {
		errs = T.checkUpdTabloDisplayNumLines(env.tablo1, displayNumLines);
	});
	
	it("return value", function () {
		assert.equal(errs[0].type, T.ERR.TABLO.DISPLAY_NUM_LINES.BAD_CONTENT);
	});
});

describe("updTabloDisplayNumLines()", function () {

	var tablo;
	
	before(function() {
		var tabenv = T.newTabenv();
		tablo = T.newTablo(tabenv, "tablo1", "Tablo 1");
	});

	it("updTabloDisplayNumLines()", function () {
		T.updTabloDisplayNumLines(tablo, false);
	});
	
	it("tablo updated", function () {
		assert.isFalse(tablo.displayNumLines);
	});
});

describe("checkUpdHeaderAlias", function() {
	var env, newAlias, errs;
	
	before(function () {
		env = makenv1Tablo1Data1Line();
		newAlias = "newheader1" ;
	});
	
	it("checkUpdHeaderAlias()", function() {
		errs = T.checkUpdHeaderAlias(
			env.tabenv, env.tablo1, env.header1, newAlias);
	});
	
	it("return value", function () {
		assert.isEmpty(errs);
	});
});

describe("checkUpdHeaderAlias same alias", function() {
	var env, newAlias, errs;
	
	before(function () {
		env = makenv1Tablo1Data1Line();
		newAlias = env.header1.alias ;
	});
	
	it("checkUpdHeaderAlias()", function() {
		errs = T.checkUpdHeaderAlias(
			env.tabenv, env.tablo1, env.header1, newAlias);
	});
	
	it("return value", function () {
		assert.isEmpty(errs);
	});
});

describe("checkUpdHeaderAlias fail EXISTING", function() {
	var env, newAlias, errs;
	
	before(function () {
		env = makenv1Tablo2Data1Line();
		newAlias = env.header2.alias ;
	});
	
	it("checkUpdHeaderAlias()", function() {
		errs = T.checkUpdHeaderAlias(
			env.tabenv, env.tablo1, env.header1, newAlias);
	});
	
	it("return value", function () {console.log(errs);
		assert.equal(errs[0].type, T.ERR.HEADER.ALIAS.EXISTING);
	});
});

describe(
	"updHeaderAlias() tablo2 header2 pointing to tablo1 header1. " +
	"update header1 alias", 
	function() {

		var env, newHeader1Alias, oldHeader1FullAlias, newHeader1FullAlias;

		before(function() { 
			env = makenv2Tablo1Func1Line() 
			newHeader1Alias = "newheader1";
			oldHeader1FullAlias = env.header1FullAlias;
			newHeader1FullAlias = 
				T.aliasesToStr(env.tablo1.alias, newHeader1Alias);
		});

		it("updHeaderAlias()", function() {
			T.updHeaderAlias(
				env.tabenv, env.tablo1, env.header1, newHeader1Alias);
		});

		it("header1 updated", function () {
			assert.equal(env.header1.alias, newHeader1Alias);
		});
		it("header2 updated", function () {
			assert.equal(env.header2.args[0].alias.header, newHeader1Alias);
		});
		it("reactMap updated", function () {
			assert.isFalse(
				T.hasReactKey(env.tabenv.reactMap, oldHeader1FullAlias)
			);
			assert.isTrue(
				T.hasReactKey(env.tabenv.reactMap, newHeader1FullAlias)
			);
			assert.isTrue(T.hasReaction(
				env.tabenv.reactMap, newHeader1FullAlias, env.header2FullAlias
			));
		});
});

describe(
	"updHeaderAlias() tablo2 header2 pointing to tablo1 header1. " +
	"update header2 alias", 
	function() {
		var env, newHeader2Alias, oldHeader2FullAlias, newHeader2FullAlias;

		before(function() { 
			env = makenv2Tablo1Func1Line() 
			newHeader2Alias = "newheader2";
			oldHeader2FullAlias = env.header2FullAlias;
			newHeader2FullAlias = 
				T.aliasesToStr(env.tablo2.alias, newHeader2Alias);
		});

		it("updHeaderAlias()", function() {
			T.updHeaderAlias(
				env.tabenv, env.tablo2, env.header2, newHeader2Alias);
		});

		it("header2 updated", function () {
			assert.equal(env.header2.alias, newHeader2Alias);
		});
		it("reactMap updated", function () {
			assert.isFalse(
				T.hasReactKey(env.tabenv.reactMap, oldHeader2FullAlias)
			);
			assert.isTrue(
				T.hasReactKey(env.tabenv.reactMap, newHeader2FullAlias)
			);
			assert.isTrue(T.hasReaction(
				env.tabenv.reactMap, env.header1FullAlias, newHeader2FullAlias
			));
		});
});

describe("checkUpdHeaderLabel", function () {
	var env, label1, label2, label3, errs1, errs2, errs3;

	before(function() {
		env = makenv1Tablo1Data1Line();
		label1 = "label1";
		label2 = 33;
		label3 = "";
	});
	
	it("checkUpdHeaderLabel()", function () {
		errs1 = T.checkUpdHeaderLabel(env.header1, label1);
		errs2 = T.checkUpdHeaderLabel(env.header1, label2);
		errs3 = T.checkUpdHeaderLabel(env.header1, label3);
	});
	
	it("return value", function () {	
		assert.isEmpty(errs1);
		assert.equal(errs2[0].type, T.ERR.HEADER.LABEL.BAD_CONTENT);
		assert.equal(errs3[0].type, T.ERR.HEADER.LABEL.EMPTY);
	});
});

describe("updHeaderLabel()", function () {
	var header1, newLabel;

	before(function() {
		var tabenv = T.newTabenv();
		var tablo1 = T.newTablo(tabenv, "tablo1", "Tablo 1");
		var oldLabel = "Old Label";
		newLabel = "New Label";
		header1 = T.newDataHeader(
			tabenv, tablo1, "header1", oldLabel, T.HEADER.DATA_TYPE.INT);
	});

	it("updHeaderLabel()", function() {
		T.updHeaderLabel(header1, newLabel);
	});
	
	it("header updated", function() {
		assert.equal(header1.label, newLabel);
	});
});

describe("checkUpdHeaderType", function () {
	var env, type1, type2, errs1, errs2;

	before(function() {
		env = makenv1Tablo1Data1Line();
		type1 = T.HEADER.TYPE.DATA;
		type2 = null;
	});
	
	it("checkUpdHeaderType()", function () {
		errs1 = T.checkUpdHeaderType(
			env.tabenv, env.tablo1, env.header1, type1);
		errs2 = T.checkUpdHeaderType(
			env.tabenv, env.tablo1, env.header1, type2);
	});
	
	it("return value", function () {	
		assert.isEmpty(errs1);
		assert.equal(errs2[0].type, T.ERR.HEADER.TYPE.UNKNOWN);
	});
});

describe("updHeaderType() DATA to FUNC", function () {
	var env;

	before(function() { 
		env = makenv2Tablo1Func1Line() ;
	});

	it("updHeaderType()", function() {
		T.updHeaderType(
			env.tabenv, env.tablo1, env.header1, T.HEADER.TYPE.FUNC);
	});
	
	it("header updated", function() {
		assert.equal(env.header1.type, T.HEADER.TYPE.FUNC);
		assert.equal(env.header1.args.length, 0);
		assert.equal(typeof env.header1.func, "function");
	});
	it("tablo data updated", function() {
		assert.equal(T.getCell(env.tablo1, env.header1, 0), null);
	});
});

describe("updHeaderType() FUNC to DATA", function () {
	var env;

	before(function() {
		env = makenv2Tablo1Func1Line() ;
	});

	it("updHeaderType()", function() {
		T.updHeaderType(
			env.tabenv, env.tablo2, env.header2, T.HEADER.TYPE.DATA);
	});
	
	it("header updated", function() {
		assert.equal(env.header2.type, T.HEADER.TYPE.DATA);
		assert.isUndefined(env.header2.args);
		assert.isUndefined(env.header2.func);
	});
	it("tablo data keeped", function() {
		assert.equal(T.getCell(env.tablo2, env.header2, 0), 34);
	});
});

describe("checkHeaderOrder", function () {
	var env, newOrder, errs;

	before(function() {
		env = makenv1Tablo2Data1Line();
		newOrder = 1;
	});
	
	it("checkHeaderOrder()", function () {
		errs = T.checkHeaderOrder(env.tablo1, newOrder);
	});
	
	it("return value", function () {	
		assert.isEmpty(errs);
	});
});

describe("checkHeaderOrder fail OUT OF BOUNDS", function () {
	var env, newOrder, errs;

	before(function() {
		env = makenv1Tablo2Data1Line();
		newOrder = 2;
	});
	
	it("checkHeaderOrder()", function () {
		errs = T.checkHeaderOrder(env.tablo1, newOrder);
	});
	
	it("return value", function () {	
		assert.equal(errs[0].type, T.ERR.HEADER.ORDER.OUT_OF_BOUNDS);
	});
});

describe("checkUpdHeaderOrder", function () {
	var env, newOrder, errs;

	before(function() {
		env = makenv1Tablo2Data1Line();
		newOrder = 1;
	});
	
	it("checkUpdHeaderOrder()", function () {
		errs = T.checkUpdHeaderOrder(
			env.tabenv, env.tablo1, env.header1, newOrder);
	});
	
	it("return value", function () {	
		assert.isEmpty(errs);
	});
});

describe("checkUpdHeaderOrder fail OUT OF BOUNDS", function () {
	var env, newOrder, errs;

	before(function() {
		env = makenv1Tablo2Data1Line();
		newOrder = 2;
	});
	
	it("checkUpdHeaderOrder()", function () {
		errs = T.checkUpdHeaderOrder(
			env.tabenv, env.tablo1, env.header1, newOrder);
	});
	
	it("return value", function () {	
		assert.equal(errs[0].type, T.ERR.HEADER.ORDER.OUT_OF_BOUNDS);
	});
});

describe("updHeaderOrder()", function() {
	var env;

	before(function() {
		env = makenv1Tablo2Data1Line();
	});

	it("updHeaderOrder()", function () {
		T.updHeaderOrder(env.tabenv, env.tablo1, env.header2, 0);
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

describe("checkUpdHeaderDataType", function () {
	var env, newDataType, errs;

	before(function() {
		env = makenv1Tablo1Data1Line();
		newDataType = T.HEADER.DATA_TYPE.FLOAT;
	});
	
	it("checkUpdHeaderDataType()", function () {
		errs = T.checkUpdHeaderDataType(
			env.tabenv, env.tablo1, env.header1, newDataType);
	});
	
	it("return value", function () {	
		assert.isEmpty(errs);
	});
});

describe("checkUpdHeaderDataType fail NOT_DATA", function () {
	var env, newDataType, errs;

	before(function() {
		env = makenv2Tablo1Func1Line();
		newDataType = T.HEADER.DATA_TYPE.FLOAT;
	});
	
	it("checkUpdHeaderDataType()", function () {
		errs = T.checkUpdHeaderDataType(
			env.tabenv, env.tablo2, env.header2, newDataType);
	});
	
	it("return value", function () {	
		assert.equal(errs[0].type, T.ERR.HEADER.TYPE.NOT_DATA);
	});
});

describe("checkUpdHeaderDataType fail DATA_TYPE UNKNOWN", function () {
	var env, newDataType, errs;

	before(function() {
		env = makenv1Tablo1Data1Line();
		newDataType = null;
	});
	
	it("checkUpdHeaderDataType()", function () {
		errs = T.checkUpdHeaderDataType(
			env.tabenv, env.tablo1, env.header1, newDataType);
	});
	
	it("return value", function () {	
		assert.equal(errs[0].type, T.ERR.HEADER.DATA_TYPE.UNKNOWN);
	});
});

describe("updHeaderDataType INT to FLOAT", function() {
	var env, newDataType, prevCellVal;
	
	before(function(){
		env = makenv1Tablo1Data1Line();
		newDataType = T.HEADER.DATA_TYPE.FLOAT;
		prevCellVal = T.getCell(env.tablo1, env.header1, 0);
	});
	
	it("updHeaderDataType()", function() {
		T.updHeaderDataType(env.tabenv, env.tablo1, env.header1, newDataType);
	});
	
	it("data updated", function() {
		assert.equal(T.getCell(env.tablo1, env.header1, 0), prevCellVal);
	});
});

describe("updHeaderDataType INT to STRING", function() {
	var env, newDataType, prevCellVal;
	
	before(function(){
		env = makenv1Tablo1Data1Line();
		newDataType = T.HEADER.DATA_TYPE.FLOAT;
		prevCellVal = T.getCell(env.tablo1, env.header1, 0);
	});
	
	it("updHeaderDataType()", function() {
		T.updHeaderDataType(env.tabenv, env.tablo1, env.header1, newDataType);
	});
	
	it("data updated", function() {
		assert.equal(String(prevCellVal), prevCellVal);
	});
});

describe("updHeaderDataType INT to JSON", function() {
	var env, newDataType, prevCellVal;
	
	before(function(){
		env = makenv1Tablo1Data1Line();
		newDataType = T.HEADER.DATA_TYPE.FLOAT;
		prevCellVal = T.getCell(env.tablo1, env.header1, 0);
	});
	
	it("updHeaderDataType()", function() {
		T.updHeaderDataType(env.tabenv, env.tablo1, env.header1, newDataType);
	});
	
	it("data updated", function() {
		assert.equal(T.getCell(env.tablo1, env.header1, 0), prevCellVal);
	});
});

describe("updHeaderDataType FLOAT to INT", function() {
	var env, newDataType, prevCellVal;
	
	before(function(){
		env = makenv1Tablo1Data1Line();
		T.updHeaderDataType(env.tabenv, env.tablo1, env.header1, 
			T.HEADER.DATA_TYPE.FLOAT);
		T.updDataCell(env.tablo1, env.header1, 0, 33.33);
		newDataType = T.HEADER.DATA_TYPE.INT;
		prevCellVal = T.getCell(env.tablo1, env.header1, 0);
	});
	
	it("updHeaderDataType()", function() {
		T.updHeaderDataType(env.tabenv, env.tablo1, env.header1, newDataType);
	});
	
	it("data updated", function() {
		assert.equal(T.getCell(env.tablo1, env.header1, 0), 
			Math.floor(prevCellVal));
	});
});

describe("updHeaderDataType FLOAT to STRING", function() {
	var env, newDataType, prevCellVal;
	
	before(function(){
		env = makenv1Tablo1Data1Line();
		T.updHeaderDataType(env.tabenv, env.tablo1, env.header1, 
			T.HEADER.DATA_TYPE.FLOAT);
		T.updDataCell(env.tablo1, env.header1, 0, 33.33);
		newDataType = T.HEADER.DATA_TYPE.STRING;
		prevCellVal = T.getCell(env.tablo1, env.header1, 0);
	});
	
	it("updHeaderDataType()", function() {
		T.updHeaderDataType(env.tabenv, env.tablo1, env.header1, newDataType);
	});
	
	it("data updated", function() {
		assert.equal(T.getCell(env.tablo1, env.header1, 0), 
			String(prevCellVal));
	});
});

describe("updHeaderDataType FLOAT to JSON", function() {
	var env, newDataType, prevCellVal;
	
	before(function(){
		env = makenv1Tablo1Data1Line();
		T.updHeaderDataType(env.tabenv, env.tablo1, env.header1, 
			T.HEADER.DATA_TYPE.FLOAT);
		T.updDataCell(env.tablo1, env.header1, 0, 33.33);
		newDataType = T.HEADER.DATA_TYPE.JSON;
		prevCellVal = T.getCell(env.tablo1, env.header1, 0);
	});
	
	it("updHeaderDataType()", function() {
		T.updHeaderDataType(env.tabenv, env.tablo1, env.header1, newDataType);
	});
	
	it("data updated", function() {
		assert.equal(T.getCell(env.tablo1, env.header1, 0), 
			prevCellVal);
	});
});

describe("updHeaderDataType STRING to INT", function() {
	var env, newDataType, prevCellVal;
	
	before(function(){
		env = makenv1Tablo1Data1Line();
		T.updHeaderDataType(env.tabenv, env.tablo1, env.header1, 
			T.HEADER.DATA_TYPE.STRING);
		T.updDataCell(env.tablo1, env.header1, 0, "33");
		newDataType = T.HEADER.DATA_TYPE.INT;
		prevCellVal = T.getCell(env.tablo1, env.header1, 0);
	});
	
	it("updHeaderDataType()", function() {
		T.updHeaderDataType(env.tabenv, env.tablo1, env.header1, newDataType);
	});
	
	it("data updated", function() {
		assert.equal(T.getCell(env.tablo1, env.header1, 0), 
			parseInt(prevCellVal));
	});
});

describe("updHeaderDataType STRING to FLOAT", function() {
	var env, newDataType, prevCellVal;
	
	before(function(){
		env = makenv1Tablo1Data1Line();
		T.updHeaderDataType(env.tabenv, env.tablo1, env.header1, 
			T.HEADER.DATA_TYPE.STRING);
		T.updDataCell(env.tablo1, env.header1, 0, "33.33");
		newDataType = T.HEADER.DATA_TYPE.FLOAT;
		prevCellVal = T.getCell(env.tablo1, env.header1, 0);
	});
	
	it("updHeaderDataType()", function() {
		T.updHeaderDataType(env.tabenv, env.tablo1, env.header1, newDataType);
	});
	
	it("data updated", function() {
		assert.equal(T.getCell(env.tablo1, env.header1, 0), 
			parseFloat(prevCellVal));
	});
});

describe("updHeaderDataType STRING to JSON", function() {
	var env, newDataType, prevCellVal;
	
	before(function(){
		env = makenv1Tablo1Data1Line();
		T.updHeaderDataType(env.tabenv, env.tablo1, env.header1, 
			T.HEADER.DATA_TYPE.STRING);
		T.updDataCell(env.tablo1, env.header1, 0, "{ \"x\": 33 }");
		newDataType = T.HEADER.DATA_TYPE.JSON;
		prevCellVal = T.getCell(env.tablo1, env.header1, 0);
	});
	
	it("updHeaderDataType()", function() {
		T.updHeaderDataType(env.tabenv, env.tablo1, env.header1, newDataType);
	});
	
	it("data updated", function() {
		assert.equal(T.getCell(env.tablo1, env.header1, 0).x, 
			JSON.parse(prevCellVal).x);
	});
});

describe("updHeaderDataType STRING string to JSON string", function() {
	var env, newDataType, prevCellVal;
	
	before(function(){
		env = makenv1Tablo1Data1Line();
		T.updHeaderDataType(env.tabenv, env.tablo1, env.header1, 
			T.HEADER.DATA_TYPE.STRING);
		T.updDataCell(env.tablo1, env.header1, 0, "aaa");
		newDataType = T.HEADER.DATA_TYPE.JSON;
		prevCellVal = T.getCell(env.tablo1, env.header1, 0);
	});
	
	it("updHeaderDataType()", function() {
		T.updHeaderDataType(env.tabenv, env.tablo1, env.header1, newDataType);
	});
	
	it("data updated", function() {
		assert.equal(T.getCell(env.tablo1, env.header1, 0), 
			prevCellVal);
	});
});

describe("updHeaderDataType JSON to INT", function() {
	var env, newDataType, prevCellVal;
	
	before(function(){
		env = makenv1Tablo1Data1Line();
		T.updHeaderDataType(env.tabenv, env.tablo1, env.header1, 
			T.HEADER.DATA_TYPE.JSON);
		T.updDataCell(env.tablo1, env.header1, 0, 33);
		newDataType = T.HEADER.DATA_TYPE.INT;
		prevCellVal = T.getCell(env.tablo1, env.header1, 0);
	});
	
	it("updHeaderDataType()", function() {
		T.updHeaderDataType(env.tabenv, env.tablo1, env.header1, newDataType);
	});
	
	it("data updated", function() {
		assert.equal(T.getCell(env.tablo1, env.header1, 0), 
			prevCellVal);
	});
});

describe("updHeaderDataType JSON to FLOAT", function() {
	var env, newDataType, prevCellVal;
	
	before(function(){
		env = makenv1Tablo1Data1Line();
		T.updHeaderDataType(env.tabenv, env.tablo1, env.header1, 
			T.HEADER.DATA_TYPE.JSON);
		T.updDataCell(env.tablo1, env.header1, 0, 33.33);
		newDataType = T.HEADER.DATA_TYPE.FLOAT;
		prevCellVal = T.getCell(env.tablo1, env.header1, 0);
	});
	
	it("updHeaderDataType()", function() {
		T.updHeaderDataType(env.tabenv, env.tablo1, env.header1, newDataType);
	});
	
	it("data updated", function() {
		assert.equal(T.getCell(env.tablo1, env.header1, 0), 
			prevCellVal);
	});
});

describe("updHeaderDataType JSON string to STRING", function() {
	var env, newDataType, prevCellVal;
	
	before(function(){
		env = makenv1Tablo1Data1Line();
		T.updHeaderDataType(env.tabenv, env.tablo1, env.header1, 
			T.HEADER.DATA_TYPE.JSON);
		T.updDataCell(env.tablo1, env.header1, 0, "aaa");
		newDataType = T.HEADER.DATA_TYPE.STRING;
		prevCellVal = T.getCell(env.tablo1, env.header1, 0);
	});
	
	it("updHeaderDataType()", function() {
		T.updHeaderDataType(env.tabenv, env.tablo1, env.header1, newDataType);
	});
	
	it("data updated", function() {
		assert.equal(T.getCell(env.tablo1, env.header1, 0), 
			prevCellVal);
	});
});

describe("updHeaderDataType JSON object to STRING", function() {
	var env, newDataType, prevCellVal;
	
	before(function(){
		env = makenv1Tablo1Data1Line();
		T.updHeaderDataType(env.tabenv, env.tablo1, env.header1, 
			T.HEADER.DATA_TYPE.JSON);
		T.updDataCell(env.tablo1, env.header1, 0, {"x":33});
		newDataType = T.HEADER.DATA_TYPE.STRING;
		prevCellVal = T.getCell(env.tablo1, env.header1, 0);
	});
	
	it("updHeaderDataType()", function() {
		T.updHeaderDataType(env.tabenv, env.tablo1, env.header1, newDataType);
	});
	
	it("data updated", function() {
		assert.equal(T.getCell(env.tablo1, env.header1, 0), 
			JSON.stringify(prevCellVal));
	});
});

describe("updHeaderArgs()", function() {
	var env, newArg;
	
	before(function() {
		env = makenv2Tablo2Data1Func1Line();
	});
	
	it("updHeaderArgs()", function() {
		newArg = T.newColSamelineArg(env.tablo1.alias, env.header2.alias);
		T.updHeaderArgs(env.tabenv, env.tablo2, env.header3, [newArg]);
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
	it("reactMap updated", function() {
		assert.equal(
			0, T.getReactions(env.tabenv.reactMap, env.header1FullAlias).size
		);
		assert.equal(
			1, T.getReactions(env.tabenv.reactMap, env.header2FullAlias).size
		);
		assert.isTrue(T.hasReaction(
			env.tabenv.reactMap, env.header2FullAlias, env.header3FullAlias
		));
	});
});

describe("updHeaderFunc()", function() {
	var env, newFunc;
	
	before(function () {
		env = makenv2Tablo1Func1Line();
	});
	
	it("updHeaderFunc()", function() {
		newFunc = function(data) { return data + 1000 };
		T.updHeaderFunc(env.tabenv, env.tablo2, env.header2, newFunc);
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
	var env;
	
	before(function() {
		env = makenv2Tablo1Func1Line();
		env.tablo1.data[0][0] = 1000;
	});
	
	it("updFuncHeaderAllCells()", function() {
		T.updFuncHeaderAllCells(env.tabenv, env.tablo2, env.header2);
	});
	
	it("tablo data updated", function () {
		assert.equal(
			T.getCell(env.tablo2, env.header2, 0),
			env.header2.func(T.getCell(env.tablo1, env.header1, 0))
		);
	});
});

describe("updTabloAllFuncHeadersAllCells()", function() {
	var env;
	
	before(function() {
		env = makenv2Tablo2Data2Func1Line();
		env.tablo1.data[0][0] = 66;
		env.tablo1.data[0][1] = 2000;
	});
	
	it("updTabloAllFuncHeadersAllCells()", function() {
		T.updTabloAllFuncHeadersAllCells(env.tabenv, env.tablo2);
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
	var env;
	
	before(function() {
		env = makenv2Tablo2Data2Func1Line();
		env.tablo1.data[0][0] = 66;
		env.tablo1.data[0][1] = 2000;
	});
	
	it("updLineAllFuncCells()", function() {
		T.updLineAllFuncCells(env.tabenv, env.tablo2, 0);
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
	var env;
	
	before(function() {
		env = makenv2Tablo1Func1Line();
		env.tablo1.data[0][0] = 1000;
	});
	
	it("updFuncCell()", function() {
		T.updFuncCell(env.tabenv, env.tablo2, env.header2, 0);
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
		T.updDataCell(env.tablo1, env.header1, 0, 1000);
	});
	
	it("tablo data updated", function () {
		assert.equal(1000, T.getCell(env.tablo1, env.header1, 0));
	});
});


describe("delTablo", function() {
	var env;
	
	before(function() {
		env = makenv2Tablo1Func1Line();
	});
	
	it("delTablo()", function() {
		T.delTablo(env.tabenv, env.tablo1);
	});
	
	it("tablo deleted", function() {
		assert.isFalse(env.tabenv.tablos.has(env.tablo1.alias));
	});
	it("reactMap updated", function () {
		assert.isFalse(
			T.hasReactKey(env.tabenv.reactMap, env.header1FullAlias)
		);
	});
	it("other tablo updated", function () {
		assert.equal(env.header2.args[0].type, T.HEADER.ARG.TYPE.NULL);
		assert.equal(
			T.getCell(env.tablo2, env.header2, 0),
			env.header2.func(null)
		);
	});
});

describe("delHeader", function() {
	var env;
	
	before(function() {
		env = makenv2Tablo1Func1Line();
	});
	
	it("delHeader()", function() {
		T.delHeader(env.tabenv, env.tablo1, env.header1);
	});
	
	it("header deleted", function() {
		assert.isEmpty(env.tablo1.headers);
	});
	it("reactMap updated", function () {
		assert.isFalse(
			T.hasReactKey(env.tabenv.reactMap, env.header1FullAlias)
		);
	});
	it("other tablo updated", function () {
		assert.equal(env.header2.args[0].type, T.HEADER.ARG.TYPE.NULL);
		assert.equal(
			T.getCell(env.tablo2, env.header2, 0),
			env.header2.func(null)
		);
	});
});

describe("delArgFromHeader", function() {
	var env;
	
	before(function() {
		env = makenv2Tablo1Func1Line();
	});
	
	it("delArgFromHeader()", function() {
		T.delArgFromHeader(env.tabenv, env.tablo2, env.header2, 0);
	});
	
	it("arg deleted", function() {
		assert.isEmpty(env.header2.args);
	});
	it("reactMap updated", function () {
		assert.isEmpty(
			T.getReactions(env.tabenv.reactMap, env.header1FullAlias)
		);
	});
});

describe("delAllArgsFromHeader", function() {
	var env;
	
	before(function() {
		env = makenv2Tablo1Func1Line();
	});
	
	it("delAllArgsFromHeader()", function() {
		T.delAllArgsFromHeader(env.tabenv, env.tablo2, env.header2);
	});
	
	it("arg deleted", function() {
		assert.isEmpty(env.header2.args);
	});
	it("reactMap updated", function () {
		assert.isEmpty(
			T.getReactions(env.tabenv.reactMap, env.header1FullAlias)
		);
	});
});