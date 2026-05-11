"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import BlogEditor from "../../BlogEditor";
import { Loader2 } from "lucide-react";

export default function EditBlogPage() {
  const { id } = useParams();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlog() {
      if (!id) return;
      try {
        const docRef = doc(db, "blogs", id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBlog({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col p-6 md:p-12 space-y-12">
        {/* Header Shimmer */}
        <div className="flex justify-between items-center animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/5 rounded-xl" />
            <div className="space-y-2">
              <div className="w-40 h-6 bg-white/5 rounded-lg" />
              <div className="w-24 h-3 bg-white/5 rounded-md" />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-24 h-12 bg-white/5 rounded-xl" />
            <div className="w-32 h-12 bg-white/5 rounded-xl" />
          </div>
        </div>

        {/* Content Shimmer */}
        <div className="max-w-4xl space-y-12 animate-pulse">
          <div className="space-y-4">
            <div className="w-32 h-4 bg-white/5 rounded" />
            <div className="w-full h-16 bg-white/5 rounded-2xl" />
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="h-20 bg-white/5 rounded-2xl" />
            <div className="h-20 bg-white/5 rounded-2xl" />
          </div>
          <div className="space-y-4">
            <div className="w-full h-96 bg-white/5 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
        Article not found
      </div>
    );
  }

  return <BlogEditor blog={blog} />;
}
