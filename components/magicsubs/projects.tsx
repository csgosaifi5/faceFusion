"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { addProject, deleteProject, editProject } from "@/lib/actions/magicsubs.action";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

const Projects = ({ projects, user }: { projects: Project[], user: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const form1 = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const form2 = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  useEffect(() => {
    if (selectedProject) {
      form2.setValue("title", selectedProject.title);
      form2.setValue("description", selectedProject.description);
    }
  }, [selectedProject]);

  async function createProject(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      const projectData = {
        user_id: user._id,
        title:values.title,
        description: values.description
      };
      await addProject(projectData);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
      form1.reset();
    }
  }

  async function updateProject(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      const response = await editProject(
        user._id,
        selectedProject?._id as string,
        values.title,
        values.description
      );
      
      if (response) {
        setIsLoading(false);
        setIsEditing(false);
        setSelectedProject(null);
        form2.reset();
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false); 
    }
  }
  

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteProject(id);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="mt-10 max-w-7xl w-full mx-auto flex flex-col px-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
          <h1 className="text-2xl font-bold">Projects</h1>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Button
              onClick={() => setIsOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 rounded-full w-full sm:w-auto"
            >
              <PlusIcon className="size-5 mr-2" /> Add Project
            </Button>
            {/* <Link
              href="/dashboard/sample"
              className={cn(
                buttonVariants({
                  className: "rounded-full w-full sm:w-auto",
                  variant: "outline",
                })
              )}
            >
              Try Sample Video
            </Link> */}
          </div>
        </div>
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {projects.map((project:Project,index:number) => (
              <div
                key={index}
                className="rounded-lg shadow-lg overflow-hidden dark:border"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <Link
                      href={`/magicsubs/${project._id}`}
                      className="text-xl font-semibold"
                    >
                      {project.title}
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onSelect={() => {
                            setIsEditing(true);
                            setSelectedProject(project);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onSelect={() => handleDeleteProject(project._id)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {project.description}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Created{" "}
                    {formatDistanceToNow(new Date(project.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-10 text-center">
            <p className="text-gray-500 mb-4">
              No projects found. Create your first project to get started!
            </p>
            <Button
              onClick={() => setIsOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 rounded-full"
            >
              <PlusIcon className="size-5 mr-2" /> Create Project
            </Button>
          </div>
        )}
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Project</DialogTitle>
          </DialogHeader>
          <Form {...form1}>
            <form
              onSubmit={form1.handleSubmit(createProject)}
              className="space-y-4"
            >
              <FormField
                control={form1.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Project Title" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form1.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Project Description" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                {isLoading ? "Creating..." : "Create Project"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <Form {...form2}>
            <form
              onSubmit={form2.handleSubmit(updateProject)}
              className="space-y-4"
            >
              <FormField
                control={form2.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Project Title" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form2.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Project Description" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                {isLoading ? "Updating..." : "Update Project"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Projects;
