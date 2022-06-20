document.querySelector('#vertical-spacing').addEventListener('change', (e) => {
    SPACE_BETWEEN_NODES_VERTICALLY = parseInt(e.target.value);
    updateSvg();
});
