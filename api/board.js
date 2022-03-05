const {authenticated, hasAccess, isOwner} = require("../services/authentication");
const validateBody = require("./schemas/validateBody");
const validate = require("./schemas/board");
const boardDB = require("../db/board");
const express = require("express");

const router = express.Router();

router.use(authenticated);


router.get("/:boardId", hasAccess, (req, res) => res.send(res.locals.board));

router.post("/", validateBody(validate.createBoard), async (req, res) => {
	const {title, boardId} = req.body;

	if (!(await boardDB.addBoard(title, boardId, res.locals.user.username))) return res.sendStatus(400);
	res.sendStatus(200);
});

router.post("/user", validateBody(validate.addUser), isOwner, async (req, res) => {
	const {username} = req.body;

	res.send(await boardDB.addUser(res.locals.board, username));
});

router.post("/list", validateBody(validate.addList), isOwner, async (req, res) => {
	const {boardId, id, title, order} = req.body;

	if (!(await boardDB.addList(boardId, id, title, order))) return res.sendStatus(400);
	res.sendStatus(200);
});

router.put("/list", validateBody(validate.changeList), isOwner, async (req, res) => {
	const {id, title, order} = req.body;

	if (!(await boardDB.changeList(id, title, order))) return res.sendStatus(400);
	res.sendStatus(200);
});

router.put("/user", validateBody(validate.changeRole), isOwner, async (req, res) => {
	const {username, isOwner, boardId} = req.body;

	if (!(await boardDB.changeRole(boardId, username, isOwner))) return res.sendStatus(400);
	res.sendStatus(200);
});

router.put("/", validateBody(validate.changeTitle), isOwner, async (req, res) => {
	const {title, boardId} = req.body;

	if (!(await boardDB.changeTitle(boardId, title))) return res.sendStatus(400);
	res.sendStatus(200);
});

router.delete("/:boardId", isOwner, async (req, res) => {
	const {boardId} = req.params;

	if (!(await boardDB.deleteBoard(boardId))) return res.sendStatus(400);
	res.sendStatus(200);
});

router.delete("/list/:boardId/:id", isOwner, async (req, res) => {
	const {id} = req.params;

	if (!(await boardDB.deleteList(id))) return res.sendStatus(400);
	res.sendStatus(200);
});

router.delete("/user/:boardId/:username", isOwner, async (req, res) => {
	const {username, boardId} = req.params;

	if (!(await boardDB.deleteUser(boardId, username))) return res.sendStatus(400);
	res.sendStatus(200);
});


module.exports = router;