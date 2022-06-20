document.querySelector('.feature-model-constraints').addEventListener('mouseenter', (e) => {
    constraints.forEach((constraint, i) => {
        const constraintElement = e.target.appendChild(document.createElement("div"));
        constraintElement.innerText = constraint.toString();
        constraintElement.dataset.constraint = i;
        constraintElement.style.backgroundColor = constraints[i].color ?? "white";

        constraintElement.addEventListener('click', (e) => {
            constraints[e.target.dataset.constraint].toggleHighlighted();
            e.target.style.backgroundColor = constraints[e.target.dataset.constraint].isHighlighted ? constraints[e.target.dataset.constraint].color : "white";
            // Uncollapse all constraints
            constraints[e.target.dataset.constraint].getAllVars().forEach(constraint => constraint.isCollapsed = false);

            updateSvg();
        })
    });
})

document.querySelector('.feature-model-constraints').addEventListener('mouseleave', (e) => {
    e.target.innerHTML = "Hover to see constraints"
})