function collapseAction(d3Node) {
	d3Node.data.toggleCollapse();
	updateCollapsing();
	closeContextMenu();
	updateSvg();
}

function contextMenu(e, d3Node) {
	e.preventDefault();
	const contextMenu = document.querySelector('.context-menu');

	// First remove all deactivated classes
	document.querySelectorAll('.context-menu > ul > .deactivated').forEach((e) => e.classList.remove('deactivated'));

	contextMenu.classList.toggle('context-menu-active');
	contextMenu.style.top = e.pageY + 'px';
	contextMenu.style.left = e.pageX + 'px';

	// Collapse
	if (d3Node.children || d3Node.collapsedChildren) {
		// Active link
		document.querySelector('#context-menu-collapse').classList.remove('deactivated');
		document.querySelector('#context-menu-collapse').addEventListener('click', () => collapseAction(d3Node));
	} else {
		// Inactive link
		document.querySelector('#context-menu-collapse').classList.add('deactivated');
	}

	// Hide left siblings
	if (d3Node.parent?.children?.length > 1 && d3Node.parent.children[0].data.name !== d3Node.data.name) {
		// Active link
		document.querySelector('#context-menu-toggle-left-siblings').addEventListener('click', () => toggleLeftSiblings(d3Node));
	} else {
		// Inactive link
		document.querySelector('#context-menu-toggle-left-siblings').classList.add('deactivated');
	}

	// Hide right siblings
	if (d3Node.parent?.children?.length > 1 && d3Node.parent.children[d3Node.parent.children.length - 1].data.name !== d3Node.data.name) {
		// Active link
		document.querySelector('#context-menu-toggle-right-siblings').addEventListener('click', () => toggleRightSiblings(d3Node));
	} else {
		// Inactive link
		document.querySelector('#context-menu-toggle-right-siblings').classList.add('deactivated');
	}

	// Hide current node
	if (!d3Node.data.isHidden) {
		// Active link
		document.querySelector('#context-menu-hide-node').addEventListener('click', () => hideNode(d3Node));
	} else {
		// Inactive link
		document.querySelector('#context-menu-hide-node').classList.add('deactivated');
	}

	// Highlight constraints
	if (d3Node.data.constraints.length) {
		// Active link
		document.querySelector('#context-menu-highlight-constraints').addEventListener('click', () => {
			d3Node.data.constraints.forEach((constraint) => constraint.toggleHighlighted());
			updateSvg();
		});
	} else {
		// Inactive link
		document.querySelector('#context-menu-highlight-constraints').classList.add('deactivated');
	}

	// Edit functionality
	document.querySelector('#context-menu-edit').addEventListener('click', () => editFeatureNode(d3Node));
}

function closeContextMenu() {
	document.querySelectorAll('.context-menu-active').forEach((e) => {
		e.classList.remove('context-menu-active');
	});
	const contextMenu = document.querySelector('.context-menu');
	const contextMenuClone = contextMenu.cloneNode(true);
	contextMenu.parentNode.replaceChild(contextMenuClone, contextMenu);
}

function toggleLeftSiblings(d3Node) {
	if (d3Node.data.getLeftSibling().isHidden) {
		d3Node.data.unhideLeftSiblings();
	} else {
		d3Node.data.hideLeftSiblings();
	}

	closeContextMenu();
	updateHiding(d3Node.parent);
	updateSvg();
	focusNode(d3Node);
}

function toggleRightSiblings(d3Node) {
	if (d3Node.data.getRightSibling().isHidden) {
		d3Node.data.unhideRightSiblings();
	} else {
		d3Node.data.hideRightSiblings();
	}

	closeContextMenu();
	updateHiding(d3Node.parent);
	updateSvg();
	focusNode(d3Node);
}

function hideNode(d3Node) {
	d3Node.data.hide();

	closeContextMenu();
	updateHiding(d3Node.parent);
	updateSvg();
	focusNode(d3Node);
}

