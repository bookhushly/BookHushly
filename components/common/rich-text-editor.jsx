"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import { useEffect, useState } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Highlighter,
  Palette,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  Minus,
} from "lucide-react";

const COLOR_PRESETS = [
  "#000000", // Black
  "#6B7280", // Gray
  "#EF4444", // Red
  "#F59E0B", // Orange
  "#10B981", // Green
  "#3B82F6", // Blue
  "#9333EA", // Purple
  "#EC4899", // Pink
];

const HIGHLIGHT_PRESETS = [
  "#FEF3C7", // Yellow
  "#DBEAFE", // Blue
  "#D1FAE5", // Green
  "#FCE7F3", // Pink
  "#E0E7FF", // Indigo
];

const MenuBar = ({ editor }) => {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  if (!editor) return null;

  const addLink = () => {
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
      setLinkUrl("");
      setShowLinkInput(false);
    }
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
      setShowImageInput(false);
    }
  };

  const setColor = (color) => {
    editor.chain().focus().setColor(color).run();
    setShowColorPicker(false);
  };

  const setHighlight = (color) => {
    editor.chain().focus().setHighlight({ color }).run();
    setShowHighlightPicker(false);
  };

  const buttons = [
    {
      icon: Bold,
      label: "Bold",
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive("bold"),
    },
    {
      icon: Italic,
      label: "Italic",
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive("italic"),
    },
    {
      icon: UnderlineIcon,
      label: "Underline",
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: () => editor.isActive("underline"),
    },
    {
      icon: Strikethrough,
      label: "Strikethrough",
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: () => editor.isActive("strike"),
    },
    { type: "divider" },
    {
      icon: Heading1,
      label: "Heading 1",
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor.isActive("heading", { level: 1 }),
    },
    {
      icon: Heading2,
      label: "Heading 2",
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor.isActive("heading", { level: 2 }),
    },
    {
      icon: Heading3,
      label: "Heading 3",
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: () => editor.isActive("heading", { level: 3 }),
    },
    { type: "divider" },
    {
      icon: AlignLeft,
      label: "Align Left",
      action: () => editor.chain().focus().setTextAlign("left").run(),
      isActive: () => editor.isActive({ textAlign: "left" }),
    },
    {
      icon: AlignCenter,
      label: "Align Center",
      action: () => editor.chain().focus().setTextAlign("center").run(),
      isActive: () => editor.isActive({ textAlign: "center" }),
    },
    {
      icon: AlignRight,
      label: "Align Right",
      action: () => editor.chain().focus().setTextAlign("right").run(),
      isActive: () => editor.isActive({ textAlign: "right" }),
    },
    {
      icon: AlignJustify,
      label: "Justify",
      action: () => editor.chain().focus().setTextAlign("justify").run(),
      isActive: () => editor.isActive({ textAlign: "justify" }),
    },
    { type: "divider" },
    {
      icon: List,
      label: "Bullet List",
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive("bulletList"),
    },
    {
      icon: ListOrdered,
      label: "Numbered List",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive("orderedList"),
    },
    {
      icon: Quote,
      label: "Blockquote",
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: () => editor.isActive("blockquote"),
    },
    {
      icon: Code,
      label: "Code",
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: () => editor.isActive("code"),
    },
    { type: "divider" },
    {
      icon: Palette,
      label: "Text Color",
      action: () => setShowColorPicker(!showColorPicker),
      isActive: () => showColorPicker,
    },
    {
      icon: Highlighter,
      label: "Highlight",
      action: () => setShowHighlightPicker(!showHighlightPicker),
      isActive: () => showHighlightPicker || editor.isActive("highlight"),
    },
    { type: "divider" },
    {
      icon: editor.isActive("link") ? Unlink : LinkIcon,
      label: editor.isActive("link") ? "Remove Link" : "Add Link",
      action: () => {
        if (editor.isActive("link")) {
          removeLink();
        } else {
          setShowLinkInput(!showLinkInput);
        }
      },
      isActive: () => editor.isActive("link") || showLinkInput,
    },
    {
      icon: ImageIcon,
      label: "Insert Image",
      action: () => setShowImageInput(!showImageInput),
      isActive: () => showImageInput,
    },
    {
      icon: Minus,
      label: "Horizontal Rule",
      action: () => editor.chain().focus().setHorizontalRule().run(),
      isActive: () => false,
    },
    { type: "divider" },
    {
      icon: Undo,
      label: "Undo",
      action: () => editor.chain().focus().undo().run(),
      isActive: () => false,
      disabled: !editor.can().undo(),
    },
    {
      icon: Redo,
      label: "Redo",
      action: () => editor.chain().focus().redo().run(),
      isActive: () => false,
      disabled: !editor.can().redo(),
    },
  ];

  return (
    <div className="border-b border-gray-200 bg-gray-50">
      <div className="px-3 py-2 flex flex-wrap items-center gap-1">
        {buttons.map((button, index) => {
          if (button.type === "divider") {
            return (
              <div
                key={`divider-${index}`}
                className="w-px h-6 bg-gray-300 mx-1"
              />
            );
          }

          const Icon = button.icon;
          const isActive = button.isActive();
          const isDisabled = button.disabled;

          return (
            <button
              key={button.label}
              onClick={button.action}
              disabled={isDisabled}
              type="button"
              title={button.label}
              className={`
                p-2 rounded hover:bg-gray-200 transition-colors
                ${isActive ? "bg-purple-100 text-purple-600" : "text-gray-700"}
                ${isDisabled ? "opacity-40 cursor-not-allowed" : ""}
              `}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>

      {/* Link Input */}
      {showLinkInput && (
        <div className="px-3 py-2 border-t border-gray-200 bg-white">
          <div className="flex gap-2">
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addLink();
                }
              }}
              placeholder="Enter URL (https://example.com)"
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
            />
            <button
              onClick={addLink}
              type="button"
              className="px-4 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
            >
              Add Link
            </button>
            <button
              onClick={() => {
                setShowLinkInput(false);
                setLinkUrl("");
              }}
              type="button"
              className="px-4 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Image Input */}
      {showImageInput && (
        <div className="px-3 py-2 border-t border-gray-200 bg-white">
          <div className="flex gap-2">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addImage();
                }
              }}
              placeholder="Enter image URL (https://example.com/image.jpg)"
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
            />
            <button
              onClick={addImage}
              type="button"
              className="px-4 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
            >
              Insert
            </button>
            <button
              onClick={() => {
                setShowImageInput(false);
                setImageUrl("");
              }}
              type="button"
              className="px-4 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Color Picker */}
      {showColorPicker && (
        <div className="px-3 py-2 border-t border-gray-200 bg-white">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                editor.chain().focus().unsetColor().run();
                setShowColorPicker(false);
              }}
              type="button"
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Clear Color
            </button>
            {COLOR_PRESETS.map((color) => (
              <button
                key={color}
                onClick={() => setColor(color)}
                type="button"
                className="w-8 h-8 rounded border-2 border-gray-300 hover:border-purple-500 transition-colors"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Highlight Picker */}
      {showHighlightPicker && (
        <div className="px-3 py-2 border-t border-gray-200 bg-white">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                editor.chain().focus().unsetHighlight().run();
                setShowHighlightPicker(false);
              }}
              type="button"
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Clear Highlight
            </button>
            {HIGHLIGHT_PRESETS.map((color) => (
              <button
                key={color}
                onClick={() => setHighlight(color)}
                type="button"
                className="w-8 h-8 rounded border-2 border-gray-300 hover:border-purple-500 transition-colors"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function RichTextEditor({
  content = "",
  onChange,
  placeholder = "Start typing...",
  className = "",
  minHeight = "200px",
  disabled = false,
  showWordCount = false,
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            "text-purple-600 underline hover:text-purple-700 cursor-pointer",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg my-4",
        },
      }),
    ],
    content,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (onChange) {
        onChange(html);
      }
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-full",
      },
    },
  });

  // Sync content changes
  useEffect(() => {
    if (editor && content !== undefined && content !== null) {
      const currentContent = editor.getHTML();
      if (content !== currentContent) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  // Sync disabled state
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  // Get word count
  const wordCount = editor
    ? editor.state.doc.textContent.split(/\s+/).filter(Boolean).length
    : 0;

  const charCount = editor ? editor.state.doc.textContent.length : 0;

  // Show loading state while editor initializes
  if (!isClient || !editor) {
    return (
      <div
        className={`border border-gray-200 rounded-lg overflow-hidden bg-white ${className}`}
      >
        <div className="border-b border-gray-200 bg-gray-50 px-3 py-2 h-[42px]">
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
        </div>
        <div style={{ minHeight }} className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`border border-gray-200 rounded-lg overflow-hidden bg-white ${className} ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      <MenuBar editor={editor} />

      {/* Editor Container with proper styling */}
      <div style={{ minHeight }} className="overflow-y-auto">
        <div className="px-4 py-3">
          <EditorContent editor={editor} className="rich-text-editor-content" />
        </div>
      </div>

      {/* Word Count Footer */}
      {showWordCount && (
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-600 flex justify-between">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
        </div>
      )}

      {/* Add custom styles for the editor */}
      <style jsx global>{`
        .rich-text-editor-content .ProseMirror {
          min-height: ${minHeight};
        }

        .rich-text-editor-content .ProseMirror > * + * {
          margin-top: 0.75em;
        }

        .rich-text-editor-content .ProseMirror h1 {
          font-size: 2em;
          font-weight: 700;
          line-height: 1.2;
          margin-top: 0.67em;
          margin-bottom: 0.67em;
        }

        .rich-text-editor-content .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: 600;
          line-height: 1.3;
          margin-top: 0.83em;
          margin-bottom: 0.83em;
        }

        .rich-text-editor-content .ProseMirror h3 {
          font-size: 1.17em;
          font-weight: 600;
          line-height: 1.4;
          margin-top: 1em;
          margin-bottom: 1em;
        }

        .rich-text-editor-content .ProseMirror p {
          margin: 0;
          line-height: 1.6;
        }

        .rich-text-editor-content .ProseMirror ul,
        .rich-text-editor-content .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 0.75em 0;
        }

        .rich-text-editor-content .ProseMirror ul {
          list-style-type: disc;
        }

        .rich-text-editor-content .ProseMirror ol {
          list-style-type: decimal;
        }

        .rich-text-editor-content .ProseMirror li {
          margin: 0.25em 0;
        }

        .rich-text-editor-content .ProseMirror blockquote {
          border-left: 3px solid #9333ea;
          padding-left: 1rem;
          margin: 1em 0;
          color: #6b7280;
          font-style: italic;
        }

        .rich-text-editor-content .ProseMirror code {
          background-color: #f3f4f6;
          border-radius: 0.25rem;
          padding: 0.125rem 0.25rem;
          font-family: monospace;
          font-size: 0.9em;
        }

        .rich-text-editor-content .ProseMirror pre {
          background-color: #1f2937;
          color: #f9fafb;
          border-radius: 0.5rem;
          padding: 1rem;
          overflow-x: auto;
          margin: 1em 0;
        }

        .rich-text-editor-content .ProseMirror pre code {
          background-color: transparent;
          color: inherit;
          padding: 0;
        }

        .rich-text-editor-content .ProseMirror hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 2rem 0;
        }

        .rich-text-editor-content .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }

        .rich-text-editor-content
          .ProseMirror
          p.is-editor-empty:first-child::before {
          content: "${placeholder}";
          color: #9ca3af;
          pointer-events: none;
          height: 0;
          float: left;
        }

        .rich-text-editor-content .ProseMirror:focus {
          outline: none;
        }

        /* Text alignment */
        .rich-text-editor-content .ProseMirror [style*="text-align: left"] {
          text-align: left;
        }

        .rich-text-editor-content .ProseMirror [style*="text-align: center"] {
          text-align: center;
        }

        .rich-text-editor-content .ProseMirror [style*="text-align: right"] {
          text-align: right;
        }

        .rich-text-editor-content .ProseMirror [style*="text-align: justify"] {
          text-align: justify;
        }
      `}</style>
    </div>
  );
}
