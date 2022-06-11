const {createClient} = require("redis");

if (process.env.NODE_ENV !== "test") {
	const client = createClient({
		url: process.env.REDISCLOUD_URL.match("(redis:\/\/)\S+:(.*@.*:[0-9]{1,6})").slice(1).join(""),
	});
	console.log("Redis is connected!");

	client.on("error", e => {
		throw new Error(e);
	});

	module.exports = client;
}
