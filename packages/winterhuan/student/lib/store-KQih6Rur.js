import { link, lstat, mkdir, open, realpath, unlink } from "node:fs/promises";
import { z } from "zod";
import { createHash, randomUUID } from "node:crypto";
import { constants as constants$1 } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import sharp from "sharp";
import { fromMarkdown } from "mdast-util-from-markdown";
//#region lib/types/textbooks/schema.js
/** Validated textbook files and commands shared by the desktop and phone. */
const textbookId = z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/u);
const revision = z.number().int().min(0);
const label = z.string().trim().min(1).max(200);
const modelSchema = z.object({
	provider: label,
	model: label
}).strict();
const assetSchema = z.object({
	path: z.string().max(300),
	left: z.number().int().min(0),
	top: z.number().int().min(0),
	width: z.number().int().positive(),
	height: z.number().int().positive()
}).strict();
const contentSchema = z.object({
	path: z.string().max(300),
	assets: z.array(assetSchema).max(40),
	issues: z.array(z.string().max(1e3)).max(100),
	source: z.enum(["agent", "manual"])
}).strict();
const bookSchema = z.object({
	format: z.literal(1),
	id: textbookId,
	title: label,
	subject: z.enum([
		"chinese",
		"math",
		"english",
		"other"
	]),
	expectedPages: z.number().int().min(1).max(2e3).nullable(),
	revision,
	confirmedAt: z.number().optional()
}).strict();
const pageSchema = z.object({
	format: z.literal(1),
	id: textbookId,
	bookId: textbookId,
	position: z.number().int().min(1).max(2e3),
	printedPage: z.string().max(40),
	sha256: z.string().regex(/^[a-f0-9]{64}$/u),
	mediaType: z.enum([
		"image/jpeg",
		"image/png",
		"image/webp"
	]),
	width: z.number().int().positive(),
	height: z.number().int().positive(),
	original: z.string().max(300),
	revision,
	status: z.enum([
		"received",
		"queued",
		"parsing",
		"review",
		"confirmed",
		"failed"
	]),
	updatedAt: z.number(),
	excluded: z.boolean().optional(),
	content: contentSchema.optional(),
	candidate: contentSchema.optional(),
	job: z.object({
		id: textbookId,
		model: modelSchema
	}).strict().optional(),
	error: z.string().max(1e3).optional()
}).strict();
const textbookCommand = z.discriminatedUnion("action", [
	z.object({ action: z.literal("list") }).strict(),
	z.object({
		action: z.literal("create"),
		id: textbookId,
		title: label,
		subject: bookSchema.shape.subject,
		expectedPages: bookSchema.shape.expectedPages
	}).strict(),
	z.object({
		action: z.literal("book"),
		bookId: textbookId
	}).strict(),
	z.object({
		action: z.literal("configure"),
		bookId: textbookId,
		revision,
		title: label,
		expectedPages: bookSchema.shape.expectedPages
	}).strict(),
	z.object({
		action: z.literal("page"),
		bookId: textbookId,
		pageId: textbookId
	}).strict(),
	z.object({
		action: z.literal("queue"),
		bookId: textbookId,
		pageId: textbookId,
		revision,
		requestId: textbookId.optional()
	}).strict(),
	z.object({
		action: z.literal("exclude"),
		bookId: textbookId,
		pageId: textbookId,
		revision,
		excluded: z.boolean()
	}).strict(),
	z.object({
		action: z.literal("edit"),
		bookId: textbookId,
		pageId: textbookId,
		revision,
		markdown: z.string().min(1).max(262144),
		printedPage: z.string().max(40),
		position: z.number().int().min(1).max(2e3),
		confirm: z.boolean(),
		useCandidate: z.boolean()
	}).strict(),
	z.object({
		action: z.literal("complete"),
		bookId: textbookId,
		revision
	}).strict()
]);
const uploadSchema = z.object({
	bookId: textbookId,
	pageId: textbookId,
	position: z.coerce.number().int().min(1).max(2e3),
	printedPage: z.string().max(40)
}).strict();
/** Expected failures safe to show without leaking filesystem or provider credentials. */
var TextbookError = class extends Error {
	code;
	constructor(code, message) {
		super(message);
		this.code = code;
	}
};
//#endregion
//#region lib/types/textbooks/store.js
/** Durable Markdown revisions, original photos and compare-and-swap page records. */
const root = ".study/textbooks";
const maxPhotoBytes = 20971520;
const signal = () => new AbortController().signal;
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const bookPath = (id) => `${root}/${textbookId.parse(id)}`;
const pagePath = (bookId, pageId) => `${bookPath(bookId)}/pages/${textbookId.parse(pageId)}`;
/** A workspace-bound store. Metadata writes use the existing DSH filesystem CAS. */
var TextbookStore = class {
	workspace;
	files;
	constructor(workspace, files) {
		this.workspace = workspace;
		this.files = files;
	}
	async load(path, parse) {
		const observed = await this.files.stat(path, signal());
		if (!observed) return void 0;
		const bytes = await this.files.read(path, signal(), 2097152);
		return {
			value: parse(JSON.parse(Buffer.from(bytes).toString("utf8"))),
			version: observed.version
		};
	}
	async write(path, value, version) {
		if (!this.files.write) throw new TextbookError("unavailable", "课本工作区不可写。");
		try {
			await this.files.write(path, JSON.stringify(value, null, 2) + "\n", version ? {
				kind: "replaceIfVersion",
				version: version.version
			} : { kind: "createIfAbsent" }, signal());
		} catch (error) {
			if (error instanceof Error && "code" in error && ["FS_STALE_VERSION", "FS_NOT_OBSERVED"].includes(String(error.code))) throw new TextbookError("conflict", "内容已更新，请刷新后重试。");
			throw error;
		}
	}
	async updateBook(book, expected) {
		const path = `${bookPath(book.id)}/book.json`;
		const observed = await this.files.stat(path, signal());
		const current = await this.book(book.id);
		if (!observed || current.revision !== expected) throw new TextbookError("conflict", "课本信息已更新，请刷新。");
		await this.write(path, {
			...book,
			revision: expected + 1
		}, observed);
		return this.book(book.id);
	}
	/** Read a book without modifying its metadata. */
	async book(id) {
		const record = await this.load(`${bookPath(id)}/book.json`, bookSchema.parse);
		if (!record || record.value.id !== id) throw new TextbookError("missing", "课本不存在。");
		return record.value;
	}
	/** Read a page, verifying its stored ownership matches the requested path. */
	async page(bookId, pageId) {
		const record = await this.load(`${pagePath(bookId, pageId)}/page.json`, pageSchema.parse);
		if (!record || record.value.id !== pageId || record.value.bookId !== bookId) throw new TextbookError("missing", "课本页面不存在。");
		const owned = `${pagePath(bookId, pageId)}/`;
		for (const path of [record.value.original, ...[record.value.content, record.value.candidate].flatMap((content) => content ? [content.path, ...content.assets.map((asset) => asset.path)] : [])]) if (!path.startsWith(owned) || path.split("/").includes("..")) throw new TextbookError("invalid", "页面引用了不属于它的文件。");
		return record.value;
	}
	/** List committed books; temporary/orphaned files are not records. */
	async books() {
		const entries = await this.files.list(root, signal());
		const books = [];
		for (const entry of entries) if (entry.type === "directory" && textbookId.safeParse(entry.name).success) {
			if (await this.load(`${bookPath(entry.name)}/book.json`, bookSchema.parse)) books.push(await this.book(entry.name));
		}
		return books.sort((a, b) => a.title.localeCompare(b.title));
	}
	/** List committed pages in capture order; unnumbered pages have their own positions. */
	async pages(bookId) {
		await this.book(bookId);
		const entries = await this.files.list(`${bookPath(bookId)}/pages`, signal());
		const pages = [];
		for (const entry of entries) if (entry.type === "directory" && textbookId.safeParse(entry.name).success) {
			if (await this.load(`${pagePath(bookId, entry.name)}/page.json`, pageSchema.parse)) pages.push(await this.page(bookId, entry.name));
		}
		return pages.sort((a, b) => a.position - b.position || a.id.localeCompare(b.id));
	}
	/** Resolve only generated textbook paths; reject symlinks before opening binary files. */
	async binaryPath(path, create) {
		if (!path.startsWith(`${root}/`) || path.split("/").some((part) => !/^[a-zA-Z0-9_.-]+$/u.test(part) || part === ".." || part === ".")) throw new TextbookError("invalid", "非法课本文件路径。");
		const cwd = await realpath(this.workspace);
		const parts = path.split("/");
		let parent = cwd;
		for (const part of parts.slice(0, -1)) {
			parent = join(parent, part);
			if (create) try {
				await mkdir(parent);
			} catch (error) {
				if (!(error instanceof Error && "code" in error && error.code === "EEXIST")) throw error;
			}
			const info = await lstat(parent);
			if (!info.isDirectory() || info.isSymbolicLink()) throw new TextbookError("invalid", "课本目录不能是符号链接。");
		}
		const local = relative(cwd, await realpath(parent));
		if (local === ".." || local.startsWith(`..${sep}`)) throw new TextbookError("invalid", "文件超出学习工作区。");
		return join(parent, parts.at(-1));
	}
	/** Publish immutable bytes before updating the metadata pointer; failed writes leave no accepted page. */
	async put(path, bytes) {
		if (bytes.byteLength > maxPhotoBytes) throw new TextbookError("invalid", "课本文件不能超过 20 MB，请缩小插图区域后重试。");
		const target = await this.binaryPath(path, true);
		const temp = join(dirname(target), `pending-${randomUUID()}`);
		const file = await open(temp, constants$1.O_WRONLY | constants$1.O_CREAT | constants$1.O_EXCL | constants$1.O_NOFOLLOW, 384);
		try {
			await file.writeFile(bytes);
			await file.sync();
		} finally {
			await file.close();
		}
		try {
			try {
				await link(temp, target);
			} catch (error) {
				if (!(error instanceof Error && "code" in error && error.code === "EEXIST")) throw error;
				if (hash(await this.bytes(path)) !== hash(bytes)) throw new TextbookError("conflict", "文件标识已被不同内容使用。");
			}
		} finally {
			await unlink(temp);
		}
	}
	/** Read a bounded original/asset/revision selected from a validated page record. */
	async bytes(path) {
		const file = await open(await this.binaryPath(path, false), constants$1.O_RDONLY | constants$1.O_NOFOLLOW);
		try {
			const stat = await file.stat();
			if (!stat.isFile() || stat.size > maxPhotoBytes) throw new TextbookError("invalid", "课本文件类型或大小不合法。");
			return await file.readFile();
		} finally {
			await file.close();
		}
	}
	/** Update one record with a caller-observed revision and filesystem version. */
	async savePage(page, expected) {
		const path = `${pagePath(page.bookId, page.id)}/page.json`;
		const observed = await this.files.stat(path, signal());
		const current = await this.page(page.bookId, page.id);
		if (!observed || current.revision !== expected) throw new TextbookError("conflict", "页面已有新修订，手机上的修改已保留，请核对后再保存。");
		const next = pageSchema.parse({
			...page,
			revision: expected + 1,
			updatedAt: Date.now()
		});
		await this.write(path, next, observed);
		return next;
	}
	/** Receive original bytes idempotently; decoding precedes durable acceptance. */
	async upload(request, bytes) {
		const book = await this.book(request.bookId);
		if (!bytes.length || bytes.length > maxPhotoBytes) throw new TextbookError("invalid", "照片须为 1 字节至 20 MB。");
		const path = pagePath(request.bookId, request.pageId);
		const existing = await this.load(`${path}/page.json`, pageSchema.parse);
		if (existing) {
			if (existing.value.sha256 !== hash(bytes) || existing.value.position !== request.position || existing.value.printedPage !== request.printedPage) throw new TextbookError("conflict", "页面 ID 已用于其他照片或页序。");
			return existing.value;
		}
		const meta = await sharp(bytes, {
			limitInputPixels: 6e7,
			failOn: "error"
		}).metadata();
		if (!meta.width || !meta.height || ![
			"jpeg",
			"png",
			"webp"
		].includes(meta.format ?? "") || (meta.pages ?? 1) !== 1) throw new TextbookError("invalid", "只接受单张 JPEG、PNG 或 WebP 照片。");
		const normalized = await sharp(bytes, { limitInputPixels: 6e7 }).rotate().png().toBuffer({ resolveWithObject: true });
		const original = `${path}/original.${meta.format === "jpeg" ? "jpg" : meta.format}`;
		await this.put(original, bytes);
		const page = {
			format: 1,
			id: request.pageId,
			bookId: request.bookId,
			position: request.position,
			printedPage: request.printedPage,
			sha256: hash(bytes),
			original,
			mediaType: `image/${meta.format}`,
			width: normalized.info.width,
			height: normalized.info.height,
			revision: 1,
			status: "received",
			updatedAt: Date.now()
		};
		if (book.confirmedAt !== void 0) await this.updateBook({
			...book,
			confirmedAt: void 0
		}, book.revision);
		await this.write(`${path}/page.json`, page);
		return page;
	}
	/** Save cropped illustrations and a Markdown revision without replacing an existing human edit. */
	async parsed(page, markdown, issues, crops) {
		const current = await this.page(page.bookId, page.id);
		if (current.job?.id !== page.job?.id || current.status !== "parsing" || current.excluded) throw new TextbookError("conflict", "解析任务已被替换。");
		const base = pagePath(page.bookId, page.id);
		const id = page.job.id;
		const normalized = await sharp(await this.bytes(page.original), { limitInputPixels: 6e7 }).rotate().png().toBuffer();
		const assets = [];
		for (const [i, crop] of crops.entries()) {
			if (crop.left + crop.width > page.width || crop.top + crop.height > page.height) throw new TextbookError("invalid", "插图区域超出页面。");
			const path = `${base}/assets/${id}-${i + 1}.png`;
			await this.put(path, await sharp(normalized).extract(crop).png().toBuffer());
			assets.push({
				path,
				...crop
			});
		}
		markdown = markdown.replace(/asset:(\d+)\b/gu, (reference, number) => assets[Number(number) - 1] ? `../assets/${id}-${number}.png` : reference);
		this.validateMarkdown(markdown, assets);
		const content = {
			path: `${base}/revisions/${id}.md`,
			assets,
			issues,
			source: "agent"
		};
		await this.put(content.path, Buffer.from(markdown));
		return this.savePage({
			...current,
			status: "review",
			error: void 0,
			...current.content ? { candidate: content } : { content }
		}, current.revision);
	}
	validateMarkdown(markdown, assets) {
		if (!markdown.trim() || Buffer.byteLength(markdown) > 262144) throw new TextbookError("invalid", "正文不能为空或超过 256 KB。");
		const allowed = new Set(assets.map((asset) => `../assets/${asset.path.split("/").at(-1)}`));
		function validate(node) {
			if (node.type === "html" || node.type === "imageReference" || node.type === "image" && !allowed.has(node.url)) throw new TextbookError("invalid", "请使用本页已保存的配图，正文不接受 HTML 或外部图片。");
			if ((node.type === "link" || node.type === "definition") && !/^https?:\/\//u.test(node.url) && !allowed.has(node.url)) throw new TextbookError("invalid", "链接只能使用 http(s) 地址或本页配图。");
			if ("children" in node) for (const child of node.children) validate(child);
		}
		for (const node of fromMarkdown(markdown).children) validate(node);
	}
	/** Apply a bounded user command; provider failures do not block photo admission. */
	async command(command, model) {
		if (command.action === "list") return { books: await this.books() };
		if (command.action === "create") {
			const path = `${bookPath(command.id)}/book.json`;
			const existing = await this.load(path, bookSchema.parse);
			if (existing) {
				if (existing.value.title !== command.title || existing.value.subject !== command.subject || existing.value.expectedPages !== command.expectedPages) throw new TextbookError("conflict", "课本 ID 已存在。");
				return { book: existing.value };
			}
			const book = {
				format: 1,
				id: command.id,
				title: command.title,
				subject: command.subject,
				expectedPages: command.expectedPages,
				revision: 1
			};
			await this.write(path, book);
			return { book };
		}
		const book = await this.book(command.bookId);
		if (command.action === "book") return {
			book,
			pages: await this.pages(book.id)
		};
		if (command.action === "configure") return { book: await this.updateBook({
			...book,
			title: command.title,
			expectedPages: command.expectedPages,
			confirmedAt: void 0
		}, command.revision) };
		if (command.action === "complete") {
			const pages = (await this.pages(book.id)).filter((page) => !page.excluded);
			if (!book.expectedPages || pages.length !== book.expectedPages || pages.some((page, index) => page.position !== index + 1 || page.status !== "confirmed" || page.candidate) || new Set(pages.map((page) => page.sha256)).size !== pages.length) throw new TextbookError("invalid", "请先确认总页数、补齐缺页、处理重复照片并逐页校对。");
			return { book: await this.updateBook({
				...book,
				confirmedAt: Date.now()
			}, command.revision) };
		}
		const page = await this.page(book.id, command.pageId);
		if (command.action === "page") return {
			page,
			...page.content ? { markdown: (await this.bytes(page.content.path)).toString("utf8") } : {},
			...page.candidate ? { candidateMarkdown: (await this.bytes(page.candidate.path)).toString("utf8") } : {}
		};
		if (command.action === "queue" && command.requestId && page.job?.id === command.requestId) return { page };
		if (command.revision !== page.revision) throw new TextbookError("conflict", "页面已更新，请先同步并核对修订。");
		if (book.confirmedAt !== void 0) await this.updateBook({
			...book,
			confirmedAt: void 0
		}, book.revision);
		if (command.action === "exclude") return { page: await this.savePage({
			...page,
			excluded: command.excluded,
			status: page.status === "parsing" || page.status === "queued" ? "received" : page.status
		}, page.revision) };
		if (command.action === "queue") {
			if (page.excluded) throw new TextbookError("invalid", "请先恢复此页面，再重新解析。");
			if (page.status === "queued" || page.status === "parsing") return { page };
			return { page: await this.savePage({
				...page,
				status: "queued",
				job: {
					id: command.requestId ?? randomUUID(),
					model
				},
				error: void 0
			}, page.revision) };
		}
		const previous = command.useCandidate ? page.candidate : page.content;
		if (!previous) throw new TextbookError("invalid", "页面尚无可校对的解析结果。");
		this.validateMarkdown(command.markdown, previous.assets);
		const content = {
			...previous,
			path: `${pagePath(book.id, page.id)}/revisions/${randomUUID()}.md`,
			source: "manual",
			issues: command.confirm ? [] : previous.issues
		};
		await this.put(content.path, Buffer.from(command.markdown));
		return {
			page: await this.savePage({
				...page,
				content,
				candidate: void 0,
				position: command.position,
				printedPage: command.printedPage,
				status: command.confirm ? "confirmed" : "review",
				error: void 0
			}, page.revision),
			markdown: command.markdown
		};
	}
};
//#endregion
export { uploadSchema as a, textbookId as i, TextbookError as n, textbookCommand as r, TextbookStore as t };
