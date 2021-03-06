const {authenticated, hasAccess} = require("../services/authentication");
const cardDB = require("../db/card");
const validateBody = require("./schemas/validateBody");
const validate = require("./schemas/card");
const express = require("express");
const {publish} = require("../redis/pubSub");

const router = express.Router();

router.use(authenticated);


router.get("/:boardId", hasAccess, async (req, res) => {
	const {boardId} = req.params;

	const cards = await cardDB.getCards(boardId);
	if (cards === null) return res.sendStatus(400);

	res.send({id: boardId, cards});
});

router.post("/", hasAccess, validateBody(validate.addCard), async (req, res) => {
	const {boardId, card} = req.body;

	if (!(await cardDB.addCard(boardId, card))) return res.sendStatus(400);

	res.sendStatus(200);
	await publish(boardId, res.locals.socketId, "card:add", {boardId, card});
});

router.post("/addFiles", hasAccess, validateBody(validate.addFile), async (req, res) => {
	const {boardId, cardId, files} = req.body;

	for (let i = 0; i < files.length; i++) await cardDB.addFile(cardId, files[i].url, files[i].filename);

	res.sendStatus(200);
	await publish(boardId, res.locals.socketId, "card:addFile", {boardId, cardId, files});
});

router.put("/", hasAccess, validateBody(validate.changeCard), async (req, res) => {
	const {boardId, card} = req.body;

	if (!(await cardDB.changeCard(card))) return res.sendStatus(400);

	res.sendStatus(200);
	await publish(boardId, res.locals.socketId, "card:change", {boardId, card});
});

router.put("/reorder", hasAccess, validateBody(validate.reorderCards), async (req, res) => {
	const {boardId, order} = req.body;

	if (!(await cardDB.reorderCards(order))) return res.sendStatus(400);

	res.sendStatus(200);
	await publish(boardId, res.locals.socketId, "card:reorder", {boardId, order});
});

router.put("/renameFile", hasAccess, validateBody(validate.renameFile), async (req, res) => {
	const {boardId, file} = req.body;

	if (!(await cardDB.renameFile(file.url, file.filename))) return res.sendStatus(400);

	res.sendStatus(200);
	await publish(boardId, res.locals.socketId, "card:changeFile", {boardId, file});
});

router.delete("/:boardId/:id", hasAccess, async (req, res) => {
	const {boardId, id} = req.params;
	if (!id) return res.sendStatus(400);

	if (!(await cardDB.deleteCard(id))) return res.sendStatus(400);

	res.sendStatus(200);
	await publish(boardId, res.locals.socketId, "card:delete", {boardId, id});
});

router.post("/deleteFile", hasAccess, async (req, res) => {
	const {boardId, url} = req.body;
	if (!url) return res.sendStatus(400);

	if (!(await cardDB.deleteFile(url))) return res.sendStatus(400);

	res.sendStatus(200);
	await publish(boardId, res.locals.socketId, "card:deleteFile", {boardId, url});
});

module.exports = router;