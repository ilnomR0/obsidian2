export function createRange(node, targetPosition){
    let range = document.createRange();
    range.selectNode(node);

    let pos = 0;
    const stack = [node];
    while (stack.length > 0) {
        const current = stack.pop();

        if (current.nodeType === Node.TEXT_NODE) {
            const len = current.textContent.length;
            if (pos + len >= targetPosition) {
                range.setStart(current, targetPosition - pos);
                range.setEnd(current, targetPosition - pos);
                return range;
            }
            pos += len;
        } else if (current.childNodes && current.childNodes.length > 0) {
            for (let i = current.childNodes.length - 1; i >= 0; i--) {
                stack.push(current.childNodes[i]);
            }
        }
    }

    // The target position is greater than the
    // length of the contenteditable element.
    range.setStart(node, node.childNodes.length);
    range.setEnd(node, node.childNodes.length);
    return range;
};


export function setPosition(element, targetPosition){
    const range = createRange(element, targetPosition);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
};

export function MdToHTML(elementName){
    let obj = window.getSelection();
    let selectionRange = obj.getRangeAt(0);
    let clonedRange = selectionRange.cloneRange();
    let element = document.getElementById(elementName);

    clonedRange.selectNodeContents(element);
    clonedRange.setEnd(selectionRange.endContainer, selectionRange.endOffset);
    const cursorLocation = clonedRange.toString().length;

    //md interpretation goes 

    console.log("parsed!", cursorLocation);
    setPosition(element, cursorLocation);
}