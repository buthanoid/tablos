<template>
	<table>
		<caption>Ligne</caption>
		<tr>
			<th>Numéro</th>
			<td>{{num}}</td>
		</tr>
	</table>
</template>

<script>
export default {
	props: [ "num" ]
}
</script>