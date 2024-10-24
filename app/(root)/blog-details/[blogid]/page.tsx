import React from "react";
import BlogDetail from "@/components/BlogDetails";
import { getBlogBySlug } from "@/lib/actions/blogs.actions";

export async function generateMetadata({ params }: any) {
  let result = await getBlogBySlug(params.blogid);

  if (result.meta_title && result.meta_keywords && result.meta_description) {
    return {
      title: result.meta_title,
      keywords: result.meta_keywords,
      description: result.meta_description,
    };
  }
}

const page = async ({ params }: any) => {
  let result = await getBlogBySlug(params.blogid);
  return <BlogDetail blogData={result} />;
};

export default page;
