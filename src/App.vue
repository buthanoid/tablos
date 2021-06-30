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
			<button @click="newTablo" >nouveau tablo</button>
			<tablo-infos
				v-if="displayTabloInfos" 
				:alias="selected.tablo.alias"
				:label="selected.tablo.label"
				:display-num-lines="selected.tablo.displayNumLines"
				:nb-headers="selected.tablo.headers.length"
				:nb-lines="selected.tablo.data.length"
				:edit="edit"
				@del-tablo="delTablo"
				@add-new-header="newHeader"
				@add-new-line="newLine"
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
				:edit="edit"
				@start-edit="startEdit"
				@change-edit="changeEditHeader"
				@submit-edit="submitEditHeader"
				@cancel-edit="cancelEdit"
				@delete-header="deleteHeader" >
			</header-infos>
			<line-infos
				v-if="displayLineInfos" 
				:num="selected.line" >
			</line-infos>
		</div>
	</div>
	<p v-if="lastAppError" class="incorrect" >
		<span>Dernière erreur :</span> <br />
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
import TabloComp from "./components/TabloComp.vue";
import TabloInfos from "./components/TabloInfos.vue";
import HeaderInfos from "./components/HeaderInfos.vue";
import LineInfos from "./components/LineInfos.vue";
import * as TabLib from "./tablos.js";
import * as U from "./util.js";

