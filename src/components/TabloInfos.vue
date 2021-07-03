<template>
	<table>
		<caption>{{texts["Tablo"]}}</caption>

		<tr> 
			<th :class="{selected : isPropEdited(PROP.TABLO.ALIAS) }" >
				<span>{{texts["Alias"]}}</span>
			</th> 
			<td v-if="isPropEdited(PROP.TABLO.ALIAS)" >
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
				<button @click="startEditAlias" >
					<span>{{texts["modify"]}}</span>
				</button>
			</td> 
		</tr>
		
		<tr> 
			<th :class="{selected : isPropEdited(PROP.TABLO.LABEL) }" >
				<span>{{texts["Label"]}}</span>
			</th> 
			<td v-if="isPropEdited(PROP.TABLO.LABEL)" >
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
				<button @click="startEditLabel" >
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
			v-if="isTabloEdited && edit.valid === false" 
			class="incorrect" 
		>
			<span>{{texts["incorrectValue"]}}</span> <br />
			<span v-if="edit.msg" >{{edit.msg}}</span>
		</p>
	</div>
	<button @click="delTablo" >{{texts["deleteTablo"]}}</button> <br />
	
</template>

<script>
import * as T from "../tablos.js" ;
import * as U from "../util.js" ;

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
		"selected",
		"edit",
		"texts"
	],
	data: function () { return {
		editForm: null	
	}},
	methods: {
		startEditAlias: function () {
			this.editForm = this.$props.alias;
			this.$emit("startEdit", U.TRG.TABLO, T.PROP.TABLO.ALIAS);
		},
		startEditLabel: function () {
			this.editForm = this.$props.label;
			this.$emit("startEdit", U.TRG.TABLO, T.PROP.TABLO.LABEL);
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
		isTabloEdited() { 
			return (
				this.edit.target == U.TRG.TABLO &&
				this.selected.tablo.alias == this.alias );
		},
		isPropEdited() {
			return function (prop) {
				return this.isTabloEdited && this.edit.property == prop;
			}
		},
		PROP() { return T.PROP }
	}
}
</script>