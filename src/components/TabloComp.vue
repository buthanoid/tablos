<template>
	<table class="tablo" :class="{selected : isSelected}" >
		<caption @click="selectTablo" >
			<span>{{label}}</span>
		</caption>
		<thead><tr>
			<th v-if="displayNumLines" >#</th>
			<th v-for="header in headers" 
				:key="header.alias"
				:class="headersClasses[header.order]"
				@click="selectHeader(header.alias)"
			>
				<span>{{header.label}}</span>
			</th>
		</tr></thead>
		<tbody>
			<tr v-for="(_,numLine) in nbLines" >
				<th v-if="displayNumLines" 
					:class="linesClasses[numLine]" 
					@click="selectLine(numLine)" >
					<span>{{numLine}}</span>
				</th>
				<td v-for="(_,numCol) in headers.length" >
					<div 
						v-if="isThisCellEdited(numLine,numCol)" >
						<input
							v-model="editForm"
							ref="cellEditInput"
							@input="changeEdit"
							@keyup.enter="submitEdit"
							@keyup.esc="cancelEdit" />
						<button @click="submitEdit" >
							<span>{{texts["submit"]}}</span>
						</button>
						<button @click="cancelEdit" >
							<span>{{texts["cancel"]}}</span>
						</button>
					</div>	
					<div 
						v-else
						class="clickable" 
						@click="selectCellStartEdit(numLine,numCol)" >
						{{ datatab[numLine][numCol] }}
					</div>
				</td>
			</tr>
		</tbody>
	</table>
	<div>
		<p v-if="isSomeCellEdited && !(edit.valid)" class="incorrect" >
			<span>{{texts["incorrectValue"]}}</span> <br />
			<span>{{edit.msg}}</span>
		</p>
	</div>
</template>

<script>
import * as T from "../tablos.js" ;
import * as U from "../util.js" ;

var headerTypeToClass = ["dataheader", "funcheader" ];

export default {
	emits: [ 
		"selectTablo", "selectHeader", "selectLine", "selectCell",
		"startEdit", "changeEdit", "submitEdit", "cancelEdit"
	],
	props: [ 
		"alias",
		"label",
		"displayNumLines",
		"headers",
		"nbLines",
		"datatab",
		"selected",
		"edit",
		"texts"
	],
	data: function () { return {
		editForm: null
	}},
	methods: {
		selectTablo: function () { this.$emit("selectTablo", this.alias); },
		selectHeader: function (headerAlias) {
			this.$emit("selectHeader", this.alias, headerAlias);
		},
		selectLine: function (numLine) {
			this.$emit("selectLine", this.alias, numLine);
		},
		selectCellStartEdit:  function (numLine, numCol) {
			if (this.headers[numCol].dataType == T.HEADER.DATA_TYPE.JSON) {
				this.editForm = JSON.stringify(this.datatab[numLine][numCol]);
			}
			else this.editForm = this.datatab[numLine][numCol];
			this.$emit("selectCell",
				this.alias, this.headers[numCol].alias, numLine
			);
			if (this.headers[numCol].type == T.HEADER.TYPE.DATA) {
				this.$emit("startEdit", U.TRG.CELL, null);
			}
		},
		changeEdit: function () {
			this.$emit("changeEdit", this.editForm);
		},
		submitEdit: function () { 
			this.$emit("submitEdit", this.editForm) ;
		},
		cancelEdit: function () { this.$emit("cancelEdit") },
	},
	computed: {
		isSelected() {
			return (
				U.TRG_TABLO_EXT.includes(this.selected.target) &&
				this.selected.tablo.alias == this.alias
			);
		},
		isSomeCellEdited() {
			return (
				this.isSelected && // is this tablo selected
				this.selected.target == U.TRG.CELL && 
				this.edit.target == U.TRG.CELL
			);
		},
		isThisCellEdited() {
			return function (numLine, numCol) {
				return (
					this.isSomeCellEdited && 
					this.selected.header.order == numCol &&
					this.selected.line == numLine
				);
			}
		},
		headersClasses() {
			return Array.from(this.headers).map(function (header) {
				var classes = "header";
				classes += " " + headerTypeToClass[header.type];
				if (this.isSelected &&
					U.TRG_HEADER_EXT.includes(this.selected.target) &&
					this.selected.header.alias == header.alias
				) {
					classes += " selected";
				}
				return classes;
			}.bind(this));  
		},
		linesClasses() {
			return Array.from(this.datatab).map(function (line, numLine) {
				var classes = "line clickable";
				if (this.isSelected &&
					U.TRG_LINE_EXT.includes(this.selected.target) &&
					this.selected.line == numLine
				) {
					classes += " selected";
				}
				return classes;
			}.bind(this));  
		}
	}
}
</script>