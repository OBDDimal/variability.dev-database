let isColorCoded = false;
let isShortenedName = false;

document.querySelector('#navigation-menu-count').addEventListener('click', () => colorNodes(countNodes));

document.querySelector('#navigation-menu-count-direct-children').addEventListener('click', () => colorNodes(countDirectChildren, 'aqua'));

document.querySelector('#navigation-menu-count-total-children').addEventListener('click', () => colorNodes(countTotalChildren, 'orange'));

document.querySelector('#navigation-menu-fit-to-width').addEventListener('click', () => zoomFit());

document.querySelector('#navigation-menu-reset-view').addEventListener('click', () => initialize());

document.querySelector('#navigation-menu-shortened-name').addEventListener('click', (e) => displayShortenedName(e.target));

document
	.querySelector('#feature-max-levels')
	.addEventListener('change', (e) => initialize(e.target.value, document.querySelector('#feature-max-children').value));

document
	.querySelector('#feature-max-children')
	.addEventListener('change', (e) => initialize(document.querySelector('#feature-max-levels').value, e.target.value));

document.querySelector('#navigation-menu-export-to-xml').addEventListener('click', () => exportToXML());

function colorNodes(coloringFunction, color = 'green') {
	if (isColorCoded) {
		for (const d3Node of allD3Nodes) {
			d3Node.data.color = d3Node.data.isAbstract ? NODE_ABSTRACT_COLOR : NODE_COLOR;
		}
	} else {
		const [count, max] = coloringFunction(); // Must return {"nodeName": integer}
		const colors = d3.scaleLinear().domain(d3.ticks(1, max, COLORING_MAP.length)).range(COLORING_MAP);

		for (const d3Node of allD3Nodes) {
			if (count[d3Node.data.name] !== undefined && !d3Node.data.isAbstract) {
				d3Node.data.color = colors(count[d3Node.data.name]);
			}
		}
	}

	isColorCoded = !isColorCoded;

	updateSvg();
}

/**
 * Counts all nodes
 * @returns [{"nodeName": integer}, maxAmount]
 */
function countNodes() {
	let count = {};
	let max = 0;
	for (const d3Node of allD3Nodes) {
		if (count[d3Node.data.name]) {
			count[d3Node.data.name] += 1;
			max = max < count[d3Node.data.name] ? count[d3Node.data.name] : max;
		} else {
			count[d3Node.data.name] = 1;
			max = max < count[d3Node.data.name] ? count[d3Node.data.name] : max;
		}
	}

	return [count, max];
}

function countDirectChildren() {
	let count = {};
	let max = 0;

	for (const d3Node of allD3Nodes) {
		count[d3Node.data.name] = d3Node.data.childrenCount();
		max = max < count[d3Node.data.name] ? count[d3Node.data.name] : max;
	}

	return [count, max];
}

function countTotalChildren() {
	let count = {};
	let max = 0;

	for (const d3Node of allD3Nodes) {
		count[d3Node.data.name] = d3Node.data.totalSubnodesCount();
		max = max < count[d3Node.data.name] ? count[d3Node.data.name] : max;
	}

	return [count, max];
}

function displayShortenedName(checkbox) {
	isShortenedName = checkbox.checked;
	updateSvg();
}

function exportToXML() {
	let root = {};

	Object.entries(featureMap).forEach(([_, node]) => {
		if (node.isRoot) {
			root = node;
		}
	});

	let xml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?><featureModel>`;
	xml += `<struct>${nodeToXML(root)}</struct>`;
	xml += `<constraints>${constraints.reduce(
		(prev, constraint) => prev + '<rule>' + constraintToXML(constraint) + '</rule>',
		''
	)}</constraints>`;
	xml += `</featureModel>`;

	const filename = 'featureModel.xml';
	const pom = document.createElement('a');
	const bb = new Blob([xml], { type: 'application/xml' });

	pom.setAttribute('href', window.URL.createObjectURL(bb));
	pom.setAttribute('download', filename);

	pom.dataset.downloadurl = ['application/xml', pom.download, pom.href].join(':');

	pom.click();
}

function nodeToXML(node) {
	if (node.isLeaf()) {
		return `<feature ${node.isAbstract ? 'abstract="true" ' : ''}${node.isMandatory ? 'mandatory="true" ' : ''}name="${node.name}"/>`;
	} else {
		let toReturn = `<${node.groupType} ${node.isAbstract ? 'abstract="true" ' : ''}${
			node.isMandatory ? 'mandatory="true" ' : ''
		}name="${node.name}">`;

		node.children.forEach((childNode) => {
			toReturn += nodeToXML(childNode);
		});

		toReturn += `</${node.groupType}>`;
		return toReturn;
	}
}

function constraintToXML(constraint) {
	if (constraint instanceof VarConstraint) {
		return `<var>${constraint.featureNode.name}</var>`;
	} else if (constraint instanceof Constraint) {
		let toReturn = `<${constraint.xmlOperator}>`;
		constraint.children.forEach((childConstraint) => {
			toReturn += constraintToXML(childConstraint);
		});
		toReturn += `</${constraint.xmlOperator}>`;
		return toReturn;
	}
}
