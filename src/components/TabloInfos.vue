<template>
	<table>
		<caption>{{texts["Tablo"]}}</caption>

		<tr> 
			<th :class="{selected : isEdited && edit.property == 'alias'}" >
				<span>{{texts["Alias"]}}</span>
			</th> 
			<td v-if="isEdited && edit.property == 'alias'" >
				<input 
					v-model="editForm"
					ref="label"
					@input="changeEdit"
					@keyup.enter="submitEdit"
					@keyup.esc="cancelEdit" />
				<button @click="submitEdit" >{{texts["submit"]}}</button>
				<button @click="cancelEdit" >{{texts["cancel"]}}</button>
			</td>
			<td v-else >
				<span>{{alias}}</span>
				<button @click="startEdit('alias')" >
					<span>{{texts["modify"]}}</span>
				</button>
			</td> 
		</tr>
		
		<tr> 
			<th :class="{selected : isEdited && edit.property == 'label'}" >
				<span>{{texts["Label"]}}</span>
			</th> 
			<td v-if="isEdited && edit.property == 'label'" >
				<input 
					v-model="editForm"
					ref="label"
					@input="changeEdit"
					@keyup.enter="submitEdit"
					@keyup.esc="cancelEdit" />
				<button @click="submitEdit" >{{texts["submit"]}}</button>
				<button @click="cancelEdit" >{{texts["cancel"]}}</button>
			</td>
			<td v-else >
				<span>{{label}}</span>
				<button @click="startEdit('label')" >
					<span>{{texts["modify"]}}</span>
				</button>
			</td> 
		</tr>
		
		<tr> 
			<th><span>{{texts["DisplayLineNumbers"]}}</span></th>
			<td v-if="displayNumLines" >
				<span>{{texts["Yes"]}}</span>
				<button @click="toggleDisplayNumLines" >
					<span>{{texts["disable"]}}</span>
				</button>
			</td> 
			<td v-else >
				<span>{{texts["No"]}}</span>
				<button @click="toggleDisplayNumLines" >
					<span>{{texts["enable"]}}</span>
				</button>
			</td> 
		</tr>
		
		<tr> 
			<th>{{texts["HeaderNumber"]}}</th> 
			<td>
				<span>{{nbHeaders}}</span>
				<button @click="addNewHeader" >{{texts["add"]}}</button>
			</td> 
		</tr>
		
		<tr> 
			<th>{{texts["LineNumber"]}}</th> 
			<td>
				<span>{{nbLines}}</span>
				<button @click="addNewLine" >{{texts["add"]}}</button>
			</td>
		</tr>
	</table>		
	<div>
		<p 
			v-if="isEdited && edit.valid === false" 
			class="incorrect" 
		>
			<span>{{texts["incorrectValue"]}}</span> <br />
			<span v-if="edit.msg" >{{edit.msg}}</span>
		</p>
	</div>
	<button @click="delTablo" >{{texts["deleteTablo"]}}</button> <br />
	
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
		"edit",
		"texts"
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
		isEdited() { return this.edit.target == "tablo" ; }
	}
}
</script>