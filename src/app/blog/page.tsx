"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  collection, 
  query, 
  orderBy, 
  getDocs 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ArrowRight, Calendar, User, BookOpen, Clock } from "lucide-react";

export default function BlogIndexPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const blogData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBlogs(blogData);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-1/4 w-[1000px] h-[1000px] bg-blue-600/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 -right-1/4 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[140px]" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-32">
        <div className="max-w-3xl mb-20 md:mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
              Insights & Resources
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-8">
              Expertise in <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-indigo-500 to-purple-600">
                System Logic.
              </span>
            </h1>
            <p className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed max-w-2xl">
              Exploring the intersection of modern technology, professional maintenance, and system optimization. Our latest thinking, delivered to you.
            </p>
          </motion.div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[400px] bg-white/5 animate-pulse rounded-[2.5rem] border border-white/5" />
            ))}
          </div>
        ) : blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {blogs.map((blog, index) => (
              <motion.article
                key={blog.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group flex flex-col"
              >
                <Link href={`/blog/${blog.slug}`} className="flex-1 flex flex-col">
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-4 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                      <span className="flex items-center gap-2">
                        <Calendar size={12} className="text-blue-500" />
                        {blog.createdAt?.toDate ? format(blog.createdAt.toDate(), "MMM dd, yyyy") : "Recent"}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-800" />
                      <span className="flex items-center gap-2">
                        <Clock size={12} className="text-blue-500" />
                        5 min read
                      </span>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-black text-white group-hover:text-blue-400 transition-colors duration-300 leading-tight">
                      {blog.title}
                    </h2>

                    <p className="text-slate-500 font-medium line-clamp-3 text-sm leading-relaxed">
                      {blog.metaDescription}
                    </p>
                  </div>

                  <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-black text-white text-[10px]">
                        {blog.author[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{blog.author}</p>
                        <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Specialist</p>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border border-dashed border-white/10 rounded-[3rem]">
            <BookOpen className="mx-auto text-slate-800 mb-6" size={48} />
            <h3 className="text-2xl font-bold mb-2">The library is quiet.</h3>
            <p className="text-slate-500">Check back soon for our latest publications.</p>
          </div>
        )}
      </main>

      <footer className="relative z-10 py-20 border-t border-white/5 bg-black/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-xl">F</div>
            <div>
              <span className="block font-black text-xl tracking-tight">Fixora.</span>
              <span className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em]">Premium Logistics</span>
            </div>
          </div>
          <p className="text-slate-600 text-xs font-medium uppercase tracking-widest">
            &copy; 2026 Fixora Admin Core. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
