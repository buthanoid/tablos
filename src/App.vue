<template>
	<div class="grille" >
		<div class="column-left" >
			<tablo-comp 
				v-for="tablo in tabenv.tablos.values()" 
				:alias="tablo.alias"
				:label="tablo.label"
				:display-num-lines="tablo.displayNumLines"
				:headers="tablo.headers"
				:nb-lines="tablo.data.length"
				:datatab="tablo.data"
				:selected="selected"
				:edit="edit"
				:texts="texts"
				@select-tablo="selectTablo"
				@select-header="selectHeader"
				@select-line="selectLine"
				@select-cell="selectCell"
				@start-edit="startEdit"
				@change-edit="changeEditCell"
				@submit-edit="submitEditCell"
				@cancel-edit="cancelEdit" >
			</tablo-comp>
		</div>
		<div class="column-right" >
			<select v-model="lang" >
				<option value="en" >English</option>
				<option value="fr" >Français</option>
			</select> <br />
			<button @click="newTablo" >{{texts["newTablo"]}}</button>
			<tablo-infos
				v-if="displayTabloInfos" 
				:alias="selected.tablo.alias"
				:label="selected.tablo.label"
				:display-num-lines="selected.tablo.displayNumLines"
				:nb-headers="selected.tablo.headers.length"
				:nb-lines="selected.tablo.data.length"
				:selected="selected"
				:edit="edit"
				:texts="texts"
				@del-tablo="delTablo"
				@add-new-header="newHeader"
				@add-new-line="newLine"
				@toggle-display-num-lines="toggleDisplayNumLines"
				@start-edit="startEdit"
				@change-edit="changeEditTablo"
				@submit-edit="submitEditTablo"
				@cancel-edit="cancelEdit" >
			</tablo-infos>
			<header-infos
				v-if="displayHeaderInfos"
				:tablos-list="tablosList"
				:headers-list="headersList"
				:tablo-alias="selected.tablo.alias"
				:header="selected.header"
				:nb-headers="selected.tablo.headers.length"
				:selected="selected"
				:edit="edit"
				:texts="texts"
				@start-edit="startEdit"
				@change-edit="changeEditHeader"
				@submit-edit="submitEditHeader"
				@cancel-edit="cancelEdit"
				@delete-header="deleteHeader"
				@lower-order="lowerOrder"
				@upper-order="upperOrder" >
			</header-infos>
			<line-infos
				v-if="displayLineInfos" 
				:num="selected.line" >
			</line-infos>
		</div>
	</div>
	<p v-if="lastAppError" class="incorrect" >
		<span>{{texts["LastError"]}} :</span> <br />
		<span>{{lastAppError}}</span>
	</p>
	<hr />
	ReactMap {{tabenv.reactMap}}
	<hr />
	selected.tablo {{selected.tablo}}
	<hr />
	selected.header {{selected.header}}
	<hr />
	SelectedLine {{selected.line}}
	<hr />
	Edit {{edit}}
</template>

<script>
"use strict";

import TabloComp from "./components/TabloComp.vue";
import TabloInfos from "./components/TabloInfos.vue";
import HeaderInfos from "./components/HeaderInfos.vue";
import LineInfos from "./components/LineInfos.vue";
import * as T from "./tablos.js";
import * as U from "./util.js";
import * as TEXTS_EN from "./texts_en.js";
import * as TEXTS_FR from "./texts_fr.js";

