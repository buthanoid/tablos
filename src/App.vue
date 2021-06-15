<template>
	<div class="grille" >
		<div class="column-left" >
			<tablo-comp 
				v-for="tablo in tabenv.tablos.values()" 
				:alias="tablo.alias"
				:label="tablo.label"
				:display-num-lines="tablo.displayNumLines"
				:headers="tablo.headers"
				:nb-lines="tablo.nbLines"
				:datatab="tablo.data"
				:is-selected="tablo.alias == selectedTablo.alias" 
				:selected-header-alias="selectedHeader.alias"
				@select-tablo="selectTablo"
				@select-header="selectHeader"
			></tablo-comp>
		</div>
		<div class="column-right" >
			<button @click="newTablo" >nouveau tablo</button>
			<tablo-infos
				v-if="selectedTablo.alias != null"
				:alias="selectedTablo.alias"
				:label="selectedTablo.label"
				:display-num-lines="selectedTablo.displayNumLines"
				:nb-headers="selectedTablo.headers.length"
				:nb-lines="selectedTablo.nbLines"
				:edit="edit"
				@del-tablo="delTablo"
				@add-new-header="newHeader"
				@add-new-line="newLine"
				@start-edit="startEdit"
				@change-edit="changeEditTablo"
				@submit-edit="submitEditTablo"
				@cancel-edit="cancelEdit"
			></tablo-infos>
			<header-infos
				v-if="selectedHeader.alias != null"
				:tablos-list="tablosList"
				:headers-list="headersList"
				:tablo-alias="selectedTablo.alias"
				:header="selectedHeader"
				:nb-headers="selectedTablo.headers.length"
				:edit="edit"
				@start-edit="startEdit"
				@change-edit="changeEditHeader"
				@submit-edit="submitEditHeader"
				@cancel-edit="cancelEdit"
				@delete-header="deleteHeader"
			></header-infos>
		</div>
	</div>
	<hr />
	{{tabenv.follows}}
	<hr />
	{{selectedTablo}}
	<hr />
	{{selectedHeader}}
	<hr />
	{{edit}}
</template>

<script>
import TabloComp from "./components/TabloComp.vue";
import TabloInfos from "./components/TabloInfos.vue";
import HeaderInfos from "./components/HeaderInfos.vue";
import * as TabLib from "./tablos.js";
import { validTabloProperty, validHeaderProperty } from "./validators.js";

