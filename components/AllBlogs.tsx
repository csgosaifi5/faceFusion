"use client";
import Link from "next/link";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { CalendarDays, User, MessageCircle } from "lucide-react";
import BlogHelpers from "@/lib/helpers/blogs.helpers";

const blogServ = new BlogHelpers();

const AllBlogs = ({ blogs, count }: AllBlogsProps) => {
  const [blogsList, setBlogsList] = useState(blogs);
  const [blogsCount, setBlogsCount] = useState(count);
  const [search, setSearch] = useState({
    start: 0,
    perPage: 2,
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
  return (
    <>
      <div className="container mx-auto px-8 pt-8">
        {blogsList.map((blog, index) => (
          <article key={index} className="mb-12 bg-white rounded-lg shadow-md overflow-hidden">
            {blog.image && (
              <div className="relative h-64 md:h-96">
                <Image
                  src={blog.image}
                  alt={blog.title}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-300 hover:scale-105"
                />
              </div>
            )}

            <div className="p-6">
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <CalendarDays className="h-4 w-4 mr-2" />
                <span>{new Date(blog.createdAt).toLocaleDateString()}</span>

                {/* <User className="h-4 w-4 ml-4 mr-2" />
                <span>
                  By{" "}
                  <Link href="#" className="text-blue-600 hover:underline">
                    {blog.author}
                  </Link>
                </span> */}

                {/* <MessageCircle className="h-4 w-4 ml-4 mr-2" />
                <Link href="#" className="text-blue-600 hover:underline">
                  {blog.comments}
                </Link> */}
              </div>
              <h2 className="text-2xl font-bold mb-4">
                <Link href={`/blog-details/${blog.slug}`} className="text-gray-900 hover:text-blue-600 transition-colors duration-300">
                  {blog.title}
                </Link>
              </h2>
              {/* <p className="text-gray-600 mb-4">{blog.description}</p> */}
              <Link href={`/blog-details/${blog.slug}`} className="inline-block text-blue-600 font-semibold hover:underline">
                READ MORE
              </Link>
            </div>
          </article>
        ))}
      </div>

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
    </>
  );
};

export default AllBlogs;