export default {
	components: { TabloComp, TabloInfos, HeaderInfos, LineInfos },
 	data: function ()	{
		return { 
			tabenv: TabLib.newTabenv(),
			selected: { 
				target: U.TRG.NULL,
				tablo: null,
				header: null,
				line: null,
				cell: false
			},
			edit : {
				target: null,
				property: null,
				valid: true,
				msg: null
			},
			lastAppError: ""
		}
	},
	created: created,
	methods: {
		newTablo: function () {
			var i = 0;
			while (this.tabenv.tablos.has("newtablo" + i)) i++;
			
			var res = TabLib.newTablo(
				this.tabenv, "newtablo" + i, "New Tablo " + i);
				
			if (res.success) this.selectTablo("newtablo" + i);
			this.lastAppError = res.errors;
		},
		delTablo: function () {
			var res = TabLib.delTablo(this.tabenv, this.selected.tablo);
			this.selectNothing();
			this.lastAppError = res.errors;
		},
		newHeader: function () {
			var i = 0 ;
			while (this.selected.tablo.getHeaderByAlias("newheader" + i)) i++;
			
			var res = TabLib.newDataHeader(
				this.tabenv, this.selected.tablo, 
				"newheader" + i, "New Header " + i
			);
			
			if (res.success) {
				this.selectHeader(this.selected.tablo.alias, "newheader" + i);
			}
			this.lastAppError = res.errors;
		},
		newLine: function () {
			var res = TabLib.newLine(this.tabenv, this.selected.tablo);
			this.lastAppError = res.errors;
		},
		selectNothing: function () {
			this.selected.target = U.TRG.NULL;
			this.selected.tablo = null ; 
			this.selected.header = null ;
			this.selected.line = null ;
			this.selected.cell = false;
		},
		selectTablo: function (tabloAlias) {
			this.selectNothing();
			this.selected.target = U.TRG.TABLO;
			this.selected.tablo = this.tabenv.tablos.get(tabloAlias);
			this.cancelEdit();
			this.lastAppError = "";
		},
		selectHeader: function (tabloAlias, headerAlias) {
			this.selectTablo(tabloAlias);
			this.selected.target = U.TRG.HEADER;
			this.selected.header = 
				this.selected.tablo.getHeaderByAlias(headerAlias);
			this.cancelEdit();
			this.lastAppError = "";
		},
		selectLine: function (tabloAlias, numLine) {
			this.selectTablo(tabloAlias);
			this.selected.target = U.TRG.LINE;
			this.selected.line = numLine ;
			this.cancelEdit();
			this.lastAppError = "";
		},
		selectCell: function (tabloAlias, headerAlias, numLine) {
			this.selectHeader(tabloAlias, headerAlias);
			this.selected.target = U.TRG.CELL;
			this.selected.line = numLine ;
			this.selected.cell = true;
			this.cancelEdit();
			this.lastAppError = "";
		},
		startEdit: function (target, property) {
			this.edit.target = target;
			this.edit.property = property;
			this.edit.valid = true;
			this.edit.msg = "";
			this.lastAppError = "";
		},
		changeEditTablo: changeEditTablo,
		changeEditHeader: changeEditHeader,
		changeEditCell: changeEditCell,
		submitEditTablo: submitEditTablo,
		submitEditHeader: submitEditHeader,
		submitEditCell: submitEditCell,
		cancelEdit: function () {
			this.edit.target = null;
			this.edit.property = null;
			this.edit.valid = true;
			this.edit.msg = null;
			this.lastAppError = "";
		},
		deleteHeader: function () {
			var res = TabLib.delHeader(
				this.tabenv, this.selected.tablo, this.selected.header
			);
			this.selected.header = { alias: null };
			this.cancelEdit();
			this.lastAppError = res.errors;
		}
	},
	computed: {
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

function changeEditTablo (newValue) {
	var res = TabLib.newRes();
	switch (this.edit.property) {
		case "alias" :
			TabLib.checkUpdTabloAlias(
				this.tabenv, this.selected.tablo.alias, newValue, res
			);
			break;
		case "label" :
			TabLib.checkTabloLabel(newValue, res);
			break;
		case "displayNumLines":
			TabLib.checkTabloDisplayNumLines(newValue, res);
			break;
		default: 
			res.addError("unmanaged or unknown property");
			console.log("unmanaged or unknown property");
	}
	this.edit.valid = res.success;
	this.edit.msg = res.errors;
}

function changeEditHeader (newValue) {
	var res = TabLib.newRes();
	switch (this.edit.property) {
		case "alias":
			TabLib.checkUpdHeaderAlias (
				this.selected.tablo,
				this.selected.tablo.alias, newValue, res);
			break;
		case "label":
			TabLib.checkHeaderLabel (newValue, res);
			break;
		case "type":
			TabLib.checkHeaderType (newValue, res);
			break;
		case "order":
			TabLib.checkHeaderOrder (this.selected.tablo, newValue, res);
			break;
		case "args":
			TabLib.checkHeaderArgs (this.tabenv.tablos, newValue, res);
			break;
		case "func":
			TabLib.checkHeaderFunc (newValue, res);
			break;
		default:
			res.addError("unmanaged or unknown property");
			console.log("unmanaged or unknown property");
	}
	this.edit.valid = res.success;
	this.edit.msg = res.errors;
}

function changeEditCell (newValue) {
	this.edit.valid = true;
	this.edit.msg = "";
}

function submitEditTablo (newValue) {
	var res;
	switch (this.edit.property) {
		case "alias":
			res = 
				TabLib.updTabloAlias(this.tabenv, this.selected.tablo, newValue);
			break;
		case "label":
			res = TabLib.updTabloLabel(this.selected.tablo, newValue);
			break;
		case "displayNumLines":
			res = TabLib.updTabloDisplayNumLines(this.selected.tablo, newValue);
			break;
		default: 
			res.addError("unmanaged or unknown property");
			console.log("unmanaged or unknown property");
	}
	this.cancelEdit();
	this.lastAppError = res.errors;
}

function submitEditHeader (newValue) {
	var res;
	switch (this.edit.property) {
		case "alias":
			res = TabLib.updHeaderAlias(
				this.tabenv, this.selected.tablo, this.selected.header, newValue
			);
			break;
		case "label":
			res = TabLib.updHeaderLabel(this.selected.header, newValue);
			break;
		case "type":
			res = TabLib.updHeaderType (
				this.tabenv, this.selected.tablo, this.selected.header, newValue
			);
			break;
		case "order":
			res = TabLib.updHeaderOrder(
				this.tabenv, this.selected.tablo, this.selected.header, newValue
			);
			break;
		case "args":
			res = TabLib.updHeaderArgs(
				this.tabenv, this.selected.tablo, this.selected.header, newValue
			);
			res.combine(TabLib.updFuncHeaderAllCells(
				this.tabenv, this.selected.tablo, this.selected.header
			));
			break;
		case "func":
			res = TabLib.parseStrToFunction(newValue);
			if (res.success) {
				res.combine(TabLib.updHeaderFunc(
					this.tabenv, this.selected.tablo, this.selected.header, 
					res.value
				));
			}
			break;
		default:
			res.addError("unmanaged or unknown property"); 
			console.log("unmanaged or unknown property");
	}
	this.cancelEdit();
	this.lastAppError = res.errors;
}

function submitEditCell (newValue) {
	var res = TabLib.updDataCell(
		this.tabenv, this.selected.tablo, this.selected.header,
		this.selected.line, newValue
	);
	this.cancelEdit();
	this.lastAppError = res.errors;
}

function created () {
	
	var res = TabLib.newRes();
	
	res.combine(TabLib.newTablo(this.tabenv, "users", "Users"));
	var users = res.value;
	
	res.combine (TabLib.newDataHeader(this.tabenv, users, "name", "Name"));
	var usersName = res.value;
	
	res.combine(TabLib.newDataHeader(this.tabenv, users, "cash", "Cash"));
	var usersCash = res.value;
	
	res.combine(TabLib.newDataHeader(this.tabenv, users, "debt", "Debt"));
	var usersDebt = res.value;
		
	res.combine(TabLib.newFuncHeader(
		this.tabenv, users, "computed", "Computed", [ 
			TabLib.newColSamelineArg("users", "cash"), 
			TabLib.newColSamelineArg("users", "debt") ],
		function (cash, debt) { return cash - debt; }
	));
	var usersComputed = res.value;
	
	res.combine(TabLib.newFuncHeader(
		this.tabenv, users, "aftertax", "After Tax",
		[ TabLib.newColSamelineArg("users", "computed") ],
		function (computed) { return computed - 12; }
	));
	var usersAftertax = res.value;
	
	TabLib.newLine(this.tabenv, users); 
	TabLib.updDataCell(this.tabenv, users, usersName, 0, "yayatoto");
	TabLib.updDataCell(this.tabenv, users, usersCash, 0, 10);
	TabLib.updDataCell(this.tabenv, users, usersDebt, 0, 5);

	TabLib.newLine(this.tabenv, users);
	TabLib.updDataCell(this.tabenv, users, usersName, 1, "magdalena");
	TabLib.updDataCell(this.tabenv, users, usersCash, 1, 35);
	TabLib.updDataCell(this.tabenv, users, usersDebt, 1, 100);

	res.combine(TabLib.newTablo(this.tabenv, "total", "Total"));
	var total = res.value;
	
	res.combine(TabLib.newFuncHeader(
		this.tabenv, total, "name", "Name",
		[ TabLib.newColSamelineArg("users", "name") ],
		function (name) { return name }
	));
	var totalName = res.value;
	
	res.combine(TabLib.newFuncHeader(
		this.tabenv, total, "total", "Total", [
			TabLib.newColSamelineArg("users", "cash"), 
			TabLib.newColSamelineArg("users", "debt"),
			TabLib.newColSamelineArg("users", "computed"),
			TabLib.newColSamelineArg("users", "aftertax") ],
		function (cash, debt, computed, aftertax) {
			return cash + debt + computed + aftertax; 
		}
	));
	var totalTotal = res.value;
	
	TabLib.newLine(this.tabenv, total);
	TabLib.updLineAllFuncCells (this.tabenv, total, 0);
	
	TabLib.newLine(this.tabenv, total);
	TabLib.updLineAllFuncCells (this.tabenv, total, 1);
}
</script>