export default {
	components: { TabloComp, TabloInfos, HeaderInfos, LineInfos },
 	data: function () { return { 
		lang: "en",
		tabenv: T.newTabenv(),
		selected: { 
			target: U.TRG.NULL,
			tablo: null,
			header: null,
			line: null,
			cell: false
		},
		edit : {
			target: U.TRG.NULL,
			property: T.PROP.NULL,
			valid: true,
			msg: null
		},
		lastAppError: ""
	}},
	created: created,
	methods: {
		newTablo: newTablo,
		delTablo: delTablo,
		newHeader: newHeader,
		newLine: newLine,
		toggleDisplayNumLines: toggleDisplayNumLines,
		lowerOrder: lowerOrder,
		upperOrder: upperOrder,
		selectNothing: selectNothing,
		selectTablo: selectTablo,
		selectHeader: selectHeader,
		selectLine: selectLine,
		selectCell: selectCell,
		startEdit: startEdit,
		changeEditTablo: changeEditTablo,
		changeEditHeader: changeEditHeader,
		changeEditCell: changeEditCell,
		submitEditTablo: submitEditTablo,
		submitEditHeader: submitEditHeader,
		submitEditCell: submitEditCell,
		cancelEdit: cancelEdit,
		deleteHeader: deleteHeader
	},
	computed: {
		texts() {
			switch (this.lang) {
				case "en": return TEXTS_EN.TEXTS;
				case "fr": return TEXTS_FR.TEXTS;
				default: throw ("unmanaged lang " + this.lang);
			}
		},
		displayTabloInfos: function () { 
			return U.TRG_TABLO_EXT.includes(this.selected.target);
		},
		displayHeaderInfos: function () {
			return U.TRG_HEADER_EXT.includes(this.selected.target);
		},
		displayLineInfos: function () {
			return U.TRG_LINE_EXT.includes(this.selected.target);
		},
		tablosList: function () {
			var tablosList = [];
			this.tabenv.tablos.forEach(function (tablo) {
				tablosList.push({ alias: tablo.alias, label: tablo.label });
			});
			return tablosList;
		},
		headersList: function () {
			var headersList = new Map();
			this.tabenv.tablos.forEach(function (tablo) {
				headersList.set(
					tablo.alias, 
					tablo.headers.map(function (header) {
						return { alias: header.alias, label: header.label };
					})
				);
			});
			return headersList; 
		}
	}
};

function newTablo () {
	var i = 0;
	while (this.tabenv.tablos.has("newtablo" + i)) i++;
	
	var errs =  T.checkNewTablo(this.tabenv, "", "New Tablo " + i);
	
	if (errs.length == 0) {
		var tablo = T.newTablo(this.tabenv, "newtablo" + i, "New Tablo " + i);	
		this.selectTablo("newtablo" + i);
	}
	
	this.lastAppError = errs;
}

function delTablo () {
	T.delTablo(this.tabenv, this.selected.tablo);
	this.selectNothing();
}

function newHeader () {
	var i = 0 ;
	while (this.selected.tablo.getHeaderByAlias("newheader" + i)) i++;
	
	var errs = T.checkNewDataHeader(
		this.tabenv, this.selected.tablo, 
		"newheader" + i, "New Header " + i, T.HEADER.DATA_TYPE.INT
	);
	
	if (errs.length == 0) {
		var header = T.newDataHeader(
			this.tabenv, this.selected.tablo, 
			"newheader" + i, "New Header " + i, T.HEADER.DATA_TYPE.INT
		);	
		this.selectHeader(this.selected.tablo.alias, "newheader" + i);
	}
	
	this.lastAppError = errs;
}

function newLine () {
	var errs = T.checkNewLine(this.tabenv, this.selected.tablo);
	if (errs.length == 0) T.newLine(this.tabenv, this.selected.tablo);
	this.lastAppError = errs;
}

function toggleDisplayNumLines () {
	var errs = T.checkUpdTabloDisplayNumLines(
		this.selected.tablo, ! this.selected.tablo.displayNumLines
	);
	if (errs.length == 0) {
		T.updTabloDisplayNumLines(
			this.selected.tablo, ! this.selected.tablo.displayNumLines
		);
	}
	this.lastAppError = errs;
}

function lowerOrder () {
	var errs = T.checkUpdHeaderOrder(
		this.tabenv, this.selected.tablo, this.selected.header, 
		this.selected.header.order - 1
	);
	if (errs.length == 0) {
		T.updHeaderOrder(
			this.tabenv, this.selected.tablo, this.selected.header, 
			this.selected.header.order - 1
		);
	}
	this.lastAppError = errs;
}

function upperOrder () {
	var errs = 	T.checkUpdHeaderOrder(
		this.tabenv, this.selected.tablo, this.selected.header, 
		this.selected.header.order + 1
	);
	if (errs.length == 0) {
		T.updHeaderOrder(
			this.tabenv, this.selected.tablo, this.selected.header, 
			this.selected.header.order + 1
		);
	}
	this.lastAppError = errs;
}

