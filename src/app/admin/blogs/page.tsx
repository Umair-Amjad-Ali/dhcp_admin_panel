"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Eye, 
  Calendar, 
  User, 
  ArrowRight,
  BookOpen,
  Filter
} from "lucide-react";
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function BlogsPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const blogData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBlogs(blogData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this article?")) {
      try {
        await deleteDoc(doc(db, "blogs", id));
        toast.success("Article deleted successfully");
      } catch (error) {
        toast.error("Failed to delete article");
      }
    }
  };

  const filteredBlogs = blogs.filter(blog => 
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Content Hub</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Manage and publish your SEO articles.</p>
        </div>
        <Button 
          onClick={() => router.push("/admin/blogs/new")}
          className="bg-brand hover:bg-brand/90 text-white rounded-2xl h-12 px-6 gap-2 font-bold transition-all active:scale-95"
        >
          <Plus size={20} />
          Write Article
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-card-bg/50 border border-border-subtle p-2 rounded-[2rem]">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text"
            placeholder="Search articles or authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none focus:ring-0 pl-12 pr-4 py-3 text-sm text-white font-medium placeholder:text-slate-600"
          />
        </div>
        <div className="flex items-center gap-2 pr-2">
          <Badge variant="outline" className="bg-white/5 border-white/10 text-slate-400 py-2 px-4 rounded-xl">
            {filteredBlogs.length} Articles
          </Badge>
        </div>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-white/5 animate-pulse rounded-[2rem] border border-white/5" />
          ))}
        </div>
      ) : filteredBlogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredBlogs.map((blog) => (
              <motion.div
                key={blog.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="group bg-card-bg border-border-subtle overflow-hidden rounded-[2rem] hover:border-brand/30 transition-all duration-500 flex flex-col h-full">
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-brand/10 text-brand border-brand/20 font-black text-[10px] uppercase tracking-widest py-1 px-3">
                        Published
                      </Badge>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => router.push(`/admin/blogs/edit/${blog.id}`)}
                          className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(blog.id)}
                          className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-white leading-tight mb-3 group-hover:text-brand transition-colors line-clamp-2">
                      {blog.title}
                    </h3>
                    
                    <p className="text-slate-500 text-sm line-clamp-3 mb-6 flex-1">
                      {blog.metaDescription}
                    </p>

                    <div className="pt-6 border-t border-white/5 flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-brand to-brand/80 flex items-center justify-center text-white font-black text-[10px]">
                          {blog.author[0].toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-white leading-tight">{blog.author}</span>
                          <span className="text-[9px] text-slate-600 font-medium">Author</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          {blog.createdAt?.toDate ? format(blog.createdAt.toDate(), "MMM dd, yyyy") : "Recent"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
            <BookOpen className="text-slate-700" size={32} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No articles found</h2>
          <p className="text-slate-500 max-w-xs mx-auto text-sm leading-relaxed">
            Your content hub is empty. Start writing articles to boost your SEO and engage users.
          </p>
          <Button 
            onClick={() => router.push("/admin/blogs/new")}
            className="mt-8 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl"
          >
            Create first article
          </Button>
        </div>
      )}

    </div>
  );
}
