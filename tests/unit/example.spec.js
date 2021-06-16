/*import { expect } from 'chai'
import { shallowMount } from '@vue/test-utils'
import HelloWorld from '@/components/HelloWorld.vue'

describe('HelloWorld.vue', () => {
  it('renders props.msg when passed', () => {
    const msg = 'new message'
    const wrapper = shallowMount(HelloWorld, {
      props: { msg }
    })
    expect(wrapper.text()).to.include(msg)
  })
})
*/

import { assert } from "chai" ;
import * as T from "@/tablos.js";

describe("newTablo basique", function () {

	var ta1 = "tablo1";
	var tl1 = "Tablo 1";
	var tabenv = T.newTabenv ();
	var res; 
	var tablo;
	
	it("newTablo", function () {
		res = T.newTablo(tabenv, ta1, tl1);
		tablo = res.value;
	});
	it("success", function () {  assert.isTrue(res.success) });
	it("registered in tabenv", function () {
		assert.equal(tabenv.tablos.get(ta1), tablo)
	});
	it("alias", function () { assert.equal(tablo.alias, ta1) });
	it("label", function () { assert.equal(tablo.label, tl1) });
	
	describe("newDataHeader basique", function () {
	
		var ha1 = "header1";
		var hl1 = "Header 1";
		var fha1 = T.aliasesToStr(ta1, ha1); 
		var res;
		var header;
		
		it("newDataHeader", function () {
			res = T.newDataHeader(tabenv, tablo, ha1, hl1);
			header = res.value;
		});
		it("success", function () { assert.isTrue(res.success) });
		it("registered in tablo", function () {
			assert.equal(tablo.getHeaderByAlias(ha1), header);
		});
		it("alias", function () { assert.equal(header.alias, ha1) });
		it("label", function () { assert.equal(header.label, hl1) });
		it("follows", function () {
			assert.isTrue(tabenv.follows.has(fha1));
			assert.equal(tabenv.follows.get(fha1).length, 0);
		});
	});
	
});