function selectNothing () {
	this.selected.target = U.TRG.NULL;
	this.selected.tablo = null ; 
	this.selected.header = null ;
	this.selected.line = null ;
	this.selected.cell = false;
	this.lastAppError = "";
	return true;
}

function selectTablo (tabloAlias) {
	if (this.tabenv.tablos.has(tabloAlias)) {
		this.selectNothing();
		this.selected.target = U.TRG.TABLO;
		this.selected.tablo = this.tabenv.tablos.get(tabloAlias);
		this.cancelEdit();
		this.lastAppError = "";
		return true;
	}
	else {
		this.lastAppError = T.ERR.TABLO.ALIAS.NOT_FOUND;
		return false;
	}
}

function selectHeader (tabloAlias, headerAlias) {
	if (
		this.selected.tablo && 
		this.selectTablo(tabloAlias)
	) {
		var header = this.selected.tablo.getHeaderByAlias(headerAlias);
		if (header) {
			this.selected.target = U.TRG.HEADER;
			this.selected.header = header;
			this.cancelEdit();
			this.lastAppError = "";
			return true;
		}
		else {
			this.lastAppError = T.HEADER.ALIAS.NOT_FOUND ;
			return false;
		}
	}
	else return false;
}

function selectLine (tabloAlias, numLine) {
	if (this.selectTablo(tabloAlias)) {
		if (
			numLine >= 0 &&
			numLine < this.selected.tablo.data.length 
		) {
			this.selected.target = U.TRG.LINE;
			this.selected.line = numLine ;
			this.cancelEdit();
			this.lastAppError = "";
			return true
		}
		else {
			this.lastAppError = T.ERR.LINE.OUT_OF_BOUNDS ;
			return false;
		}
	}
	else return false;
}

function selectCell (tabloAlias, headerAlias, numLine) {
	if (this.selectHeader(tabloAlias, headerAlias)) {
		if (
			numLine >= 0 &&
			numLine < this.selected.tablo.data.length 
		) {
			this.selected.target = U.TRG.CELL;
			this.selected.line = numLine ;
			this.selected.cell = true;
			this.cancelEdit();
			this.lastAppError = "";
			return true;
		}
		else {
			this.lastAppError = T.ERR.LINE.OUT_OF_BOUNDS ;
			return false;
		}
	}
	else return false;
}

function startEdit (target, property) {
	this.edit.target = target;
	this.edit.property = property;
	this.edit.valid = true;
	this.edit.msg = "";
	this.lastAppError = "";
}

function changeEditTablo (newValue) {
	var errs;
	switch (this.edit.property) {
		case T.PROP.TABLO.ALIAS :
			errs = T.checkUpdTabloAlias(
				this.tabenv, this.selected.tablo, newValue);
			break;
		case T.PROP.TABLO.LABEL :
			errs = T.checkUpdTabloLabel(
				this.selected.tablo, newValue);
			break;
		default: errs = [ T.ERR.PROP.TABLO.UNKNOWN ];
	}
	this.edit.valid = (errs.length == 0);
	this.edit.msg = errs;
}

function changeEditHeader (newValue) {
	var errs ;
	switch (this.edit.property) {
		case T.PROP.HEADER.ALIAS:
			errs = T.checkUpdHeaderAlias (
				this.tabenv, this.selected.tablo, this.selected.header, 
				newValue);
			break;
		case T.PROP.HEADER.LABEL:
			errs = T.checkUpdHeaderLabel (this.selected.header, newValue);
			break;
		case T.PROP.HEADER.TYPE:
			errs = T.checkUpdHeaderType (
				this.tabenv, this.selected.tablo, this.selected.header, 
				newValue);
			break;
		case T.PROP.HEADER.DATA_TYPE:
			errs = T.checkUpdHeaderDataType(
				this.tabenv, this.selected.tablo, this.selected.header,
				newValue);
			break;
		case T.PROP.HEADER.ARGS:
			errs = T.checkUpdHeaderArgs (
				this.tabenv, this.selected.tablo, this.selected.header,
				newValue);
			break;
		case T.PROP.HEADER.FUNC:
			try {
				var func = T.parseStrToFunction(newValue);
				errs = T.checkUpdHeaderFunc (
					this.tabenv, this.selected.tablo, this.selected.header,
					func);
			}
			catch (errors) { errs = errors }
			break;
		default: errs = [ T.ERR.PROP.HEADER.UNKNOWN ];
	}
	this.edit.valid = (errs.length == 0);
	this.edit.msg = errs;
}

