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
					@keyup.enter="submitEdit"
					@keyup.esc="cancelEdit" />
				<button @click="submitEdit" >valider</button>
				<button @click="cancelEdit" >Annuler</button>
			</td>
			<td v-else >
				<span>{{header.alias}}</span>
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
				<span>{{header.label}}</span>
				<button @click="startEdit('label')" >modifier</button>
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
					<option :value="DATA_HEADER" >Donnée</option>
					<option :value="FUNC_HEADER" >Fonction</option>
				</select>
				<button @click="submitEdit" >Valider</button>
				<button @click="cancelEdit" >Annuler</button>
			</td>
			<td v-else >
				<span>{{headerType}}</span>
				<button @click="startEdit('type')" >modifier</button>
			</td>
		</tr>
		
		<tr> 
			<th :class="{selected : isEdited && edit.property == 'order' }" >
				<span>Ordre</span>
			</th> 
			<td>
				<span>{{header.order}}</span>
				<button 
					:disabled="header.order - 1 < 0"
					@click="lowerOrder" >
					<span>&lt;--</span>
				</button>
				<button 
					:disabled="header.order + 1 >= nbHeaders"
					@click="upperOrder" >
					<span>--&gt;</span>
				</button>
			</td>
		</tr>
		
		<tr v-if="header.type == DATA_HEADER" >
			<th>Type de donnée</th>
			<td v-if="isEdited && edit.property == 'dataType'" >
				<select 
					v-model="editForm"
					@change="changeEdit" >
					<option 
						v-for="dataType in Object.values(DATA_TYPE)" 
						:value="dataType" >
						<span>{{ DATA_TYPE_STR[dataType] }}</span>
					</option>
				</select>
				<button @click="submitEdit" >valider</button>
				<button @click="cancelEdit" >annuler</button>
			</td>
			<td v-else >
				<span>{{ DATA_TYPE_STR[header.dataType] }}</span>			
				<button @click="startEdit('dataType')" >modifier</button>
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
			<td v-else >
				<span>{{argsStr}}</span>
				<button @click="startEdit('args')" >modifier</button>
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
					@keyup.ctrl.enter="submitEdit" 
					@keyup.esc="cancelEdit" >
				</textarea>
				<button @click="submitEdit" >valider</button>
				<button @click="cancelEdit" >Annuler</button>
			</td>
			<td v-else >
				<pre>{{header.func}}</pre>
				<button @click="startEdit('func')" >modifier</button>
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
import * as T from "../tablos.js";

export default {
	emits: [ 
		"startEdit", "changeEdit", "submitEdit", "cancelEdit", 
		"deleteHeader", "lowerOrder", "upperOrder"
	],
	props: [ 
		"tablosList", "headersList", "tabloAlias", "header", 
		"nbHeaders", "edit" 
	],
	data: function () { return {
		editForm: null
	}},
	methods: {
		startEdit: function (property) {
			// for args we need to copy it since it is a deep object
			if (property == "args") {
				this.editForm = this.header.args.map(T.copyArg);
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
		lowerOrder: function () { this.$emit("lowerOrder") },
		upperOrder: function () { this.$emit("upperOrder") },
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
				T.newColSamelineArg(tabloAlias, headerAlias)
			);
			this.changeEdit();
		}
	},
	computed: {
		isEdited() { return this.edit.target == "header"; },
		headerType() { 
			switch (this.header.type) {
				case T.DATA_HEADER: return "Donnée";
				case T.FUNC_HEADER: return "Fonction";
				default: console.log(this.header);throw(T.ERR.HEADER.TYPE.UNKNOWN) ;
			}
		},
		argsStr() { 
			if (this.header.type == T.FUNC_HEADER) {
				return this.header.args.map(function (arg) {
					switch (arg.type) {
						case T.NULL_ARG: return "nul";
						case T.COL_SAMELINE_ARG: 
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
		DATA_HEADER() { return T.DATA_HEADER },
		FUNC_HEADER() { return T.FUNC_HEADER },
		DATA_TYPE() { return T.DATA_TYPE },
		DATA_TYPE_STR() { return T.DATA_TYPE_STR },
		NULL_ARG() { return T.NULL_ARG },
		COL_SAMELINE_ARG() { return T.COL_SAMELINE_ARG }
	}
}
</script>