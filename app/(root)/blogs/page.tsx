import React from "react";
import Link from "next/link";
import AllBlogs from "@/components/AllBlogs";

import { fetchAllBlogs } from "@/lib/actions/blogs.actions";

const page = async() => {
  let blogsList = [];
  let blogsCount = null;
  let search = {
    start: 0,
    perPage: 3,
  };
  
  let result = await fetchAllBlogs(search);

  if (result && result.blogs) {
    blogsList = result.blogs;
    blogsCount = result.count;
  }
  return (
    <div className="content-area">
      <div className="container max-w900">
        <AllBlogs blogs={blogsList} count={blogsCount}/>
        
      </div>
    </div>
  );
};

export default page;
