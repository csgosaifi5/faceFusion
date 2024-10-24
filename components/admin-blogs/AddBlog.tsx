"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import editorConfig from "@/lib/editorConfig";
import { Editor } from "@tinymce/tinymce-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import BlogHelpers from "@/lib/helpers/blogs.helpers";
import { useRouter } from "next/navigation";
import Link from "next/link";
const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  meta_title: z.string().min(2, "Meta title must be at least 2 characters"),
  meta_description: z.string().min(10, "Meta description must be at least 10 characters"),
  meta_keywords: z.string().min(2, "Meta keywords must be at least 2 characters"),
  image: z.any().optional(),
});
type editBlogData = {
  blogData?: any;
};
type FormValues = z.infer<typeof formSchema>;
const blogServ = new BlogHelpers();

const AddBlog = ({ blogData }: editBlogData) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: blogData?.title || "",
      description: blogData?.description || "",
      meta_title: blogData?.meta_title || "",
      meta_description: blogData?.meta_description || "",
      meta_keywords: blogData?.meta_keywords || "",
      image: undefined,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    let response;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("meta_title", data.meta_title);
    formData.append("meta_description", data.meta_description);
    formData.append("meta_keywords", data.meta_keywords);
    formData.append("image", data.image ? data.image : "");
    if (blogData) {
      formData.append("_id", blogData._id);
      response = await blogServ.editBlog(formData);
    } else {
      response = await blogServ.addBlog(formData, "blogs");
    }
    if (response.error) {
      setIsSubmitting(false);
      toast.error(response.error);
    } else if (response.data) {
      setIsSubmitting(false);
      toast.success(response.message);
      setTimeout(() => {
        router.push("/bloglist");
      }, 1500);
    }
  };

  return (
    <div className="container mx-auto p-2">
      <Card className="w-full mx-auto">
      <div className="flex items-center justify-between">
      <CardHeader>
          <h2 className="text-2xl font-bold text-center">Create Blog Post</h2>
        </CardHeader>
        <Link href="/bloglist">
          <Button className="me-4">Back</Button>
        </Link>
      </div>
       
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register("title")} placeholder="Enter blog post title" />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Editor
                    apiKey={process.env.NEXT_PUBLIC_TINYMCE_KEY}
                    value={field.value || ""}
                    onEditorChange={field.onChange}
                    init={{
                      height: 300,
                      menubar: false,
                      plugins: ["link", "lists", "code"],
                      toolbar:
                        "undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist | link | code",
                    }}
                  />
                )}
              />

              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="meta_title">Meta Title</Label>
              <Input id="meta_title" {...register("meta_title")} placeholder="Enter meta title" />
              {errors.meta_title && <p className="text-sm text-destructive">{errors.meta_title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="meta_description">Meta Description</Label>
              <Textarea
                id="meta_description"
                {...register("meta_description")}
                placeholder="Enter meta description"
                rows={2}
              />

              {errors.meta_description && <p className="text-sm text-destructive">{errors.meta_description.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="meta_keywords">Meta Keywords</Label>
              <Input
                id="meta_keywords"
                {...register("meta_keywords")}
                placeholder="Enter meta keywords (comma-separated)"
              />
              {errors.meta_keywords && <p className="text-sm text-destructive">{errors.meta_keywords.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setValue("image", e.target.files?.[0] || undefined)}
              />
              {(blogData?.image || watch("image")) && (
                <div className="mt-2 flex items-center space-x-2">
                  <Image
                    src={
                      watch("image")
                        ? URL.createObjectURL(watch("image") as File) // If a new image is uploaded, display it
                        : blogData.image // Otherwise, show the existing image from blogData
                    }
                    alt="Blog post image"
                    width={100}
                    height={100}
                    className="rounded-md object-cover"
                  />
                  <Trash2 className="text-destructive cursor-pointer" onClick={() => setValue("image", undefined)} />
                </div>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Blog Post"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AddBlog;
