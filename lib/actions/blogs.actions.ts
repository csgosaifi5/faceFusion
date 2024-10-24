"use server";

import Blog from "../database/models/blogs";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";

type search = {
  start?: number;
  perPage?: number;
};

// CREATE
// export async function fetchAllBlogs(search:search) {
//   try {
//     await connectToDatabase();
//     let result: any = null;
//    const {perPage,start}= search;
//     const whereClause: any = {}; // Adjust filters if needed

//     const orderBy: any = { createdAt: -1 }; // Sorting by createdAt in descending order

//     if (perPage && start !== undefined) {
//       result = await Blog.find(whereClause).skip(start).limit(perPage).sort(orderBy).exec();
//     } else {
//       result = await Blog.find(whereClause).sort(orderBy).exec();
//     }

//     const totalCount = await Blog.countDocuments(whereClause);

//     return JSON.parse(JSON.stringify({ blogsList: result, count: totalCount }));
//   } catch (error) {
//     handleError(error);
//   }
// }

// // READ
// export async function getUserById(userId: string) {
//   try {
//     await connectToDatabase();

//     const user = await User.findOne({ clerkId: userId });

//     if (!user) throw new Error("User not found");

//     return JSON.parse(JSON.stringify(user));
//   } catch (error) {
//     handleError(error);
//   }
// }

// // UPDATE
// export async function updateUser(clerkId: string, user: UpdateUserParams) {
//   try {
//     await connectToDatabase();

//     const updatedUser = await User.findOneAndUpdate({ clerkId }, user, {
//       new: true,
//     });

//     if (!updatedUser) throw new Error("User update failed");

//     return JSON.parse(JSON.stringify(updatedUser));
//   } catch (error) {
//     handleError(error);
//   }
// }

// // DELETE
// export async function deleteUser(clerkId: string) {
//   try {
//     await connectToDatabase();

//     // Find user to delete
//     const userToDelete = await User.findOne({ clerkId });

//     if (!userToDelete) {
//       throw new Error("User not found");
//     }

//     // Delete user
//     const deletedUser = await User.findByIdAndDelete(userToDelete._id);
//     revalidatePath("/");

//     return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
//   } catch (error) {
//     handleError(error);
//   }
// }

export async function getBlogBySlug(slug: string) {
  try {
    await connectToDatabase();

    let result;
    if (slug) {
      // Use Mongoose's findOne method to fetch the blog by its slug
      result = await Blog.findOne({ slug: slug });
    }

    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    handleError(error);
  }
}
export async function fetchAllBlogs(search:search) {
  try {
    const {start,perPage} = search 
    let result: any = null;

    const whereClause: any = {}; // Adjust filters if needed

    const orderBy: any = { createdAt: -1 }; // Sorting by createdAt in descending order

    if (perPage && start !== undefined) {
      result = await Blog.find(whereClause).skip(start).limit(perPage).sort(orderBy).exec();
    } else {
      result = await Blog.find(whereClause).sort(orderBy).exec();
    }

    const totalCount = await Blog.countDocuments(whereClause); // MongoDB equivalent of `findAndCountAll`

    return JSON.parse(JSON.stringify({ blogs: result, count: totalCount }));
  } catch (error) {
    handleError(error);
  }
}