function changeEditCell (newValue) {
	this.edit.valid = true;
	this.edit.msg = "";
}

function submitEditTablo (newValue) {
	var errs ;
	switch (this.edit.property) {
		case T.PROP.TABLO.ALIAS:
			errs = T.checkUpdTabloAlias(
				this.tabenv, this.selected.tablo, newValue);
			if (errs.length == 0) {
				T.updTabloAlias(
					this.tabenv, this.selected.tablo, newValue);
			}
			break;
		case T.PROP.TABLO.LABEL:
			errs = T.checkUpdTabloLabel(this.selected.tablo, newValue);
			if (errs.length == 0) {
				T.updTabloLabel(this.selected.tablo, newValue);
			}
			break;
		case T.PROP.TABLO.DISPLAY_NUM_LINES:
			errs = T.checkUpdTabloDisplayNumLines(
				this.selected.tablo, newValue);
			if (errs.length == 0) {
				T.updTabloDisplayNumLines(this.selected.tablo, newValue);
			}
			break;
		default: errs = [ T.ERR.PROP.TABLO.UNKNOWN ];
	}
	this.cancelEdit();
	this.lastAppErrors = errs;
}

function submitEditHeader (newValue) {
	var errs ;
	switch (this.edit.property) {
		case T.PROP.HEADER.ALIAS:
			errs = T.checkUpdHeaderAlias(
				this.tabenv, this.selected.tablo, this.selected.header, 
				newValue);
			if (errs.length == 0) {
				T.updHeaderAlias(
					this.tabenv, this.selected.tablo, this.selected.header, 
					newValue);
			}
			break;
		case T.PROP.HEADER.LABEL:
			errs = T.checkUpdHeaderLabel(this.selected.header, newValue);
			if (errs.length == 0) {
				T.updHeaderLabel(this.selected.header, newValue);
			}
			break;
		case T.PROP.HEADER.TYPE:
			errs = T.checkUpdHeaderType (
				this.tabenv, this.selected.tablo, this.selected.header, 
				newValue);
			if (errs.length == 0) {
				T.updHeaderType (
					this.tabenv, this.selected.tablo, this.selected.header, 
					newValue);
			}
			break;
		case T.PROP.HEADER.DATA_TYPE:
			errs = T.checkUpdHeaderDataType (
				this.tabenv, this.selected.tablo, this.selected.header, 
				newValue);
			if (errs.length == 0) {
				T.updHeaderDataType (
					this.tabenv, this.selected.tablo, this.selected.header, 
					newValue );
			}
			break;
		case T.PROP.HEADER.ARGS:
			errs = T.checkUpdHeaderArgs(
				this.tabenv, this.selected.tablo, this.selected.header, 
				newValue);
			if (errs.length == 0) {
				T.updHeaderArgs(
					this.tabenv, this.selected.tablo, this.selected.header, 
					newValue);
				errs.concat(T.checkUpdFuncHeaderAllCells(
					this.tabenv, this.selected.tablo, this.selected.header));
				if (errs.length == 0) {
					T.updFuncHeaderAllCells(
						this.tabenv, this.selected.tablo, this.selected.header);
				}
			}
			break;
		case T.PROP.HEADER.FUNC:
			try {
				var func = T.parseStrToFunction(newValue);
				errs = T.checkUpdHeaderFunc(
					this.tabenv, this.selected.tablo, this.selected.header, 
					func);
				if (errs.length == 0) {
					T.updHeaderFunc(
						this.tabenv, this.selected.tablo, this.selected.header, 
						func);
				}
			}
			catch(error) { errs = [error] }
			break;
		default: errs = [ T.ERR.PROP.HEADER.UNKNOWN ];
	}
	this.cancelEdit();
	this.lastAppErrors = errs;
}

