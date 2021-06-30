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
					class="clickable" 
					@click="selectLine(numLine)" >
					<span>{{numLine}}</span>
				</th>
				<td v-for="(_,numCol) in headers.length" >
					<div @click="startEdit(numLine,numCol)" class="clickable" >
						{{ datatab[numLine][numCol] }}
					</div>
				</td>
			</tr>
		</tbody>
	</table>
</template>

<script>
import * as TabLib from "../tablos.js" ;
import * as U from "../util.js" ;

var headerTypeToClass = ["dataheader", "funcheader" ];

export default {
	emits: [ "selectTablo", "selectHeader", "selectLine", "startEdit" ],
	props: [ 
		"alias",
		"label",
		"displayNumLines",
		"headers",
		"nbLines",
		"datatab",
		"selected",
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
		startEdit:  function (numLine, numCol) {
			this.editForm = this.datatab[numLine][numCol];
			this.$emit(
				"startEdit", "cell", 
				this.alias, this.headers[numCol].alias, numLine
			);
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
		isSelected: function () {
			return (
				U.TRG_TABLO_EXT.includes(this.selected.target) &&
				this.selected.tablo.alias == this.alias
			);
		},
		headersClasses: function () {
			return Array.from(this.headers).map(function (header) {
				var classes = "header";
				classes += " " + headerTypeToClass[header.type];
				if (this.isSelected &&
					this.selected.target == U.TRG.HEADER &&
					this.selected.header.alias == header.alias
				) {
					classes += " selected";
				}
				return classes;
			}.bind(this));  
		}
	}
}
</script>