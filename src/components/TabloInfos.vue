<template>
	<table>
		<caption>Tablo</caption>

		<tr> 
			<th :class="{selected : isEdited && edit.property == 'alias'}" >
				<span>Alias</span>
			</th> 
			<td v-if="isEdited && edit.property == 'alias'" >
				<input 
					v-model="editForm"
					ref="label"
					@input="changeEdit"
					@blur="submitEdit" 
					@keyup.enter="submitEdit"
					@keyup.esc="cancelEdit" />
			</td>
			<td v-else @click="startEdit('alias')" class="clickable" >
				<span>{{alias}}</span>
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
				<span>{{label}}</span>
			</td> 
		</tr>
		
		<tr> 
			<th :class="{selected : isEditedDisplayNumLines}" >
				<span>Afficher les numéros de ligne</span>
			</th> 
			<td v-if="isEditedDisplayNumLines" >
				<select 
					v-model="editForm" 
					ref="displayNumLines" 
					@change="changeEdit"
				>
					<option :value="true" >Oui</option>
					<option :value="false" >Non</option>
				</select>
				<button @click="submitEdit" >Valider</button>
				<button @click="cancelEdit" >Annuler</button>
			</td>
			<td v-else @click="startEdit('displayNumLines')" class="clickable" >
				<span v-if="displayNumLines" >Oui</span>
				<span v-else >Non</span>
			</td> 
		</tr>
		
		<tr> <th>Nombre de colonnes</th> <td>{{nbHeaders}}</td> </tr>
		<tr> <th>Nombre de lignes</th> <td>{{nbLines}}</td> </tr>
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
	<button @click="$emit('addNewHeader', alias)" >
		<span>ajouter une colonne</span>
	</button> <br />
	<button @click="$emit('addNewLine', alias)" >
		<span>ajouter une ligne</span>
	</button>
</template>

<script>
export default {
	emits: [ 
		"addNewHeader", "addNewLine", 
		"startEdit", "changeEdit", "submitEdit", "cancelEdit"
	],
	props: [
		"alias",
		"label",
		"displayNumLines",
		"nbHeaders",
		"nbLines",
		"edit"
	],
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
			this.editForm = this.$props[property];
			this.$emit("startEdit", "tablo", property);
		},
		changeEdit: function () {
			this.$emit("changeEdit", this.editForm);
		},
		submitEdit: function () { 
			this.$emit("submitEdit", this.editForm) ;
		},
		cancelEdit: function () { this.$emit("cancelEdit") }
	},
	computed: {
		isEdited: function () { return this.edit.target == "tablo" ; },
		isEditedDisplayNumLines: function () {
			return this.isEdited && this.edit.property == "displayNumLines" ;
		}
	}
}
</script>