function submitEditCell (newValue) {
	switch (this.selected.header.dataType) {
		case T.HEADER.DATA_TYPE.INT:
			newValue = parseInt(newValue);
			break;
		case T.HEADER.DATA_TYPE.FLOAT:
			newValue = parseFloat(newValue);
			break;
		case T.HEADER.DATA_TYPE.STRING:
			newValue = new String(newValue).valueOf();
			break;
		case T.HEADER.DATA_TYPE.JSON:
			newValue = JSON.parse(newValue);
			break;
		default: this.lastAppError = T.ERR.HEADER.DATA_TYPE.UNKNOWN ;
	}
	T.updDataCell(
		this.tabenv, this.selected.tablo, this.selected.header,
		this.selected.line, newValue
	);
	T.updCellReactions(
		this.tabenv, this.selected.tablo, this.selected.header,
		this.selected.line
	);
	this.cancelEdit();
}

function cancelEdit () {
	this.edit.target = U.TRG.NULL;
	this.edit.property = T.PROP.NULL;
	this.edit.valid = true;
	this.edit.msg = null;
	this.lastAppError = "";
}

function deleteHeader () {
	T.delHeader(
		this.tabenv, this.selected.tablo, this.selected.header
	);
	this.selectTablo(this.selected.tablo.alias);
	this.cancelEdit();
}

function created () {
	
	var errs = [];
	
	errs.concat(T.checkNewTablo(this.tabenv, "users", "Users"));
	var users = T.newTablo(this.tabenv, "users", "Users");

	
	errs.concat(T.checkNewDataHeader(
		this.tabenv, users, "name", "Name", T.HEADER.DATA_TYPE.STRING));
	var usersName = T.newDataHeader(
		this.tabenv, users, "name", "Name", T.HEADER.DATA_TYPE.STRING);
	
	var usersCash = T.newDataHeader(
		this.tabenv, users, "cash", "Cash", T.HEADER.DATA_TYPE.INT);
	
	var usersDebt = T.newDataHeader(
		this.tabenv, users, "debt", "Debt", T.HEADER.DATA_TYPE.INT);
		
	var usersComputed = T.newFuncHeader(
		this.tabenv, users, "computed", "Computed", [ 
			T.newColSamelineArg("users", "cash"), 
			T.newColSamelineArg("users", "debt") ],
		function (cash, debt) { return cash - debt; }
	);
	
	var usersAftertax = T.newFuncHeader(
		this.tabenv, users, "aftertax", "After Tax",
		[ T.newColSamelineArg("users", "computed") ],
		function (computed) { return computed - 12; }
	);
	
	T.newLine(this.tabenv, users); 
	T.updDataCell(this.tabenv, users, usersName, 0, "yayatoto");
	T.updDataCell(this.tabenv, users, usersCash, 0, 10);
	T.updDataCell(this.tabenv, users, usersDebt, 0, 5);
	T.updCellReactions(this.tabenv, users, usersName, 0);
	T.updCellReactions(this.tabenv, users, usersCash, 0);
	T.updCellReactions(this.tabenv, users, usersDebt, 0);

	T.newLine(this.tabenv, users);
	T.updDataCell(this.tabenv, users, usersName, 1, "magdalena");
	T.updDataCell(this.tabenv, users, usersCash, 1, 35);
	T.updDataCell(this.tabenv, users, usersDebt, 1, 100);
	T.updCellReactions(this.tabenv, users, usersName, 1);
	T.updCellReactions(this.tabenv, users, usersCash, 1);
	T.updCellReactions(this.tabenv, users, usersDebt, 1);

	var total = T.newTablo(this.tabenv, "total", "Total");
	
	var totalName = T.newFuncHeader(
		this.tabenv, total, "name", "Name",
		[ T.newColSamelineArg("users", "name") ],
		function (name) { return name }
	);
	
	var totalTotal = T.newFuncHeader(
		this.tabenv, total, "total", "Total", [
			T.newColSamelineArg("users", "cash"), 
			T.newColSamelineArg("users", "debt"),
			T.newColSamelineArg("users", "computed"),
			T.newColSamelineArg("users", "aftertax") ],
		function (cash, debt, computed, aftertax) {
			return cash + debt + computed + aftertax; 
		}
	);
	
	T.newLine(this.tabenv, total);
	T.updLineAllFuncCells (this.tabenv, total, 0);
	
	T.newLine(this.tabenv, total);
	T.updLineAllFuncCells (this.tabenv, total, 1);
	
	if (errs.length > 0 ) this.lastAppError = errs;
	else this.lastAppError = "";
}
</script>