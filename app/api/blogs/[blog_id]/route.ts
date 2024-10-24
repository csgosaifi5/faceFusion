import { NextResponse } from "next/server";
import Blog from "@/lib/database/models/blogs"; // Assuming the Mongoose model

// GET request to fetch a blog by blog_id
export const GET = async (request: Request) => {
  const blog_id = request.url.slice(request.url.lastIndexOf("/") + 1); // Extract blog_id from the URL

  try {
    let result;
    if (blog_id) {
      // Use Mongoose's findOne method to fetch the blog by its blog_id
      result = await Blog.findOne({ blog_id: blog_id });
    }
    return result
      ? new NextResponse(JSON.stringify(result), { status: 200 })
      : new NextResponse("Blog not found", { status: 404 });
  } catch (error) {
    console.error("Error in GET:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

// PUT request to fetch a blog by slug
export const PUT = async (request: Request) => {
  const slug = request.url.slice(request.url.lastIndexOf("/") + 1); // Extract slug from the URL

  try {
    let result;
    if (slug) {
      // Use Mongoose's findOne method to fetch the blog by its slug
      result = await Blog.findOne({ slug: slug });
    }
    return result
      ? new NextResponse(JSON.stringify(result), { status: 200 })
      : new NextResponse("Blog not found", { status: 404 });
  } catch (error) {
    console.error("Error in PUT:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

// DELETE request to delete a blog by blog_id
export const DELETE = async (request: Request) => {
  const blog_id = request.url.slice(request.url.lastIndexOf("/") + 1); // Extract blog_id from the URL

  try {
    let result;
    if (blog_id) {
      // Use Mongoose's deleteOne method to delete the blog by its blog_id
      result = await Blog.deleteOne({ _id: blog_id });
    }
    return result && result.deletedCount > 0
      ? new NextResponse(JSON.stringify({ message: "Blog Deleted Successfully" }), { status: 200 })
      : new NextResponse("Blog not found", { status: 404 });
  } catch (error) {
    console.error("Error in DELETE:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
