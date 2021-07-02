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
				:edit="edit"
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
			
			var tablo = TabLib.newTablo(
				this.tabenv, "newtablo" + i, "New Tablo " + i);
				
			this.selectTablo("newtablo" + i);
		},
		delTablo: function () {
			TabLib.delTablo(this.tabenv, this.selected.tablo);
			this.selectNothing();
		},
		newHeader: function () {
			var i = 0 ;
			while (this.selected.tablo.getHeaderByAlias("newheader" + i)) i++;
			
			var header = TabLib.newDataHeader(
				this.tabenv, this.selected.tablo, 
				"newheader" + i, "New Header " + i, TabLib.DATA_TYPE.INT
			);
			
			this.selectHeader(this.selected.tablo.alias, "newheader" + i);
		},
		newLine: function () {
			TabLib.newLine(this.tabenv, this.selected.tablo);
		},
		toggleDisplayNumLines: function () {
			TabLib.updTabloDisplayNumLines(
				this.selected.tablo, ! this.selected.tablo.displayNumLines
			);
		},
		lowerOrder: function () {
			TabLib.updHeaderOrder(
				this.tabenv, this.selected.tablo, this.selected.header, 
				this.selected.header.order - 1
			);
		},
		upperOrder: function () {
			TabLib.updHeaderOrder(
				this.tabenv, this.selected.tablo, this.selected.header, 
				this.selected.header.order + 1
			);
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
			TabLib.delHeader(
				this.tabenv, this.selected.tablo, this.selected.header
			);
			this.selected.header = { alias: null };
			this.cancelEdit();
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
	var errs;
	switch (this.edit.property) {
		case "alias" :
			errs = TabLib.checkUpdTabloAlias(
				this.tabenv, this.selected.tablo, newValue);
			break;
		case "label" :
			errs = TabLib.checkUpdTabloLabel(
				this.selected.tablo, newValue);
			break;
		default: errs = [ ERR.TABLO.UNKNOWN_PROPERTY ];
	}
	this.edit.valid = (errs.length == 0);
	this.edit.msg = errs;
}

function changeEditHeader (newValue) {
	var errs ;
	switch (this.edit.property) {
		case "alias":
			errs = TabLib.checkUpdHeaderAlias (
				this.tabenv, this.selected.tablo, this.selected.header, 
				newValue);
			break;
		case "label":
			errs = TabLib.checkUpdHeaderLabel (this.selected.header, newValue);
			break;
		case "type":
			errs = TabLib.checkUpdHeaderType (
				this.tabenv, this.selected.tablo, this.selected.header, 
				newValue);
			break;
		case "dataType":
			errs = TabLib.checkUpdHeaderDataType(
				this.tabenv, this.selected.tablo, this.selected.header,
				newValue);
			break;
		case "args":
			errs = TabLib.checkUpdHeaderArgs (
				this.tabenv, this.selected.tablo, this.selected.header,
				newValue);
			break;
		case "func":
			try {
				var func = TabLib.parseStrToFunction(newValue);
				errs = TabLib.checkUpdHeaderFunc (
					this.tabenv, this.selected.tablo, this.selected.header,
					func);
			}
			catch (errors) { errs = errors }
			break;
		default: errs = [ ERR.HEADER.UNKNOWN_PROPERTY ];
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
		case "alias":
			errs = TabLib.checkUpdTabloAlias(
				this.tabenv, this.selected.tablo, newValue);
			if (errs.length == 0) {
				TabLib.updTabloAlias(
					this.tabenv, this.selected.tablo, newValue);
			}
			break;
		case "label":
			errs = TabLib.checkUpdTabloLabel(this.selected.tablo, newValue);
			if (errs.length == 0) {
				TabLib.updTabloLabel(this.selected.tablo, newValue);
			}
			break;
		case "displayNumLines":
			errs = TabLib.checkUpdTabloDisplayNumLines(
				this.selected.tablo, newValue);
			if (errs.length == 0) {
				TabLib.updTabloDisplayNumLines(this.selected.tablo, newValue);
			}
			break;
		default: errs = [ ERR.TABLO.UNKNOWN_PROPERTY ];
	}
	this.cancelEdit();
	this.lastAppErrors = errs;
}

