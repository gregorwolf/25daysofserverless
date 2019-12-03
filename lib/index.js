'use strict';

/**
 * @param {FaasEvent} event
 * @param {FaasContext} context
 * @return {Promise|*}
 */

module.exports = {
	handler: function (event, context) {
		var values = [ "נ", "ג", "ה", "ש"];
		var index = Math.floor(4 * Math.random());
		return values[index];
	}
};