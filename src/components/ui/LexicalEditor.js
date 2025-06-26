import React, { useEffect } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $getRoot } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { FORMAT_TEXT_COMMAND } from "lexical";

function Toolbar() {
  const [editor] = useLexicalComposerContext();
  return (
    <div className="border-b mb-2 pb-1 flex gap-2">
      <button
        type="button"
        className="px-2 py-1 text-sm rounded hover:bg-gray-100 font-bold"
        onMouseDown={e => {
          e.preventDefault();
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        }}
      >
        N
      </button>
      <button
        type="button"
        className="px-2 py-1 text-sm rounded hover:bg-gray-100 italic"
        onMouseDown={e => {
          e.preventDefault();
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
        }}
      >
        I
      </button>
      <button
        type="button"
        className="px-2 py-1 text-sm rounded hover:bg-gray-100 underline"
        onMouseDown={e => {
          e.preventDefault();
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
        }}
      >
        U
      </button>
    </div>
  );
}

function LexicalEditorInner({ value, onChange, placeholder }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (editor && value) {
      editor.getEditorState().read(() => {
        const current = $getRoot().getTextContent();
        if (!current) {
          editor.update(() => {
            const parser = new DOMParser();
            const dom = parser.parseFromString(value, 'text/html');
            const nodes = $generateNodesFromDOM(editor, dom.body);
            $getRoot().clear();
            $getRoot().append(...nodes);
          });
        }
      });
    }
    // eslint-disable-next-line
  }, [value, editor]);

  return (
    <>
      <Toolbar />
      <RichTextPlugin
        contentEditable={
          <ContentEditable className="outline-none min-h-[80px] p-2" />
        }
        placeholder={<div className="text-gray-400">{placeholder}</div>}
      />
      <HistoryPlugin />
      <OnChangePlugin
        onChange={editorState => {
          editorState.read(() => {
            const html = $generateHtmlFromNodes(editor, null);
            onChange(html);
          });
        }}
      />
    </>
  );
}

export default function LexicalEditor({ value, onChange, placeholder }) {
  const initialConfig = {
    namespace: "ComunicadoEditor",
    theme: {
      paragraph: "mb-2",
      text: {
        bold: "font-bold",
        italic: "italic",
        underline: "underline",
      },
    },
    onError(error) {
      throw error;
    },
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="border rounded bg-white p-2 min-h-[120px]">
        <LexicalEditorInner value={value} onChange={onChange} placeholder={placeholder} />
      </div>
    </LexicalComposer>
  );
}
