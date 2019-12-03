'use strict';

/**
 * @param {FaasEvent} event
 * @param {FaasContext} context
 * @return {Promise|*}
 */

module.exports = {
	handler: function (event, context) {
		var ret = {
			"data": event.data,
			"context": context
		};
		console.log("event");
		console.log(event);
		console.log("context");
		console.log(context);
		return JSON.stringify(ret);
	}
};