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
				<th v-if="displayNumLines" >
					<span>{{numLine}}</span>
				</th>
				<td v-for="(_,numCol) in headers.length" >
					<div>{{datatab[numLine][numCol] }}</div>
				</td>
			</tr>
		</tbody>
	</table>
</template>

<script>
import * as TabLib from "../tablos.js" ;

var headerTypeToClass = ["dataheader", "funcheader" ];

export default {
	emits: [ "selectTablo", "selectHeader" ],
	props: [ 
		"alias",
		"label",
		"displayNumLines",
		"headers",
		"nbLines",
		"datatab",
		"isSelected",
		"selectedHeaderAlias"
	],
	methods: {
		selectTablo: function () { this.$emit("selectTablo", this.alias); },
		selectHeader: function (headerAlias) {
			this.$emit("selectHeader", this.alias, headerAlias);
		}
	},
	computed: {
		headersClasses: function () {
			return Array.from(this.headers).map(function (header) {
				var classes = "header";
				classes += " " + headerTypeToClass[header.type];
				if (this.isSelected && 
					this.selectedHeaderAlias == header.alias
				) {
					classes += " selected";
				}
				return classes;
			}.bind(this));  
		}
	}
}
</script>