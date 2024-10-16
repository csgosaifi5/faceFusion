import Projects from '@/components/magicsubs/projects'
import React from 'react'
import { auth } from "@clerk/nextjs";
import { getUserById } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import { fetchUserProjects } from '@/lib/actions/magicsubs.action';


const projects:any=[]
const MagicSubs = async() => {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");
  const user = await getUserById(userId);

  const projects:[]=await fetchUserProjects(user._id)

  return (
    <Projects projects={projects} user={user}/>
  )
}

export default MagicSubs