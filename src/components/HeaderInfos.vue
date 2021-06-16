<template>
	<table>
		<caption>Colonne</caption>
		
		<tr> 
			<th :class="{selected : isEdited && edit.property == 'alias'}" >
				<span>Alias</span>
			</th> 
			<td v-if="isEdited && edit.property == 'alias'" >
				<input 
					v-model="editForm"
					ref="alias"
					@input="changeEdit"
					@blur="submitEdit" 
					@keyup.enter="submitEdit"
					@keyup.esc="cancelEdit" />
			</td>
			<td v-else @click="startEdit('alias')" class="clickable" >
				<span>{{header.alias}}</span>
			</td> 
		</tr>
		
		<tr> 
			<th :class="{selected : isEdited && edit.property == 'label'}" >
				<span>Label</span>
			</th> 
			<td v-if="isEdited && edit.property == 'label'" >
				<input 
					v-model="editForm"
					ref="label"
					@input="changeEdit"
					@blur="submitEdit" 
					@keyup.enter="submitEdit"
					@keyup.esc="cancelEdit" />
			</td>
			<td v-else @click="startEdit('label')" class="clickable" >
				<span>{{header.label}}</span>
			</td> 
		</tr>
		
		<tr> 
			<th :class="{selected : isEdited && edit.property == 'type' }" >
				<span>Type</span>
			</th> 
			<td v-if="isEdited && edit.property == 'type'" >
				<select 
					v-model="editForm" 
					ref="type" 
					@change="changeEdit" >
					<option :value="DATA_HEADER" >Data</option>
					<option :value="FUNC_HEADER" >Fonction</option>
				</select>
				<button @click="submitEdit" >Valider</button>
				<button @click="cancelEdit" >Annuler</button>
			</td>
			<td v-else @click="startEdit('type')" class="clickable" >
				<span>{{headerType}}</span>
			</td>
		</tr>
		
		<tr> 
			<th :class="{selected : isEdited && edit.property == 'order' }" >
				<span>Ordre</span>
			</th> 
			<td v-if="isEdited && edit.property == 'order'" >
				<select 
					v-model="editForm" 
					ref="order" 
					@change="changeEdit" >
					<option 
						v-for="(_,index) in nbHeaders" 
						:value="index" >
						<span>{{index}}</span>
					</option>
				</select>
				<button @click="submitEdit" >Valider</button>
				<button @click="cancelEdit" >Annuler</button>
			</td>
			<td v-else @click="startEdit('order')" class="clickable" >
				<span>{{header.order}}</span>
			</td>
		</tr>
		
		<tr v-if="header.type == FUNC_HEADER" > 
			<th :class="{selected : isEdited && edit.property == 'args' }" >
				<span>Arguments</span>
			</th> 
			<td v-if="isEdited && edit.property == 'args'" >
				<div v-for="(arg,index) in editForm" :key="index" >
					<div v-if="arg.type == COL_SAMELINE_ARG" >
						<select 
							v-model="arg.alias.tablo" 
							@change="changeEdit" >
							<option 
								v-for="tablo in tablosList" 
								:value="tablo.alias" >
								<span>{{tablo.label}}</span>
							</option>
						</select>
						<span>[</span>
						<select 
							v-model="arg.alias.header" 
							@change="changeEdit" >
							<option 
								v-for="header in headersList.get(arg.alias.tablo)" 
								:value="header.alias" >
								<span>{{header.label}}</span>
							</option>
						</select>
						<span>][#] </span>
						<button @click="removeArg(index)" >retirer</button>
					</div>
					<div v-if="arg.type == NULL_ARG" >
						<span>nul </span>
						<button @click="removeArg(index)" >retirer</button>
					</div>
				</div>
				<button @click="addArg" >ajouter un argument</button> <br/>
				<button @click="submitEdit" >valider</button>
				<button @click="cancelEdit" >annuler</button>
			</td>
			<td v-else @click="startEdit('args')" class="clickable" >
				<span>{{argsStr}}</span>
			</td>
		</tr>
		
		<tr v-if="header.type == FUNC_HEADER" > 
			<th :class="{selected : isEdited && edit.property == 'func'}" >
				<span>Fonction</span>
			</th> 
			<td v-if="isEdited && edit.property == 'func'" >
				<textarea
					v-model="editForm"
					ref="func"
					@input="changeEdit"
					@blur="submitEdit"
					@keyup.esc="cancelEdit"
				></textarea>
			</td>
			<td v-else @click="startEdit('func')" class="clickable">
				<pre>{{header.func}}</pre>
			</td> 
		</tr>
	</table>
	<div>
		<p 
			v-if="isEdited && edit.valid === false" 
			class="incorrect" >
			<span>Valeur invalide !</span> <br />
			<span v-if="edit.msg" >{{edit.msg}}</span>
		</p>
	</div>
	<button @click="deleteHeader" >supprimer la colonne</button>
</template>

<script>
import * as TabLib from "../tablos.js";

export default {
	emits: [ 
		"startEdit", "changeEdit", "submitEdit",
		"cancelEdit", "deleteHeader"
	],
	props: [ "tablosList", "headersList", "tabloAlias", "header", "nbHeaders", "edit" ],
	data: function () { return {
		editForm: null
	}},
	watch: {
		edit: function (newEdit) {
			if (newEdit.property) {
				this.$nextTick(function () {
					this.$refs[newEdit.property].focus();
				}.bind(this));
			}
		}
	},
	methods: {
		startEdit: function (property) {
			// for args we need to copy it since it is a deep object
			if (property == "args") {
				this.editForm = this.header.args.map(TabLib.copyArg);
			}
			else {
				this.editForm = this.header[property];
			}
			this.$emit("startEdit", "header", property);
		},
		changeEdit: function () {
			this.$emit("changeEdit", this.editForm);
		},
		submitEdit: function () { 
			this.$emit("submitEdit", this.editForm) ;
		},
		cancelEdit: function () { this.$emit("cancelEdit") },
		deleteHeader: function () { this.$emit("deleteHeader") },
		removeArg: function (index) {
			if (this.edit.property == "args") {
				this.editForm.splice(index, 1);
				this.changeEdit();
			}
			else console.log("remove arg not possible if not editing args");
		},
		addArg: function () {
			var tabloAlias = null;
			var headerAlias = null;
			if (this.tablosList.length)	tabloAlias = this.tablosList[0].alias;
			if (this.headersList.has(tabloAlias) &&
				this.headersList.get(tabloAlias)[0]
			) {
				headerAlias = this.headersList.get(tabloAlias)[0].alias ;
			}
			this.editForm.push(
				TabLib.newColSamelineArg(tabloAlias, headerAlias)
			);
			this.changeEdit();
		}
	},
	computed: {
		isEdited: function () { return this.edit.target == "header"; },
		headerType: function () { 
			switch (this.header.type) {
				case TabLib.DATA_HEADER: return "Data";
				case TabLib.FUNC_HEADER: return "Fonction";
				default: console.log("unknown header type");
			}
		},
		argsStr: function () { 
			if (this.header.type == TabLib.FUNC_HEADER) {
				return this.header.args.map(function (arg) {
					switch (arg.type) {
						case TabLib.NULL_ARG: return "nul";
						case TabLib.COL_SAMELINE_ARG: 
							var str = 
								arg.alias.tablo + 
								"[" + arg.alias.header + "][#]" ;
							return str;
						default:
							console.log("unknown arg alias");
							return null;
					}
				}).join(", ");
			}
			else return null;
		},
		DATA_HEADER: function () { return TabLib.DATA_HEADER },
		FUNC_HEADER: function () { return TabLib.FUNC_HEADER },
		NULL_ARG: function () { return TabLib.NULL_ARG },
		COL_SAMELINE_ARG: function () { return TabLib.COL_SAMELINE_ARG }
	}
}
</script>