import React from "react";
import AddBlog from "@/components/admin-blogs/AddBlog";
import { getBlogBySlug } from "@/lib/actions/blogs.actions";



const page = async({ params }: any) => {
  let result = await getBlogBySlug(params.blog_id);
  return (
    <>
      <AddBlog blogData={result} />
    </>
  );
};

export default page;
