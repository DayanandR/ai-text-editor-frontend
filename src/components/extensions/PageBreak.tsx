import { Node, mergeAttributes } from "@tiptap/core";

export const PageBreak = Node.create({
  name: "pageBreak",
  group: "block",
  selectable: false,
  atom: true,

  parseHTML() {
    return [{ tag: "hr[data-page-break]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "hr",
      mergeAttributes(HTMLAttributes, {
        "data-page-break": "",
        class: "page-break",
      }),
    ];
  },

  addKeyboardShortcuts() {
    return {
      "Ctrl-Enter": () => {
        return this.editor.commands.insertContent({
          type: "pageBreak",
        });
      },
      "Cmd-Enter": () => {
        return this.editor.commands.insertContent({
          type: "pageBreak",
        });
      },
    };
  },
});
