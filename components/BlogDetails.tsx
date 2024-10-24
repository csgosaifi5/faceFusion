import Image from "next/image";
import { CalendarDays, Eye } from "lucide-react";

interface BlogDetailProps {
  blogData: SingleBlog;
}

export default function BlogDetail({ blogData }: BlogDetailProps) {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">{blogData.title}</h1>
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <CalendarDays className="w-4 h-4 mr-2" />
        <span className="mr-4">{new Date(blogData.createdAt).toLocaleDateString()}</span>
        {/* <span className="mr-4">By Demongo</span>
        <Eye className="w-4 h-4 mr-2" />
        <span>5k</span> */}
      </div>
      {blogData.image && (
        <Image
          src={blogData.image}
          alt="Featured image"
          width={800}
          height={400}
          className="w-full h-auto mb-6 rounded-lg"
        />
      )}

      <div className="prose max-w-none">
        <div dangerouslySetInnerHTML={{ __html: blogData.description }} />
      </div>
    </div>
  );
}
