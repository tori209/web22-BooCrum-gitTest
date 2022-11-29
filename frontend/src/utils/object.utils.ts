import { colorChips } from '@data/workspace-object-color';
import { fabric } from 'fabric';
import { title } from 'process';
import { v4 } from 'uuid';

export const setEditMenu = (object: fabric.Object) => {
	const width = object?.width || 0;
	const top = object?.top ? object.top - 50 : 0;
	const left = object?.left ? object.left + width / 2 : 0;

	return [left, top];
};

const createNameLabel = (id: string, text: string, x: number, y: number) => {
	const defaultLeft = x + 10;
	const defaultTop = y + 275;
	const defaultFontSize = 15;

	const nameLabelText = new fabric.Text(text, {
		objectId: id,
		top: defaultTop,
		left: defaultLeft,
		fontSize: defaultFontSize,
		objectCaching: false,
	});

	return nameLabelText;
};

const createRect = (id: string, x: number, y: number, fill: string) => {
	const defaultWidth = 300;
	const defaultHeight = 300;

	const rect = new fabric.Rect({
		objectId: id,
		left: x,
		top: y,
		fill: fill,
		width: defaultWidth,
		height: defaultHeight,
		objectCaching: false,
	});

	return rect;
};

const createTextBox = (id: string, x: number, y: number, fontSize: number) => {
	const defaultTop = y + 10;
	const defaultLeft = x + 10;
	const defaultWidth = 280;

	const textbox = new fabric.Textbox('Text...', {
		top: defaultTop,
		left: defaultLeft,
		objectId: id,
		width: defaultWidth,
		objectCaching: false,
		splitByGrapheme: true,
		fontSize: fontSize,
	});

	return textbox;
};

const createPostIt = (
	id: string,
	x: number,
	y: number,
	textBox: fabric.Textbox,
	nameLabel: fabric.Text,
	backgroundRect: fabric.Rect
) => {
	const postit = new fabric.Group([backgroundRect, textBox, nameLabel], {
		objectId: id,
		left: x,
		top: y,
		objectCaching: false,
	});

	return postit;
};

const setLimitHeightEvent = (canvas: fabric.Canvas, textBox: fabric.Textbox, backgroundRect: fabric.Rect) => {
	const handler = (e: fabric.IEvent<Event>) => {
		if (!textBox.height || !textBox.fontSize || !backgroundRect.height) return;
		while (textBox.getScaledHeight() > backgroundRect.getScaledHeight() - 50 && textBox.fontSize > 12) {
			textBox.fontSize--;
			canvas.renderAll();
		}
	};

	textBox.on('changed', handler);
};

const setObjectEditEvent = (
	canvas: fabric.Canvas,
	groupObject: fabric.Group,
	textBox: fabric.Textbox | fabric.IText
) => {
	const id = groupObject.objectId;

	const ungrouping = (items: fabric.Object[], activeObject: fabric.Group) => {
		activeObject._restoreObjectsState();
		canvas.remove(activeObject);
		for (let i = 0; i < items.length; i++) {
			canvas.add(items[i]);
			items[i].lockMovementX = true;
			items[i].lockMovementY = true;
			const obj = items[i];
			if (obj instanceof fabric.Textbox || obj instanceof fabric.IText) {
				canvas.setActiveObject(items[i]);
				obj.enterEditing();
				obj.selectAll();
			}
		}
	};

	textBox.on('editing:exited', () => {
		const items: fabric.Object[] = [];
		canvas.forEachObject(function (obj) {
			if (obj.objectId == id) {
				items.push(obj);
				canvas.remove(obj);
			}
		});
		const grp = new fabric.Group(items, { objectId: id });
		canvas.add(grp);

		grp.on('mousedblclick', () => {
			ungrouping(items, grp);
		});
	});

	groupObject.on('mousedblclick', () => {
		const items = groupObject._objects;
		ungrouping(items, groupObject);
	});
};

