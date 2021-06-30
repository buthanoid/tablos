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
					@keyup.enter="submitEdit"
					@keyup.esc="cancelEdit" />
				<button @click="submitEdit" >valider</button>
				<button @click="cancelEdit" >Annuler</button>
			</td>
			<td v-else >
				<span>{{alias}}</span>
				<button @click="startEdit('alias')" >modifier</button>
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
					@keyup.enter="submitEdit"
					@keyup.esc="cancelEdit" />
				<button @click="submitEdit" >valider</button>
				<button @click="cancelEdit" >Annuler</button>
			</td>
			<td v-else >
				<span>{{label}}</span>
				<button @click="startEdit('label')" >modifier</button>
			</td> 
		</tr>
		
		<tr> 
			<th><span>Afficher les numéros de ligne</span></th>
			<td v-if="displayNumLines" >
				<span>Oui</span>
				<button @click="toggleDisplayNumLines" >Désactiver</button>
			</td> 
			<td v-else >
				<span>Non</span>
				<button @click="toggleDisplayNumLines" >Activer</button>
			</td> 
		</tr>
		
		<tr> 
			<th>Nombre de colonnes</th> 
			<td>
				<span>{{nbHeaders}}</span>
				<button @click="addNewHeader" >ajouter</button>
			</td> 
		</tr>
		
		<tr> 
			<th>Nombre de lignes</th> 
			<td>
				<span>{{nbLines}}</span>
				<button @click="addNewLine" >ajouter</button>
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
	<button @click="delTablo" >supprimer le tablo</button> <br />
	
</template>

<script>
export default {
	emits: [ 
		"delTablo", "addNewHeader", "addNewLine", "toggleDisplayNumLines",
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
	methods: {
		startEdit: function (property) {
			this.editForm = this.$props[property];
			this.$emit("startEdit", "tablo", property);
		},
		changeEdit: function () { this.$emit("changeEdit", this.editForm) },
		submitEdit: function () { this.$emit("submitEdit", this.editForm) },
		cancelEdit: function () { this.$emit("cancelEdit") },
		delTablo: function () { this.$emit("delTablo") },
		addNewHeader: function () { this.$emit("addNewHeader") },
		addNewLine: function () { this.$emit("addNewLine") },
		toggleDisplayNumLines: function () {
			this.$emit("toggleDisplayNumLines");
		}
	},
	computed: {
		isEdited: function () { return this.edit.target == "tablo" ; }
	}
}
</script>