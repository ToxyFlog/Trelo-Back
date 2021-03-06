const ajv = new (require("ajv"))();
require("ajv-formats")(ajv, ["uuid"]);

module.exports = ajv.compile({
	$async: true,
	properties: {
		boardId: {
			type: "string",
			format: "uuid",
		},
		order: {
			type: "array",
			items: {
				properties: {
					order: {
						type: "number",
						minimum: 0,
					},
					id: {
						type: "string",
						format: "uuid",
					},
				},
				required: ["order", "id"],
				additionalProperties: false,
				type: "object",
			},
		},
	},
	required: ["boardId", "order"],
	additionalProperties: false,
	type: "object",
});