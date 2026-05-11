"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  X, 
  Save, 
  Globe, 
  Type, 
  Hash, 
  User as UserIcon, 
  FileText,
  Loader2,
  ChevronLeft,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  Undo2,
  Redo2,
  Minus,
} from "lucide-react";
import { 
  addDoc, 
  collection, 
  serverTimestamp, 
  updateDoc, 
  doc 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";

import { useRouter } from "next/navigation";

interface BlogEditorProps {
  blog?: any;
  onClose?: () => void;
}


function ToolbarButton({ 
  onClick, 
  isActive = false, 
  children, 
  title 
}: { 
  onClick: () => void; 
  isActive?: boolean; 
  children: React.ReactNode; 
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition-all ${
        isActive 
          ? "bg-blue-600/20 text-blue-400" 
          : "text-slate-500 hover:text-white hover:bg-white/5"
      }`}
    >
      {children}
    </button>
  );
}

const extensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
  }),
  Underline,
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: "text-blue-400 underline underline-offset-4 cursor-pointer",
    },
  }),
];

export default function BlogEditor({ blog, onClose }: BlogEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    author: "Admin",
    metaDescription: "",
  });

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: blog?.content || "",
    editorProps: {
      attributes: {
        class: "prose prose-invert prose-lg max-w-none min-h-[400px] p-6 outline-none focus:outline-none text-slate-300 leading-relaxed",
      },
    },
  });

  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title || "",
        slug: blog.slug || "",
        author: blog.author || "Admin",
        metaDescription: blog.metaDescription || "",
      });
      if (editor && blog.content) {
        editor.commands.setContent(blog.content);
      }
    }
  }, [blog, editor]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.push("/admin/blogs");
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.title || !editor?.getHTML()) {
      toast.error("Please fill in title and content");
      return;
    }

    setLoading(true);
    try {
      const blogData = {
        ...formData,
        content: editor.getHTML(),
        updatedAt: serverTimestamp(),
      };

      if (blog?.id) {
        await updateDoc(doc(db, "blogs", blog.id), blogData);
        toast.success("Article updated successfully");
      } else {
        await addDoc(collection(db, "blogs"), {
          ...blogData,
          createdAt: serverTimestamp(),
        });
        toast.success("Article published successfully");
      }
      handleClose();
    } catch (error) {
      console.error("Error saving blog:", error);
      toast.error("Failed to save article");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-page-bg flex flex-col -m-4 md:-m-6 lg:-m-8 pb-20">
   
      <div className="flex items-center justify-between px-6 pt-10 pb-6 border-b border-white/5 bg-page-bg/80 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-white/5 rounded-xl transition-all text-slate-500 hover:text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight mb-1">
              {blog ? "Edit Article" : "Compose New Piece"}
            </h2>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] opacity-60">
              {formData.title || "Untitled draft"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleClose}
            className="hidden md:flex border-white/5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl h-12 px-6 font-bold text-xs bg-transparent border"
          >
            Discard
          </Button>
          <Button 
            onClick={() => handleSubmit()}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 px-8 gap-2 font-black text-xs transition-all active:scale-95 shadow-lg shadow-blue-600/20"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {blog ? "Update Content" : "Publish to Blog"}
          </Button>
        </div>
      </div>

      <div>
        <div className="w-full px-6 md:px-12 py-10">
          <form className="w-full space-y-12" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-500">
                <Type size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Article Title</span>
              </div>
              <input 
                type="text"
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="Enter a compelling title..."
                className="w-full bg-transparent border-none focus:ring-0 text-3xl md:text-5xl font-black text-white placeholder:text-white/5 p-0 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                  <Globe size={12} /> URL Slug
                </label>
                <div className="flex items-center gap-2 bg-card-bg border border-white/5 rounded-xl px-4 py-2 text-slate-500">
                  <span className="text-xs">/blog/</span>
                  <input 
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="bg-transparent border-none focus:ring-0 p-0 text-xs font-bold text-white flex-1 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                  <UserIcon size={12} /> Author
                </label>
                <input 
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                  className="w-full bg-white/2 border border-white/5 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:border-blue-500/50 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                <Hash size={12} /> SEO Meta Description
              </label>
              <textarea 
                value={formData.metaDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                placeholder="Write a brief summary for search results (max 160 characters)..."
                rows={2}
                className="w-full bg-card-bg border border-white/5 rounded-xl px-4 py-3 text-xs font-medium text-slate-400 focus:border-blue-500/50 transition-all outline-none resize-none"
              />
            </div>

            <div className="space-y-4 pt-6 border-t border-white/5">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <FileText size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Body Content</span>
              </div>

              {editor && (
                <div className="sticky top-0 z-100 bg-page-bg border border-white/5 rounded-t-2xl p-3 flex flex-wrap gap-1 items-center shadow-2xl">
                  <ToolbarButton 
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
                    isActive={editor.isActive("heading", { level: 1 })}
                    title="Heading 1"
                  >
                    <Heading1 size={16} />
                  </ToolbarButton>
                  <ToolbarButton 
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
                    isActive={editor.isActive("heading", { level: 2 })}
                    title="Heading 2"
                  >
                    <Heading2 size={16} />
                  </ToolbarButton>
                  <ToolbarButton 
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} 
                    isActive={editor.isActive("heading", { level: 3 })}
                    title="Heading 3"
                  >
                    <Heading3 size={16} />
                  </ToolbarButton>

                  <div className="w-px h-6 bg-white/10 mx-1" />
                  <ToolbarButton 
                    onClick={() => editor.chain().focus().toggleBold().run()} 
                    isActive={editor.isActive("bold")}
                    title="Bold"
                  >
                    <Bold size={16} />
                  </ToolbarButton>
                  <ToolbarButton 
                    onClick={() => editor.chain().focus().toggleItalic().run()} 
                    isActive={editor.isActive("italic")}
                    title="Italic"
                  >
                    <Italic size={16} />
                  </ToolbarButton>
                  <ToolbarButton 
                    onClick={() => editor.chain().focus().toggleUnderline().run()} 
                    isActive={editor.isActive("underline")}
                    title="Underline"
                  >
                    <UnderlineIcon size={16} />
                  </ToolbarButton>
                  <ToolbarButton 
                    onClick={() => editor.chain().focus().toggleStrike().run()} 
                    isActive={editor.isActive("strike")}
                    title="Strikethrough"
                  >
                    <Strikethrough size={16} />
                  </ToolbarButton>

                  <div className="w-px h-6 bg-white/10 mx-1" />
                  <ToolbarButton 
                    onClick={() => editor.chain().focus().toggleBulletList().run()} 
                    isActive={editor.isActive("bulletList")}
                    title="Bullet List"
                  >
                    <List size={16} />
                  </ToolbarButton>
                  <ToolbarButton 
                    onClick={() => editor.chain().focus().toggleOrderedList().run()} 
                    isActive={editor.isActive("orderedList")}
                    title="Ordered List"
                  >
                    <ListOrdered size={16} />
                  </ToolbarButton>

                  <div className="w-px h-6 bg-white/10 mx-1" />

                  <ToolbarButton 
                    onClick={() => editor.chain().focus().toggleBlockquote().run()} 
                    isActive={editor.isActive("blockquote")}
                    title="Blockquote"
                  >
                    <Quote size={16} />
                  </ToolbarButton>
                  <ToolbarButton 
                    onClick={() => editor.chain().focus().setHorizontalRule().run()} 
                    title="Horizontal Rule"
                  >
                    <Minus size={16} />
                  </ToolbarButton>
                  <ToolbarButton 
                    onClick={setLink} 
                    isActive={editor.isActive("link")}
                    title="Insert Link"
                  >
                    <LinkIcon size={16} />
                  </ToolbarButton>

                  <div className="w-px h-6 bg-white/10 mx-1" />

                  <ToolbarButton 
                    onClick={() => editor.chain().focus().undo().run()} 
                    title="Undo"
                  >
                    <Undo2 size={16} />
                  </ToolbarButton>
                  <ToolbarButton 
                    onClick={() => editor.chain().focus().redo().run()} 
                    title="Redo"
                  >
                    <Redo2 size={16} />
                  </ToolbarButton>
                </div>
              )}

              <div className="bg-card-bg/30 border border-white/5 border-t-0 rounded-b-2xl overflow-hidden">
                <EditorContent editor={editor} />
              </div>
            </div>
          </form>
      </div>
    </div>
      <style jsx global>{`
        .tiptap {
          min-height: 400px;
          padding: 24px;
          color: #cbd5e1;
          line-height: 1.8;
          font-size: 16px;
        }
        .tiptap:focus {
          outline: none;
        }
        .tiptap h1 { font-size: 2.25rem; font-weight: 900; color: #fff; margin: 1.5rem 0 1rem; letter-spacing: -0.02em; }
        .tiptap h2 { font-size: 1.75rem; font-weight: 800; color: #fff; margin: 1.25rem 0 0.75rem; letter-spacing: -0.01em; }
        .tiptap h3 { font-size: 1.375rem; font-weight: 700; color: #e2e8f0; margin: 1rem 0 0.5rem; }
        .tiptap p { margin-bottom: 1rem; }
        .tiptap ul { 
          list-style-type: disc; 
          padding-left: 1.5rem; 
          margin-bottom: 1rem; 
        }
        .tiptap ol { 
          list-style-type: decimal; 
          padding-left: 1.5rem; 
          margin-bottom: 1rem; 
        }
        .tiptap li { 
          margin-bottom: 0.25rem; 
        }
        .tiptap li::marker {
          color: #3b82f6;
          font-weight: bold;
        }
        .tiptap blockquote { 
          border-left: 4px solid #3b82f6; 
          padding-left: 1.5rem; 
          font-style: italic; 
          color: #e2e8f0; 
          margin: 1.5rem 0;
        }
        .tiptap hr { border-color: rgba(255,255,255,0.05); margin: 2rem 0; }
        .tiptap a { color: #3b82f6; text-decoration: underline; text-underline-offset: 4px; }
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: rgba(255,255,255,0.1);
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  );
}
