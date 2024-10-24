import mongoose, { Schema, model, Document, models } from "mongoose";

// Define an interface for the Blog document
interface IBlog extends Document {
  title: string;
  description: string;
  image?: string;
  meta_description: string;
  meta_keywords: string;
  meta_title: string;
  slug: string;
}

// Define the schema for the Blog model
const BlogSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    meta_description: {
      type: String,
      required: true,
    },
    meta_keywords: {
      type: String,
      required: true,
    },
    meta_title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Create and export the model
const Blog = models?.Blog || model<IBlog>("Blog", BlogSchema);

export default Blog;
