import { NextResponse } from "next/server";
import Blog from "@/lib/database/models/blogs"; // Assuming the mongoose model we created earlier
import { writeFileSync } from "fs";
import { join } from "path";
import { connectToDatabase } from "@/lib/database/mongoose";
const image_path = process.env.NEXT_PUBLIC_IMAGE_DESTINATION || "";
const upload_path = process.env.NEXT_PUBLIC_UPLOAD_PATH || "";

export const PATCH = async (request: Request) => {
  try {
    const { start, perPage } = await request.json();
    let result: any = null;

    const whereClause: any = {}; // Adjust filters if needed

    const orderBy: any = { createdAt: -1 }; // Sorting by createdAt in descending order

    if (perPage && start !== undefined) {
      result = await Blog.find(whereClause)
        .skip(start)
        .limit(perPage)
        .sort(orderBy)
        .exec();
    } else {
      result = await Blog.find(whereClause).sort(orderBy).exec();
    }

    const totalCount = await Blog.countDocuments(whereClause); // MongoDB equivalent of `findAndCountAll`

    return new NextResponse(JSON.stringify({ blogs:result, count: totalCount }), { status: 200 });
  } catch (error) {
    console.error("Error in PATCH:", error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};

export const POST = async (request: Request) => {
  try {
    let blogData: any = {};
    const data = await request.formData();
    blogData = {
      title: data.get("title"),
      description: data.get("description"),
      meta_title: data.get("meta_title"),
      meta_description: data.get("meta_description"),
      meta_keywords: data.get("meta_keywords"),
    };

    const image: File | null = data.get("image") as unknown as File;

    if (image) {
      const byteArray = await image.arrayBuffer();
      const buffer = Buffer.from(byteArray); // Create a buffer from arrayBuffer
      const uint8Array = new Uint8Array(buffer); // Convert Buffer to Uint8Array
    
      const final_path = join(upload_path, image_path, image.name);
      writeFileSync(final_path, uint8Array); // Use uint8Array instead of buffer
      const final_url = image_path + image.name;
      blogData.image = final_url;
    }

    let slug = blogData.title.toLowerCase().replace(/\s+/g, "-");
    slug = slug.replace(/<[^>]*>/g, "-").replace(/[,.:;!?()]/g, "-");

    let dbSlug = await Blog.findOne({ slug });
    while (dbSlug) {
      const randomString = Math.random().toString(36).substring(2, 5);
      slug += `-${randomString}`;
      dbSlug = await Blog.findOne({ slug });
    }

    blogData.slug = slug;
    await connectToDatabase();
    const newBlog = await Blog.create(blogData);
    return new NextResponse(JSON.stringify({ data: newBlog, message: "Blog Created Successfully" }), { status: 200 });
  } catch (error) {
    console.error("Error in POST:", error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};

export const PUT = async (request: Request) => {
  try {
    let blogData: any = {};
    const data = await request.formData();
    blogData = {
      _id: data.get("_id"),
      title: data.get("title"),
      description: data.get("description"),
      meta_title: data.get("meta_title"),
      meta_description: data.get("meta_description"),
      meta_keywords: data.get("meta_keywords"),
    };

    const image: File | null = data.get("image") as unknown as File;

    if (image && typeof image !== "string") {
      const byteArray = await image.arrayBuffer();
      const buffer = Buffer.from(byteArray); // Create a buffer from arrayBuffer
      const uint8Array = new Uint8Array(buffer); // Convert Buffer to Uint8Array
    
      const final_path = join(upload_path, image_path, image.name);
      writeFileSync(final_path, uint8Array); // Use uint8Array instead of buffer
      const final_url = image_path + image.name;
      blogData.image = final_url;
    }

    const dbBlog: any = await Blog.findById(blogData._id);
    let slug = dbBlog.slug;

    if (blogData.title !== dbBlog.title) {
      slug = blogData.title.toLowerCase().replace(/\s+/g, "-");
      slug = slug.replace(/<[^>]*>/g, "-").replace(/[,.:;!?()]/g, "-");

      let dbSlug = await Blog.findOne({ slug });
      while (dbSlug) {
        const randomString = Math.random().toString(36).substring(2, 5);
        slug += `-${randomString}`;
        dbSlug = await Blog.findOne({ slug });
      }
    }

    blogData.slug = slug;

    const result = await Blog.findByIdAndUpdate(blogData._id, blogData, { new: true });

    return new NextResponse(JSON.stringify({ data: result, message: "Blog Updated Successfully" }), { status: 200 });
  } catch (error) {
    console.error("Error in PUT:", error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};
