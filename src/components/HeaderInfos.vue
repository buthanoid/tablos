<template>
	<table>
		<caption>{{ texts["Header"] }}</caption>
		
		<tr> 
			<th :class="{selected : isPropEdited(PROP.HEADER.ALIAS) }" >
				<span>{{ texts["Alias"] }}</span>
			</th> 
			<td v-if="isPropEdited(PROP.HEADER.ALIAS)" >
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
				<button @click="startEditAlias" >
					<span>{{texts["modify"]}}</span>
				</button>
			</td> 
		</tr>
		
		<tr> 
			<th :class="{selected : isPropEdited(PROP.HEADER.LABEL) }" >
				<span>{{texts["Label"]}}</span>
			</th> 
			<td v-if="isPropEdited(PROP.HEADER.LABEL)" >
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
				<button @click="startEditLabel" >
					<span>{{texts["modify"]}}</span>
				</button>
			</td> 
		</tr>
		
		<tr> 
			<th :class="{selected : isPropEdited(PROP.HEADER.TYPE) }" >
				<span>{{texts["Type"]}}</span>
			</th> 
			<td v-if="isPropEdited(PROP.HEADER.TYPE)" >
				<select 
					v-model="editForm" 
					ref="type" 
					@change="changeEdit" >
					<option
						v-for="headerType in Object.values(HEADER.TYPE)"
						:value="headerType" >
						<span>{{ texts[headerType] }}</span>
					</option>
				</select>
				<button @click="submitEdit" >{{texts["submit"]}}</button>
				<button @click="cancelEdit" >{{texts["cancel"]}}</button>
			</td>
			<td v-else >
				<span>{{ texts[header.type] }}</span>
				<button @click="startEditType" >
					<span>{{texts["modify"]}}</span>
				</button>
			</td>
		</tr>
		
		<tr> 
			<th :class="{selected : isPropEdited(PROP.HEADER.ORDER) }" >
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
		
		<tr v-if="header.type == HEADER.TYPE.DATA" >
			<th :class="{selected : isPropEdited(PROP.HEADER.ARGS) }" >
				<span>{{texts["DataType"]}}</span>
			</th>
			<td v-if="isPropEdited(PROP.HEADER.DATA_TYPE)" >
				<select 
					v-model="editForm"
					@change="changeEdit" >
					<option 
						v-for="dataType in Object.values(HEADER.DATA_TYPE)" 
						:value="dataType" >
						<span>{{ texts[dataType] }}</span>
					</option>
				</select>
				<button @click="submitEdit" >{{texts["submit"]}}</button>
				<button @click="cancelEdit" >{{texts["cancel"]}}</button>
			</td>
			<td v-else >
				<span>{{ texts[header.dataType] }}</span>			
				<button @click="startEditDataType" >
					<span>{{texts["modify"]}}</span>
				</button>
			</td>
		</tr>
		
		<tr v-if="header.type == HEADER.TYPE.FUNC" > 
			<th :class="{selected : isPropEdited(PROP.HEADER.ARGS) }" >
				<span>{{texts["Arguments"]}}</span>
			</th> 
			<td v-if="isPropEdited(PROP.HEADER.ARGS)" >
				<div v-for="(arg,index) in editForm" :key="index" >
					<div v-if="arg.type == HEADER.ARG.TYPE.COL_SAME_LINE" >
						<select 
							v-model="arg.alias.tablo" 
							@change="changeEdit" >
							<option 
								v-for="tablo in tablosList" 
								:value="tablo.alias" >
								<span>{{tablo.label}}</span>
							</option>
						</select>
						<span>[#][</span>
						<select 
							v-model="arg.alias.header" 
							@change="changeEdit" >
							<option 
								v-for="header in headersList.get(arg.alias.tablo)" 
								:value="header.alias" >
								<span>{{header.label}}</span>
							</option>
						</select>
						<span>] </span>
						<button @click="removeArg(index)" >
							<span>{{texts["remove"]}}</span>
						</button>
					</div>
					<div v-if="arg.type == HEADER.ARG.TYPE.NULL" >
						<span>{{texts["HEADER.ARG.TYPE.NULL"]}} </span>
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
				<button @click="startEditArgs" >
					<span>{{texts["modify"]}}</span>
				</button>
			</td>
		</tr>
		
		<tr v-if="header.type == HEADER.TYPE.FUNC" > 
			<th :class="{selected : isPropEdited(PROP.HEADER.FUNC)}" >
				<span>{{texts["Function"]}}</span>
			</th> 
			<td v-if="isPropEdited(PROP.HEADER.FUNC)" >
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
				<button @click="startEditFunc" >
					<span>{{texts["modify"]}}</span>
				</button>
			</td> 
		</tr>
	</table>
	<div>
		<p 
			v-if="isHeaderEdited && edit.valid === false" 
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
import * as U from "../util.js" ;

export default {
	emits: [ 
		"startEdit", "changeEdit", "submitEdit", "cancelEdit", 
		"deleteHeader", "lowerOrder", "upperOrder"
	],
	props: [ 
		"tablosList", "headersList", "tabloAlias", "header", 
		"nbHeaders", "selected", "edit", "texts",
	],
	data: function () { return {
		editForm: null
	}},
	methods: {
		startEditAlias: function () {
			this.editForm = this.header.alias;
			this.$emit("startEdit", U.TRG.HEADER, T.PROP.HEADER.ALIAS);
		},
		startEditLabel: function () {
			this.editForm = this.header.label;
			this.$emit("startEdit", U.TRG.HEADER, T.PROP.HEADER.LABEL);
		},
		startEditType: function () {
			this.editForm = this.header.type;
			this.$emit("startEdit", U.TRG.HEADER, T.PROP.HEADER.TYPE);
		},
		startEditDataType: function () {
			this.editForm = this.header.dataType;
			this.$emit("startEdit", U.TRG.HEADER, T.PROP.HEADER.DATA_TYPE);
		},
		startEditArgs: function () {
			this.editForm = this.header.args.map(T.copyArg);
			this.$emit("startEdit", U.TRG.HEADER, T.PROP.HEADER.ARGS);
		},
		startEditFunc: function () {
			this.editForm = this.header.func;
			this.$emit("startEdit", U.TRG.HEADER, T.PROP.HEADER.FUNC);
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
			if (this.edit.property == T.PROP.HEADER.ARGS) {
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
		isHeaderEdited() { 
			return (
				this.edit.target == U.TRG.HEADER &&
				this.selected.tablo.alias == this.tabloAlias &&
				this.selected.header.alias == this.header.alias );
		},
		isPropEdited() {
			return function (prop) {
				return this.isHeaderEdited && this.edit.property == prop;
			}
		},
		argsStr() { 
			if (this.header.type == T.HEADER.TYPE.FUNC) {
				return this.header.args.map(function (arg) {
					switch (arg.type) {
						case T.HEADER.ARG.TYPE.NULL: 
							return this.texts[T.HEADER.ARG.TYPE.NULL];
						case T.HEADER.ARG.TYPE.COL_SAME_LINE: 
							var str = 
								arg.alias.tablo + 
								"[#][" + arg.alias.header + "]" ;
							return str;
						default:
							console.log("unknown arg alias");
							return null;
					}
				}.bind(this)).join(", ");
			}
			else return null;
		},
		HEADER() { return T.HEADER },
		PROP() { return T.PROP }
	}
}
</script>