export default {
	components: { TabloComp, TabloInfos, HeaderInfos },
 	data: function ()	{
		return { 
			tabenv: TabLib.newTabenv(),
			selectedTablo: { alias: null },
			selectedHeader: { alias: null },
			edit : {
				target: null,
				property: null,
				valid: true,
				msg: null
			}
		}
	},
	created: created,
	methods: {
		newTablo: function () {
			var i = 0;
			while (this.tabenv.tablos.has("newtablo" + i)) i++;
			TabLib.newTablo(this.tabenv, "newtablo" + i, "New Tablo " + i);
			this.selectTablo("newtablo" + i);
		},
		delTablo: function () {
			TabLib.delTablo(this.tabenv, this.selectedTablo);
			this.selectNothing();
		},
		newHeader: function () {
			var i = 0 ;
			while (
				TabLib.getByAlias(this.selectedTablo.headers, "newheader" + i)
			){
				i++;
			}
			TabLib.newDataHeader(
				this.tabenv, this.selectedTablo, 
				"newheader" + i, "New Header " + i
			);
			this.selectHeader(this.selectedTablo.alias, "newheader" + i);
		},
		newLine: function () {
			TabLib.addNewLine(this.tabenv, this.selectedTablo);
		},
		selectNothing: function () {
			this.selectedTablo = { alias: null }; 
			this.selectedHeader = { alias: null };
		},
		selectTablo: function (tabloAlias) {
			if (tabloAlias == this.selectedTablo.alias) this.selectNothing();
			else {
				this.selectedTablo = this.tabenv.tablos.get(tabloAlias); 
				this.selectedHeader = { alias: null };
			}
			this.cancelEdit();
		},
		selectHeader: function (tabloAlias, headerAlias) {
			if (this.selectedTablo.alias == tabloAlias &&
				this.selectedHeader.alias == headerAlias) {
				this.selectedHeader = { alias: null }; 
			}
			else {
				this.selectedTablo = this.tabenv.tablos.get(tabloAlias);
				this.selectedHeader = 
					TabLib.getByAlias(this.selectedTablo.headers, headerAlias);
			}
			this.cancelEdit();
		},
		startEdit: function (target, property) {
			this.edit.target = target;
			this.edit.property = property;
			this.edit.valid = true;
			this.edit.msg = "";
		},
		changeEditTablo: changeEditTablo,
		changeEditHeader: changeEditHeader,
		submitEditTablo: submitEditTablo,
		submitEditHeader: submitEditHeader,
		cancelEdit: function () {
			this.edit.target = null;
			this.edit.property = null;
			this.edit.valid = true;
			this.edit.msg = null;
		},
		deleteHeader: function () {
			TabLib.delHeader(
				this.tabenv, this.selectedTablo, this.selectedHeader.alias
			);
			this.selectedHeader = { alias: null };
			this.cancelEdit();
		}
	},
	computed: {
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

function changeEditTablo (newValue) {
	var res = validTabloProperty(
		this.tabenv, this.selectedTablo,
		this.edit.property, newValue
	);
	this.edit.valid = res.valid;
	this.edit.msg = res.msg;
}

function changeEditHeader (newValue) {
	var res = validHeaderProperty(
		this.tabenv.tablos,
		this.selectedTablo, this.selectedHeader,
		this.edit.property, newValue
	);
	this.edit.valid = res.valid;
	this.edit.msg = res.msg;
}

function submitEditTablo (newValue) {
	var res = validTabloProperty(
		this.tabenv, this.selectedTablo,
		this.edit.property, newValue
	);
	this.edit.valid = res.valid;
	this.edit.msg = res.msg;
	if (! this.edit.valid) {
		console.log("unvalid newValue for submitEditTablo : " + newValue);
		return false;
	}
	switch (this.edit.property) {
		case "alias":
			TabLib.updTabloAlias(this.tabenv, this.selectedTablo, newValue);
			break;
		case "label":
			this.selectedTablo.label = newValue;
			break;
		case "displayNumLines":
			this.selectedTablo.displayNumLines = newValue;
			break;
		default: console.log("unknown property");
	}
	this.cancelEdit();
	return true;
}

function submitEditHeader (newValue) {
	var res = validHeaderProperty(
		this.tabenv.tablos,
		this.selectedTablo, this.selectedHeader,
		this.edit.property, newValue
	);
	this.edit.valid = res.valid;
	this.edit.msg = res.msg;
	if (! this.edit.valid) {
		console.log("unvalid newValue for submitEditHeader : " + newValue);
		return false;
	}
	switch (this.edit.property) {
		case "alias":
			TabLib.updHeaderAlias(
				this.tabenv, this.selectedTablo,
				this.selectedHeader.alias, newValue
			);
			break;
		case "label":
			this.selectedHeader.label = newValue;
			break;
		case "type":
			TabLib.updHeaderType (
				this.tabenv, this.selectedTablo, this.selectedHeader, newValue
			);
			break;
		case "order":
			TabLib.updHeaderOrder(
				this.tabenv, this.selectedTablo, this.selectedHeader, newValue
			);
			break;
		case "args":
			TabLib.updHeaderArgs(
				this.tabenv, this.selectedTablo, this.selectedHeader, newValue
			);
			TabLib.updFuncHeaderCells(
				this.tabenv, this.selectedTablo, this.selectedHeader
			);
			break;
		case "func":
			var code = "\"use strict\"; return (" + newValue + ");";
			var f = new Function(code) ();
			TabLib.updHeaderFunc(
				this.tabenv, this.selectedTablo, this.selectedHeader, f
			);
			break;
		default: console.log("unknown property");
	}
	this.cancelEdit();
	return true; 
}

function created () {
	
	var users = TabLib.newTablo(this.tabenv, "users", "Users");

	var usersName = TabLib.newDataHeader(this.tabenv, users, "name", "Name");
	var usersCash = TabLib.newDataHeader(this.tabenv, users, "cash", "Cash");
	var usersDebt = TabLib.newDataHeader(this.tabenv, users, "debt", "Debt");
	
	var usersComputed = TabLib.newFuncHeader(
		this.tabenv, users, "computed", "Computed", [ 
			TabLib.newColSamelineArg("users", "cash"), 
			TabLib.newColSamelineArg("users", "debt") ],
		function (cash, debt) { return cash - debt; }
	);
	
	var usersAftertax = TabLib.newFuncHeader(
		this.tabenv, users, "aftertax", "After Tax",
		[ TabLib.newColSamelineArg("users", "computed") ],
		function (computed) { return computed - 12; }
	);

	TabLib.addNewLine(this.tabenv, users); 
	
	TabLib.updCell(this.tabenv, users, usersName, 0, "yayatoto");
	TabLib.updCell(this.tabenv, users, usersCash, 0, 10);
	TabLib.updCell(this.tabenv, users, usersDebt, 0, 5);

	TabLib.addNewLine(this.tabenv, users);
	
	TabLib.updCell(this.tabenv, users, usersName, 1, "magdalena");
	TabLib.updCell(this.tabenv, users, usersCash, 1, 35);
	TabLib.updCell(this.tabenv, users, usersDebt, 1, 100);

	var total = TabLib.newTablo(this.tabenv, "total", "Total");
	
	var totalName = TabLib.newFuncHeader(
		this.tabenv, total, "name", "Name",
		[ TabLib.newColSamelineArg("users", "name") ],
		function (name) { return name }
	);
	
	var totalTotal = TabLib.newFuncHeader(
		this.tabenv, total, "total", "Total", [
			TabLib.newColSamelineArg("users", "cash"), 
			TabLib.newColSamelineArg("users", "debt"),
			TabLib.newColSamelineArg("users", "computed"),
			TabLib.newColSamelineArg("users", "aftertax") ],
		function (cash, debt, computed, aftertax) {
			return cash + debt + computed + aftertax; 
		}
	);
	
	TabLib.addNewLine(this.tabenv, total);
	TabLib.addNewLine(this.tabenv, total);
	
	TabLib.updCell(this.tabenv, total, totalName, 0, null);
	TabLib.updCell(this.tabenv, total, totalName, 1, null);
	TabLib.updCell(this.tabenv, total, totalTotal, 0, null);
	TabLib.updCell(this.tabenv, total, totalTotal, 1, null);
}
</script>