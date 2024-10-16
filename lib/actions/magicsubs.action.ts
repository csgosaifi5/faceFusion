"use server";

import { auth } from "@clerk/nextjs/server";
import MsProject from "../database/models/magicsubsProject.model";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";

export const addProject = async (projectData: createProjectParams) => {
  try {
    console.log(projectData);
    
    await connectToDatabase();

    const project = await MsProject.create(projectData);
    revalidatePath("/magicsubs");
    return JSON.parse(JSON.stringify(project));
  } catch (error) {
    handleError(error);
  }
};

export const fetchUserProjects = async (user_id: string) => {
  try {
    
    await connectToDatabase();

    const projects = await MsProject.find({ user_id: user_id });

    return JSON.parse(JSON.stringify(projects));
  } catch (error) {
    handleError(error);
  }
};
export const fetchSingleProjects = async (id: string) => {
  try {
    
    await connectToDatabase();

    const SingleProject = await MsProject.findById(id);

    return JSON.parse(JSON.stringify(SingleProject));
  } catch (error) {
    handleError(error);
  }
};

export const editProject = async (user_id: string, id: string, title: string, description: string) => {
  try {
    await connectToDatabase();

    const ProjectToUpdate = await MsProject.findById(id);

    if (!ProjectToUpdate) {
      throw new Error("Unauthorized or project not found");
    }

    const updatedProject = await MsProject.findByIdAndUpdate(
      id,
      { title: title, description: description },
      { new: true }
    );
    revalidatePath("/magicsubs");
    return JSON.parse(JSON.stringify(updatedProject));
  } catch (error) {
    handleError(error);
  }
};

export const deleteProject = async (id: string) => {
  try {
    await connectToDatabase();

    await MsProject.findByIdAndDelete(id);
  } catch (error) {
    handleError(error);
  } finally {
    redirect("/magicsubs");
  }
};

export const handleTranscription = async (id: string, download_url: string, obj_key: string, transcription: string) => {
  try {
    const { userId } = auth();
    if (!userId) {
      redirect("/sign-in");
    }

    await connectToDatabase();
    const ProjectToUpdate = await MsProject.findById(id);

    // if (!ProjectToUpdate || ProjectToUpdate.user_id !== userId) {
    if (!ProjectToUpdate) {
      throw new Error("Unauthorized or project not found");
    }

    const updatedProject = await MsProject.findByIdAndUpdate(
      id,
      {
        downloadUrl: download_url,
        objectKey: obj_key,
        transcription,
      },
      { new: true }
    );

    revalidatePath("/magicsubs");
    return JSON.parse(JSON.stringify(updatedProject));
  } catch (error) {
    handleError(error);
  }
};

export const updateProject = async (
  id: string,
  values: {
    transcription?: string;
    downloadUrl?: string;
  }
) => {
  try {
    const { userId } = auth();
    if (!userId) {
      redirect("/sign-in");
    }

    await connectToDatabase();
    const ProjectToUpdate = await MsProject.findById(id);

    if (!ProjectToUpdate) {
      throw new Error("Unauthorized or project not found");
    }

    const updatedProject = await MsProject.findByIdAndUpdate(
      id,
      {
        downloadUrl: values.downloadUrl,
        transcription: values.transcription,
      },
      { new: true }
    );

    revalidatePath(`/magicsubs/${id}`);
    return JSON.parse(JSON.stringify(updatedProject));
  } catch (error) {
    handleError(error);
  }
};
