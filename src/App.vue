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
			<tablo-infos
				v-if="selectedTablo.alias != null"
				:alias="selectedTablo.alias"
				:label="selectedTablo.label"
				:display-num-lines="selectedTablo.displayNumLines"
				:nb-headers="selectedTablo.headers.length"
				:nb-lines="selectedTablo.nbLines"
				:edit="edit"
				@add-new-header="addNewHeader"
				@add-new-line="addNewLine"
				@start-edit="startEdit"
				@change-edit="changeEdit"
				@submit-edit="submitEdit"
				@cancel-edit="cancelEdit"
			></tablo-infos>
			<header-infos
				v-if="selectedHeader.alias != null"
				:tablo-alias="selectedTablo.alias"
				:header="selectedHeader"
				:nb-headers="selectedTablo.headers.length"
				:edit="edit"
				@start-edit="startEdit"
				@change-edit="changeEdit"
				@submit-edit="submitEdit"
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
const getByAlias = TabLib.getByAlias;

export default {
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
		addNewHeader: function (alias) {
			var i = 0 ;
			while (getByAlias(this.selectedTablo.headers, "newheader" + i)) {
				i++;
			}
			TabLib.newDataHeader(
				this.tabenv, this.selectedTablo, 
				"newheader" + i, "New Header " + i
			);
			this.selectHeader(this.selectedTablo.alias, "newheader" + i);
		},
		addNewLine: function (alias) {
			TabLib.addNewLine(this.tabenv, this.tabenv.tablos.get(alias));
		},
		selectTablo: function (tabloAlias) {
			if (tabloAlias == this.selectedTablo.alias) {
				this.selectedTablo = { alias: null }; 
				this.selectedHeader = { alias: null };
			}
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
					getByAlias(this.selectedTablo.headers, headerAlias);
			}
			this.cancelEdit();
		},
		startEdit: function (target, property) {
			this.edit.target = target;
			this.edit.property = property;
			this.edit.valid = true;
			this.edit.msg = null;
		},
		validEdit: function (newValue) {
			switch (this.edit.target) {
				case "header":
					validEditHeader.call(this, newValue);
					break;
				case "tablo":
					validEditTablo.call(this, newValue);
					break;
				default: console.log("unmanaged target for validEdit");
			}
		},
		changeEdit: function (newValue) {
			this.validEdit(newValue);
		},
		submitEdit: function (newValue) {
			switch (this.edit.target) {
				case "header":
					submitEditHeader.call(this, newValue);
					break;
				case "tablo":
					submitEditTablo.call(this, newValue);
					break;
				default: console.log("unmanaged target for submitEdit");
			}
			this.cancelEdit();
		},
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
  	components: { TabloComp, TabloInfos, HeaderInfos }
};

function validEditHeader (newvalue) {
	this.edit.valid = true;
	this.edit.msg = null;
	switch (this.edit.property) {
		case "alias":
			if (newvalue == "") {
				this.edit.valid = false;
				this.edit.msg = "L'alias ne doit pas être vide.";
			}
			else if (
				newvalue != this.selectedHeader.alias &&
				getByAlias(this.selectedTablo.headers, newvalue)
			) {
				this.edit.valid = false ;
				this.edit.msg = 
					"L'alias de header doit être unique au sein du tablo.";
			}
			break;
		case "label": 
			if (newvalue == "") {
				this.edit.valid = false;
				this.edit.msg = "Le label ne doit pas être vide.";
			}
			break;
		case "order":
			if (newvalue < 0 || 
				newvalue >= this.selectedTablo.headers.length
			){
				this.edit.valid = false;
				this.edit.msg = "L'ordre doit être dans les bornes.";
			}
			break;
		case "func":
			if (newvalue == "") {
				this.edit.valid = false;
				this.edit.msg = "La fonction ne doit pas être vide.";
			}
			else {
				var code = 
					"\"use strict\"; return ( " +
					newvalue + " ); ";
				try {
					var f = new Function(code) ();
					if (typeof f != "function") {
						this.edit.valid = false;
						this.edit.msg = 
							"La fonction doit être une fonction " +
							"Javascript correcte." ;
					}
				}
				catch (error) {
					this.edit.valid = false;
					this.edit.msg = 
					 	"L'erreur suivante a été détectée lors " +
					 	"de l'évaluation de la fonction : " +
					 	error.toString() ;
				}
			}
			break;
		default: 
			console.log("unknown property : " + this.edit.property);
			this.edit.valid = false;
			this.edit.msg = "unknown property";
	};
}

