"use client";
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import BlogHelpers from "@/lib/helpers/blogs.helpers";
import { Pencil, Trash } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

const blogServ = new BlogHelpers();

function BlogsList() {
  const [blogsList, setBlogsList] = useState([]);
  const [blogsCount, setBlogsCount] = useState(0);
  const [search, setSearch] = useState({
    start: 0,
    perPage: 3,
  });

  const getBlogsList = async (search: any) => {
    let result = await blogServ.fetchAllBlogs(search);

    if (result && result.blogs) {
      setBlogsList(result.blogs);
      setBlogsCount(result.count);
    }
  };

  useEffect(() => {
    getBlogsList(search);
  }, [search]);

  const handlePageNext = () => {
    if (search.start + search.perPage < blogsCount) {
      setSearch({ ...search, start: search.start + search.perPage });
    }
  };

  const handlePagePrevious = () => {
    if (search.start > 0) {
      setSearch({ ...search, start: search.start - search.perPage });
    }
  };
  const handleDeleteBlog = async (id: string) => {
    if (id) {
      let result = await blogServ.deleteBlog(id);
      getBlogsList(search);
    }
  };
  const totalPages = useMemo(() => Math.ceil(blogsCount / search.perPage), [blogsCount, search.perPage]);
  const currentPage = useMemo(() => Math.floor(search.start / search.perPage) + 1, [search.start, search.perPage]);

  // Calculate pagination numbers (up to 3)
  const paginationNumbers = useMemo(() => {
    const pages = [];
    const startPage = Math.max(1, currentPage - 1); // Ensure we start from at least page 1
    const endPage = Math.min(totalPages, startPage + 2); // Ensure we don't exceed total pages

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  const tableRows = useMemo(() => {
    return blogsList.map((blog: any, index) => (
      <TableRow key={index}>
        <TableCell className="font-medium">{blog.title}</TableCell>
        <TableCell className="text-right">{new Date(blog.createdAt).toLocaleDateString()}</TableCell>
        <TableCell className="text-right">
          <div className="d-flex gap-3 align-items-center">
            <Link href={`/addblog/${blog.slug}`}>
              <Button variant="ghost" className="text-success">
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="text-danger">
                  <Trash className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to delete this blog?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the blog.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex justify-end space-x-2">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDeleteBlog(blog._id)}>Delete</AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </TableCell>
      </TableRow>
    ));
  }, [blogsList]);

  return (
    <Card>
      <div className="flex items-center justify-between">
        <CardHeader>
          <CardTitle>All Blogs</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <Link href="/addblog">
          <Button className="me-4">Add New Blog</Button>
        </Link>
      </div>
      <CardContent>
        {blogsList.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[350px]">Title</TableHead>
                <TableHead className="text-right">Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{tableRows}</TableBody>
          </Table>
        ) : (
          <div className="flex flex-col space-y-3 w-full h-full">
            <Skeleton className="h-[125px] w-full rounded-xl" />
            <div className="space-y-2 w-full">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                style={{ cursor: search.start === 0 ? "not-allowed" : "pointer" }}
                onClick={handlePagePrevious}
              />
            </PaginationItem>
            {paginationNumbers.map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  style={{ cursor: "pointer" }}
                  onClick={() => setSearch({ ...search, start: (page - 1) * search.perPage })}
                  className={currentPage === page ? "font-bold" : ""}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                style={{ cursor: search.start + search.perPage >= blogsCount ? "not-allowed" : "pointer" }}
                onClick={handlePageNext}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardFooter>
    </Card>
  );
}

export default BlogsList;