const setPreventResizeEvent = (id: string, canvas: fabric.Canvas, backgroundRect: fabric.Rect) => {
	canvas.on('object:scaling', (e) => {
		if (e.target?.objectId !== id) return;
		if (!(e.target instanceof fabric.Group)) return;
		const objs = e.target._objects;
		const rect = backgroundRect;

		objs.forEach((obj) => {
			if (obj instanceof fabric.Textbox || obj instanceof fabric.IText) {
				const group = e.target;
				const width = (group?.getScaledWidth() || 0) - 20 * (group?.scaleX || 1);

				const scaleX = 1 / (group?.scaleX || 1);
				const scaleY = 1 / (group?.scaleY || 1);
				obj.set({
					scaleX: scaleX,
					scaleY: scaleY,
					width: width,
					left: (rect?.get('left') || 0) + 10,
				});
				obj.fire('changed');
			}
		});
	});
};

export const addPostIt = (canvas: fabric.Canvas, x: number, y: number, fontSize: number, fill: string) => {
	const id = v4();
	const nameLabel = createNameLabel(id, 'NAME', x, y);
	const textBox = createTextBox(id, x, y, fontSize);
	const backgroundRect = createRect(id, x, y, fill);
	const postit = createPostIt(id, x, y, textBox, nameLabel, backgroundRect);

	setLimitHeightEvent(canvas, textBox, backgroundRect);
	setObjectEditEvent(canvas, postit, textBox);
	setPreventResizeEvent(id, canvas, backgroundRect);

	canvas.add(postit);
};

// Section

const createSectionTitle = (id: string, text: string, x: number, y: number) => {
	const defaultLeft = x + 10;
	const defaultTop = y - 25;
	const defaultFontSize = 15;

	const title = new fabric.IText(text, {
		objectId: id,
		top: defaultTop,
		left: defaultLeft,
		fontSize: defaultFontSize,
		objectCaching: false,
	});

	return title;
};

const createSection = (
	id: string,
	x: number,
	y: number,
	sectionTitle: fabric.IText,
	titleBackground: fabric.Rect,
	backgroundRect: fabric.Rect
) => {
	const section = new fabric.Group([backgroundRect, titleBackground, sectionTitle], {
		objectId: id,
		left: x,
		top: y,
		objectCaching: false,
	});
	return section;
};

const createTitleBackground = (id: string, x: number, y: number, fill: string) => {
	const defaultWidth = 70;
	const defaultHeight = 20;
	const defaultLeft = x + 7;
	const defaultTop = y - 25;

	const rect = new fabric.Rect({
		objectId: id,
		left: defaultLeft,
		top: defaultTop,
		fill: fill,
		width: defaultWidth,
		height: defaultHeight,
		objectCaching: false,
		rx: 10,
		ry: 10,
	});

	return rect;
};

const setLimitChar = (canvas: fabric.Canvas, title: fabric.IText, background: fabric.Rect) => {
	title.on('editing:entered', () => {
		title.hiddenTextarea?.setAttribute('maxlength', '15');
	});
	const group = title.group;
	if (!group) return;
	title.on('changed', (e) => {
		console.log(group);
		background.set({ width: (title.get('width') || 0) + 10 });
		canvas.renderAll();
	});
};

export const addSection = (canvas: fabric.Canvas, x: number, y: number) => {
	const id = v4();
	const sectionTitle = createSectionTitle(id, 'SECTION', x, y);
	const sectionBackground = createTitleBackground(id, x, y, 'pink');
	const backgroundRect = createRect(id, x, y, 'MediumSlateBlue');
	const section = createSection(id, x, y, sectionTitle, sectionBackground, backgroundRect);

	setObjectEditEvent(canvas, section, sectionTitle);
	setLimitChar(canvas, sectionTitle, sectionBackground);
	section.sendBackwards(true);

	canvas.add(section);
};
