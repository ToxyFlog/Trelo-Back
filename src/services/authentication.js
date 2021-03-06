const boardDB = require("../db/board");
const {verifyJwt} = require("./jwt");
const {getSocketId} = require("../redis/socketId");

const verify = async token => {
	if (!token || !token.startsWith("Bearer ")) return ["Error"];
	return await verifyJwt(token.split("Bearer ")[1]);
};

// Authentication (is authenticated):
const authenticated = async (req, res, next) => {
	const [error, user] = await verify(req.headers.authorization);
	if (!user) return res.status(401).send(error);

	const socketId = await getSocketId(user.username);

	res.locals.user = user;
	res.locals.socketId = socketId;

	next();
};


// Authorization (has authority):
const bodyToLocals = async (req, res) => {
	const boardId = req.body.boardId || req.params.boardId;
	if (!boardId) return res.sendStatus(400);

	const board = await boardDB.getBoard(boardId);
	if (!board) return res.sendStatus(404);

	res.locals.board = board;
	return false;
};

const isOwner = async (req, res, next) => {
	if (await bodyToLocals(req, res)) return;

	if (res.locals.board.users.filter(cur => cur.username === res.locals.user.username && cur.isOwner).length !== 1)
		return res.sendStatus(401);

	next();
};

const hasAccess = async (req, res, next) => {
	if (await bodyToLocals(req, res)) return;

	if (res.locals.board.users.filter(cur => cur.username === res.locals.user.username).length !== 1)
		return res.sendStatus(401);

	next();
};

module.exports = {authenticated, hasAccess, isOwner};