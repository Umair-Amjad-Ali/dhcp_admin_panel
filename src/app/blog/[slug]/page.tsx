import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { adminDb } from "@/lib/firebase-admin";
import { format } from "date-fns";
import { ArrowLeft, Calendar, User, Clock, Share2 } from "lucide-react";
import Link from "next/link";
import "./../blog-content.css";

interface Props {
  params: { slug: string };
}

async function getBlogData(slug: string) {
  const snapshot = await adminDb
    .collection("blogs")
    .where("slug", "==", slug)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as any;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const blog = await getBlogData(params.slug);
  
  if (!blog) return { title: "Article Not Found" };

  return {
    title: `${blog.title} | Fixora Insights`,
    description: blog.metaDescription,
    openGraph: {
      title: blog.title,
      description: blog.metaDescription,
      type: "article",
      authors: [blog.author],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const blog = await getBlogData(params.slug);

  if (!blog) notFound();

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link 
            href="/blog" 
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-black uppercase tracking-widest"
          >
            <ArrowLeft size={16} />
            Back to Hub
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">Fixora Reader v1.0</span>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <article>
          <header className="mb-16">
            <div className="flex items-center gap-4 text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
              <span>Published by Expert</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500/20" />
              <span>5 min read</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.1] mb-8">
              {blog.title}
            </h1>

            <div className="flex flex-wrap items-center gap-8 py-8 border-y border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-black text-white text-xs">
                  {blog.author[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{blog.author}</p>
                  <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest leading-none mt-1">Author</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    {blog.createdAt?.toDate ? format(blog.createdAt.toDate(), "MMMM dd, yyyy") : "Recently"}
                  </p>
                  <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest leading-none mt-1">Date</p>
                </div>
              </div>
            </div>
          </header>

          <div 
            className="blog-content max-w-none"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </article>
        <div className="mt-20 pt-10 border-t border-white/5 flex justify-center">
          <Link 
            href="/blog"
            className="group flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
              <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-600 group-hover:text-white transition-colors">Return to Index</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
