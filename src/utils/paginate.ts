export function paginate(
  element: HTMLElement,
  maxHeightPx: number
): DocumentFragment[] {
  const pages: DocumentFragment[] = [];
  let page = document.createDocumentFragment();
  let workingHeight = 0;

  Array.from(element.childNodes).forEach((node, nodeIndex) => {
    const clone = node.cloneNode(true) as HTMLElement;

    // Skip empty text nodes
    if (clone.nodeType === Node.TEXT_NODE && !clone.textContent?.trim()) return;

    // Check for page break - multiple ways to detect
    const isPageBreak =
      (clone as HTMLElement).hasAttribute?.("data-page-break") ||
      (clone as HTMLElement).getAttribute?.("data-page-break") === "" ||
      (clone as HTMLElement).tagName === "HR" ||
      (clone as HTMLElement).classList?.contains("page-break") ||
      clone.innerHTML?.includes("data-page-break");

    if (isPageBreak) {
      // Finish current page
      if (page.childNodes.length > 0) {
        pages.push(page);
      }
      page = document.createDocumentFragment();
      workingHeight = 0;
      return;
    }

    // Create probe to measure height
    const probe = document.createElement("div");
    probe.style.visibility = "hidden";
    probe.style.position = "absolute";
    probe.style.width = "160mm";
    probe.style.fontSize = "12pt";
    probe.style.fontFamily = "Georgia, serif";
    probe.style.lineHeight = "1.8";
    probe.appendChild(clone.cloneNode(true));
    document.body.appendChild(probe);

    const nodeHeight = probe.getBoundingClientRect().height;
    document.body.removeChild(probe);

    // Auto page break if content exceeds height
    if (workingHeight + nodeHeight > maxHeightPx && workingHeight > 0) {
      console.log(
        `Auto page break at node ${nodeIndex}, height: ${
          workingHeight + nodeHeight
        }px > ${maxHeightPx}px`
      );
      pages.push(page);
      page = document.createDocumentFragment();
      workingHeight = 0;
    }

    page.appendChild(clone);
    workingHeight += nodeHeight;
  });

  // Add the last page
  if (page.childNodes.length > 0) {
    pages.push(page);
  }

  // Ensure at least one page
  if (pages.length === 0) {
    const emptyPage = document.createDocumentFragment();
    const emptyParagraph = document.createElement("p");
    emptyParagraph.innerHTML = "&nbsp;";
    emptyPage.appendChild(emptyParagraph);
    pages.push(emptyPage);
  }

  return pages;
}

export function fragmentToHTML(fragment: DocumentFragment): string {
  const div = document.createElement("div");
  div.appendChild(fragment.cloneNode(true));
  return div.innerHTML;
}