function validEditTablo (newValue) {
	this.edit.valid = true;
	this.edit.msg = null;
	switch (this.edit.property) {
		case "alias":
			if (newValue == "") {
				this.edit.valid = false;
				this.edit.msg = "L'alias ne doit pas être vide.";
			}
			else if (
				newValue != this.selectedTablo.alias && 
				this.tabenv.tablos.has(newValue)
			) {
				this.edit.valid = false ;
				this.edit.msg = 
					"L'alias de tablo doit être unique " +
					"au sein de l'environnement.";
			}
			break;
		case "label": 
			if (newValue == "") {
				this.edit.valid = false;
				this.edit.msg = "Le label ne doit pas être vide.";
			}
			break;
		case "displayNumLines":
			if (typeof newValue != "boolean") {
				this.edit.valid = false;
				this.edit.msg = 
					"L'affichage des lignes a une valeur incorrecte.";
			}
			break;
		default: 
			console.log("unknown property : " + this.edit.property);
			this.edit.valid = false;
			this.edit.msg = "unknown property";
	};
}

function submitEditHeader (newValue) {
	validEditHeader.call(this, newValue);
	if (this.edit.valid) {
		switch (this.edit.property) {
			case "alias":
				TabLib.updHeaderAlias(
					this.tabenv, this.selectedTablo,
					this.selectedHeader.alias, 
					newValue
				);
				break;
			case "label":
				this.selectedHeader.label = newValue;
				break;
			case "order":
				TabLib.updHeaderOrder(
					this.tabenv, this.selectedTablo,
					this.selectedHeader, newValue
				);
				break;
			case "func":
				var code = "\"use strict\"; return ( " + newValue + " ); ";
				var f = new Function(code) ();
				TabLib.updHeaderFunc(
					this.tabenv, this.selectedTablo, 
					this.selectedHeader, f
				);
				break;
			default: console.log("unknown property");
		}
	}
	else console.log("unvalid newValue for submitEditHeader : " + newValue);
}

function submitEditTablo (newValue) {
	validEditTablo.call(this, newValue);
	if (this.edit.valid) {
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
	}
	else console.log("unvalid newValue for submitEditTablo : " + newValue);
}

function created () {
	
	var users = TabLib.newTablo(this.tabenv, "users", "Users");

	var usersName = TabLib.newDataHeader(this.tabenv, users, "name", "Name");
	var usersCash = TabLib.newDataHeader(this.tabenv, users, "cash", "Cash");
	var usersDebt = TabLib.newDataHeader(this.tabenv, users, "debt", "Debt");
	
	var usersComputed = TabLib.newFuncHeader(
		this.tabenv, users, "computed", "Computed", [ 
			TabLib.newColSamelineArg("users.cash"), 
			TabLib.newColSamelineArg("users.debt") ],
		function (cash, debt) { return cash - debt; }
	);
	
	var usersAftertax = TabLib.newFuncHeader(
		this.tabenv, users, "aftertax", "After Tax",
		[ TabLib.newColSamelineArg("users.computed") ],
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

	setTimeout(function () {
		TabLib.updCell(this.tabenv, users, usersCash, 0, 20);
	}.bind(this), 2000);

	var total = TabLib.newTablo(this.tabenv, "total", "Total");
	
	var totalName = TabLib.newFuncHeader(
		this.tabenv, total, "name", "Name",
		[ TabLib.newColSamelineArg("users.name") ],
		function (name) { return name }
	);
	
	var totalTotal = TabLib.newFuncHeader(
		this.tabenv, total, "total", "Total", [
			TabLib.newColSamelineArg("users.cash"), 
			TabLib.newColSamelineArg("users.debt"),
			TabLib.newColSamelineArg("users.computed"),
			TabLib.newColSamelineArg("users.aftertax") ],
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