function editFeatureNode(d3Node) {
	let html = `
		<div class="mb-3">
			<label for="edit-feature-name" class="form-label">Node Name</label>
			<input class="form-control" id="edit-feature-name" value=${d3Node.data.name} autofocus>
		</div>
	`;

	// Edit mandatory/optional in and-group
	if (d3Node.data.parent && d3Node.data.parent.isAnd()) {
		html += `
			<div class="form-check">
				<input class="form-check-input" type="radio" name="edit-feature-optionality" id="edit-feature-optional" ${
					d3Node.data.isMandatory ? '' : 'checked'
				}>
				<label class="form-check-label" for="edit-feature-optional">
					Optional
				</label>
			</div>
			<div class="form-check">
				<input class="form-check-input" type="radio" name="edit-feature-optionality" id="edit-feature-mandatory" ${
					d3Node.data.isMandatory ? 'checked' : ''
				}>
				<label class="form-check-label" for="edit-feature-mandatory">
					Mandatory
				</label>
			</div>
		`;
	}

	// Edit group types
	if (!d3Node.data.isLeaf()) {
		html += `
			<div class="form-check">				
				<input class="form-check-input" type="radio" name="edit-feature-group-type" id="edit-feature-group-and" ${
					d3Node.data.isAnd() ? 'checked' : ''
				}>
				<label class="form-check-label" for="edit-feature-group-and">
					And
				</label>
			</div>
			<div class="form-check">
				<input class="form-check-input" type="radio" name="edit-feature-group-type" id="edit-feature-group-or" ${
					d3Node.data.isOr() ? 'checked' : ''
				}>
				<label class="form-check-label" for="edit-feature-group-or">
					Or
				</label>
			</div>
			<div class="form-check">
				<input class="form-check-input" type="radio" name="edit-feature-group-type" id="edit-feature-group-alt" ${
					d3Node.data.isAlt() ? 'checked' : ''
				}>
				<label class="form-check-label" for="edit-feature-group-alt">
					Alt
				</label>
			</div>
		`;
	}

	// Edit isAbstract
	html += `
			<div class="form-check">
				<input class="form-check-input" type="checkbox" name="flexRadioDefault" id="edit-feature-abstract" ${
					d3Node.data.isAbstract ? 'checked' : ''
				}>
				<label class="form-check-label" for="edit-feature-abstract">
					Abstract
				</label>
			</div>
		`;

	Swal.fire({
		title: 'Edit node',
		html: html,
		showCancelButton: true,
		confirmButtonText: 'Confirm',
		cancelButtonText: 'Cancel',
		preConfirm: () => {
			const name = Swal.getPopup().querySelector('#edit-feature-name').value;
			const optionality = Swal.getPopup().querySelector('#edit-feature-optional')?.checked ? 'optional' : 'mandatory';
			const groupType =
				Swal.getPopup().querySelector('#edit-feature-group-and')?.checked
					? 'and'
					: Swal.getPopup().querySelector('#edit-feature-group-or')?.checked
					? 'or'
					: 'alt';
			const isAbstract = Swal.getPopup().querySelector('#edit-feature-abstract').checked;
			
			if (!name || allD3Nodes.some((d3N) => d3Node !== d3N && d3N.data.name === name)) {
				Swal.showValidationMessage(`Please enter a unique name`);
			}

			return { name: name, optionality: optionality, groupType: groupType, isAbstract: isAbstract };
		},
	}).then((result) => {
		if (result.isConfirmed) {
			d3Node.data.name = result.value.name;
			d3Node.data.isMandatory = result.value.optionality ? result.value.optionality === 'mandatory' : d3Node.data.isMandatory;
			d3Node.data.groupType = result.value.groupType ?? d3Node.data.groupType;
			d3Node.data.isAbstract = result.value.isAbstract;

			updateSvg();
		}
		if (result.isCancelled) {
			// Do stuff...
		}

		closeContextMenu();
	});
}
