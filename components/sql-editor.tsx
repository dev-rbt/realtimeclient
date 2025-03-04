import { cn } from "@/lib/utils";
import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { EditorView } from "@codemirror/view";

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SqlEditor({ value, onChange, className }: SqlEditorProps) {
  return (
    <div className={cn("relative rounded-md border", className)}>
      <CodeMirror
        value={value}
        onChange={onChange}
        theme={vscodeDark}
        height="200px"
        extensions={[
          sql(),
          EditorView.lineWrapping,
          EditorView.theme({
            "&": {
              fontSize: "14px",
            },
            ".cm-gutters": {
              backgroundColor: "transparent",
              border: "none",
            },
            ".cm-line": {
              padding: "0 4px",
            },
          }),
        ]}
        className="overflow-hidden rounded-md"
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightSpecialChars: true,
          history: true,
          foldGutter: true,
          drawSelection: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          syntaxHighlighting: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          closeBracketsKeymap: true,
          defaultKeymap: true,
          searchKeymap: true,
          historyKeymap: true,
          foldKeymap: true,
          completionKeymap: true,
          lintKeymap: true,
        }}
      />
    </div>
  );
}