function submitEditHeader (newValue) {
	var errs ;
	switch (this.edit.property) {
		case "alias":
			errs = TabLib.checkUpdHeaderAlias(
				this.tabenv, this.selected.tablo, this.selected.header, 
				newValue);
			if (errs.length == 0) {
				TabLib.updHeaderAlias(
					this.tabenv, this.selected.tablo, this.selected.header, 
					newValue);
			}
			break;
		case "label":
			errs = TabLib.checkUpdHeaderLabel(this.selected.header, newValue);
			if (errs.length == 0) {
				TabLib.updHeaderLabel(this.selected.header, newValue);
			}
			break;
		case "type":
			errs = TabLib.checkUpdHeaderType (
				this.tabenv, this.selected.tablo, this.selected.header, 
				newValue);
			if (errs.length == 0) {
				TabLib.updHeaderType (
					this.tabenv, this.selected.tablo, this.selected.header, 
					newValue);
			}
			break;
		case "dataType":
			errs = TabLib.checkUpdHeaderDataType (
				this.tabenv, this.selected.tablo, this.selected.header, 
				newValue);
			if (errs.length == 0) {
				TabLib.updHeaderDataType (
					this.tabenv, this.selected.tablo, this.selected.header, 
					newValue );
			}
			break;
		case "args":
			errs = TabLib.checkUpdHeaderArgs(
				this.tabenv, this.selected.tablo, this.selected.header, 
				newValue);
			if (errs.length == 0) {
				TabLib.updHeaderArgs(
					this.tabenv, this.selected.tablo, this.selected.header, 
					newValue);
				errs.concat(TabLib.checkUpdFuncHeaderAllCells(
					this.tabenv, this.selected.tablo, this.selected.header));
				if (errs.length == 0) {
					TabLib.updFuncHeaderAllCells(
						this.tabenv, this.selected.tablo, this.selected.header);
				}
			}
			break;
		case "func":
			try {
				var func = TabLib.parseStrToFunction(newValue);
				errs = TabLib.checkUpdHeaderFunc(
					this.tabenv, this.selected.tablo, this.selected.header, 
					func);
				if (errs.length == 0) {
					TabLib.updHeaderFunc(
						this.tabenv, this.selected.tablo, this.selected.header, 
						func);
				}
			}
			catch(error) { errs = [error] }
			break;
		default: errs = [ ERR.HEADER.UNKNOW_PROPERTY ];
	}
	this.cancelEdit();
	this.lastAppErrors = errs;
}

function submitEditCell (newValue) {
	switch (this.selected.header.dataType) {
		case TabLib.DATA_TYPE.INT:
			newValue = parseInt(newValue);
			break;
		case TabLib.DATA_TYPE.FLOAT:
			newValue = parseFloat(newValue);
			break;
		case TabLib.DATA_TYPE.STRING:
			newValue = new String(newValue).valueOf();
			break;
		case TabLib.DATA_TYPE.JSON:
			newValue = JSON.parse(newValue);
			break;
		default: this.lastAppError = ERR.HEADER.DATA_TYPE.UNKNOWN ;
	}
	TabLib.updDataCell(
		this.tabenv, this.selected.tablo, this.selected.header,
		this.selected.line, newValue
	);
	this.cancelEdit();
}

function created () {
	
	var errs = [];
	
	errs.concat(TabLib.checkNewTablo(this.tabenv, "users", "Users"));
	var users = TabLib.newTablo(this.tabenv, "users", "Users");

	
	errs.concat(TabLib.checkNewDataHeader(
		this.tabenv, users, "name", "Name", TabLib.DATA_TYPE.STRING));
	var usersName = TabLib.newDataHeader(
		this.tabenv, users, "name", "Name", TabLib.DATA_TYPE.STRING);
	
	var usersCash = TabLib.newDataHeader(
		this.tabenv, users, "cash", "Cash", TabLib.DATA_TYPE.INT);
	
	var usersDebt = TabLib.newDataHeader(
		this.tabenv, users, "debt", "Debt", TabLib.DATA_TYPE.INT);
		
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
	
	TabLib.newLine(this.tabenv, users); 
	TabLib.updDataCell(this.tabenv, users, usersName, 0, "yayatoto");
	TabLib.updDataCell(this.tabenv, users, usersCash, 0, 10);
	TabLib.updDataCell(this.tabenv, users, usersDebt, 0, 5);

	TabLib.newLine(this.tabenv, users);
	TabLib.updDataCell(this.tabenv, users, usersName, 1, "magdalena");
	TabLib.updDataCell(this.tabenv, users, usersCash, 1, 35);
	TabLib.updDataCell(this.tabenv, users, usersDebt, 1, 100);

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
	
	TabLib.newLine(this.tabenv, total);
	TabLib.updLineAllFuncCells (this.tabenv, total, 0);
	
	TabLib.newLine(this.tabenv, total);
	TabLib.updLineAllFuncCells (this.tabenv, total, 1);
	
	if (errs.length > 0 ) this.lastAppError = errs;
	else this.lastAppError = "";
}
</script>