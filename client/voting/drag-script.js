export const sortableList = document.getElementById("sortable");
let draggedItem = null;

// Start of Drag Feature
sortableList.addEventListener("dragstart", (e) => {
    draggedItem = e.target;
    e.target.classList.add("dragging");
});

sortableList.addEventListener("dragend", () => {
    draggedItem.classList.remove("dragging");
    draggedItem = null;
});

sortableList.addEventListener("dragover", (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(sortableList, e.clientY);
    const currentElement = document.querySelector(".dragging");
    if (afterElement == null) {
        sortableList.appendChild(draggedItem);
    } else {
        sortableList.insertBefore(draggedItem, afterElement);
    }
});

const getDragAfterElement = (container, y) => {
    const draggableElements = [...container.querySelectorAll("li:not(.dragging)")];

    return draggableElements.reduce(
        (closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return {
                    offset: offset,
                    element: child,
                };
            } else {
                return closest;
            }
        },
        {
            offset: Number.NEGATIVE_INFINITY,
        }
    ).element;
};

// End of Drag Feature