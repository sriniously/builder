import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night";
import { match } from "ts-pattern";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  language: "ts" | "json";
  readOnly?: boolean;
}

export const Editor = ({
  value,
  onChange,
  language,
  readOnly = false,
}: EditorProps) => {
  const lang = match(language)
    .with("ts", () => javascript({ typescript: true }))
    .with("json", () => json())
    .exhaustive();

  return (
    <CodeMirror
      value={value}
      height="100%"
      width="100%"
      theme={tokyoNight}
      readOnly={readOnly}
      extensions={[lang]}
      onChange={(value) => onChange(value)}
      className="overflow-hidden h-full w-full"
    />
  );
};
