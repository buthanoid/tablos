<template>
	<table>
		<caption>{{ texts["Header"] }}</caption>
		
		<tr> 
			<th :class="{selected : isEdited && edit.property == 'alias'}" >
				<span>{{ texts["Alias"] }}</span>
			</th> 
			<td v-if="isEdited && edit.property == 'alias'" >
				<input 
					v-model="editForm"
					ref="alias"
					@input="changeEdit"
					@keyup.enter="submitEdit"
					@keyup.esc="cancelEdit" />
				<button @click="submitEdit" >{{texts["submit"]}}</button>
				<button @click="cancelEdit" >{{texts["cancel"]}}</button>
			</td>
			<td v-else >
				<span>{{header.alias}}</span>
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
				<span>{{header.label}}</span>
				<button @click="startEdit('label')" >
					<span>{{texts["modify"]}}</span>
				</button>
			</td> 
		</tr>
		
		<tr> 
			<th :class="{selected : isEdited && edit.property == 'type' }" >
				<span>{{texts["Type"]}}</span>
			</th> 
			<td v-if="isEdited && edit.property == 'type'" >
				<select 
					v-model="editForm" 
					ref="type" 
					@change="changeEdit" >
					<option
						v-for="headerType in Object.values(TYPE.HEADER)"
						:value="headerType" >
						<span>{{ texts[headerType] }}</span>
					</option>
				</select>
				<button @click="submitEdit" >{{texts["submit"]}}</button>
				<button @click="cancelEdit" >{{texts["cancel"]}}</button>
			</td>
			<td v-else >
				<span>{{ texts[header.type] }}</span>
				<button @click="startEdit('type')" >
					<span>{{texts["modify"]}}</span>
				</button>
			</td>
		</tr>
		
		<tr> 
			<th :class="{selected : isEdited && edit.property == 'order' }" >
				<span>{{texts["Order"]}}</span>
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
		
		<tr v-if="header.type == TYPE.HEADER.DATA" >
			<th>{{texts["DataType"]}}</th>
			<td v-if="isEdited && edit.property == 'dataType'" >
				<select 
					v-model="editForm"
					@change="changeEdit" >
					<option 
						v-for="dataType in Object.values(TYPE.DATA)" 
						:value="dataType" >
						<span>{{ texts[dataType] }}</span>
					</option>
				</select>
				<button @click="submitEdit" >{{texts["submit"]}}</button>
				<button @click="cancelEdit" >{{texts["cancel"]}}</button>
			</td>
			<td v-else >
				<span>{{ texts[header.dataType] }}</span>			
				<button @click="startEdit('dataType')" >
					<span>{{texts["modify"]}}</span>
				</button>
			</td>
		</tr>
		
		<tr v-if="header.type == TYPE.HEADER.FUNC" > 
			<th :class="{selected : isEdited && edit.property == 'args' }" >
				<span>{{texts["Arguments"]}}</span>
			</th> 
			<td v-if="isEdited && edit.property == 'args'" >
				<div v-for="(arg,index) in editForm" :key="index" >
					<div v-if="arg.type == TYPE.HEADER_ARG.COL_SAME_LINE" >
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
						<button @click="removeArg(index)" >
							<span>{{texts["remove"]}}</span>
						</button>
					</div>
					<div v-if="arg.type == TYPE.HEADER_ARG.NULL" >
						<span>nul </span>
						<button @click="removeArg(index)" >
							<span>{{texts["remove"]}}</span>
						</button>
					</div>
				</div>
				<button @click="addArg" >{{texts["addArg"]}}</button> <br/>
				<button @click="submitEdit" >{{texts["submit"]}}</button>
				<button @click="cancelEdit" >{{texts["cancel"]}}</button>
			</td>
			<td v-else >
				<span>{{argsStr}}</span>
				<button @click="startEdit('args')" >{{texts["modify"]}}</button>
			</td>
		</tr>
		
		<tr v-if="header.type == TYPE.HEADER.FUNC" > 
			<th :class="{selected : isEdited && edit.property == 'func'}" >
				<span>{{texts["Function"]}}</span>
			</th> 
			<td v-if="isEdited && edit.property == 'func'" >
				<textarea
					v-model="editForm"
					ref="func"
					@input="changeEdit"
					@keyup.ctrl.enter="submitEdit" 
					@keyup.esc="cancelEdit" >
				</textarea>
				<button @click="submitEdit" >{{texts["submit"]}}</button>
				<button @click="cancelEdit" >{{texts["cancel"]}}</button>
			</td>
			<td v-else >
				<pre>{{header.func}}</pre>
				<button @click="startEdit('func')" >{{texts["modify"]}}</button>
			</td> 
		</tr>
	</table>
	<div>
		<p 
			v-if="isEdited && edit.valid === false" 
			class="incorrect" >
			<span>{{texts["incorrectValue"]}}</span> <br />
			<span v-if="edit.msg" >{{edit.msg}}</span>
		</p>
	</div>
	<button @click="deleteHeader" >{{texts["deleteHeader"]}}</button>
</template>

<script>
"use strict";

import * as T from "../tablos.js" ;

export default {
	emits: [ 
		"startEdit", "changeEdit", "submitEdit", "cancelEdit", 
		"deleteHeader", "lowerOrder", "upperOrder"
	],
	props: [ 
		"tablosList", "headersList", "tabloAlias", "header", 
		"nbHeaders", "edit", "texts",
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
		argsStr() { 
			if (this.header.type == T.TYPE.HEADER.FUNC) {
				return this.header.args.map(function (arg) {
					switch (arg.type) {
						case T.TYPE.HEADER_ARG.NULL: 
							return this.texts[T.TYPE.HEADER_ARG.NULL];
						case T.TYPE.HEADER_ARG.COL_SAME_LINE: 
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
		TYPE() { return T.TYPE }
	}
}
</script>