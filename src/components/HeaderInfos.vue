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
		
		<tr> <th>Type</th> <td>{{headerType[header.type]}}</td> </tr>
		
		<tr> 
			<th :class="{selected : isEdited && edit.property == 'order' }" >
				<span>Ordre</span>
			</th> 
			<td v-if="isEdited && edit.property == 'order'" >
				<select 
					v-model="editForm" 
					ref="order" 
					@change="changeEdit"
				>
					<option 
						v-for="(_,index) in nbHeaders" 
						:value="index" 
					>
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
		
		<tr v-if="headerArgs" > <th>Arguments</th> <td>{{headerArgs}}</td> </tr>
		
		<tr v-if="hasFunc" > 
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
			class="incorrect" 
		>
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
	props: [ "tabloAlias", "header", "nbHeaders", "edit" ],
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
			this.editForm = this.header[property];
			this.$emit("startEdit", "header", property);
		},
		changeEdit: function () {
			this.$emit("changeEdit", this.editForm);
		},
		submitEdit: function () { 
			this.$emit("submitEdit", this.editForm) ;
		},
		cancelEdit: function () { this.$emit("cancelEdit") },
		deleteHeader: function () { this.$emit("deleteHeader") }
	},
	computed: {
		isEdited: function () { return this.edit.target == "header"; },
		headerType: function () { return [ "data", "fonction" ] },
		headerArgs: function () {
			if (this.header.type == TabLib.FUNCHEADER) {
				return this.header.args.map(function (arg) {
					switch (arg.type) {
						case TabLib.NULLARG:
							return "NULL";
						case TabLib.COLSAMELINEARG:
							var aliases = arg.alias.split(".");
							return aliases[0] + "[" + aliases[1] + "][#]";
						default:
							console.log("unknown arg alias");
							return null;
					}
				}).join(", ");
			}
			else return null;
		},
		hasFunc: function () { return this.header.type == TabLib.FUNCHEADER }
	}
}
</script>