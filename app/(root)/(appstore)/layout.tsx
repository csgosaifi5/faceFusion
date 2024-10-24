import MobileNav from "@/components/shared/MobileNav";
import Sidebar from "@/components/shared/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import { SignedIn, auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { getUserById } from "@/lib/actions/user.actions";
const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_ID;
const ADMIN_CLERK_ID = process.env.NEXT_PUBLIC_ADMIN_CLERK_ID;
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const { userId } = auth();

  if (!userId) redirect("/sign-in");

  const user = await getUserById(userId);

  let isBlogListAvailable = false;
  if (user._id === ADMIN_ID && user.clerkId === ADMIN_CLERK_ID && user.email === ADMIN_EMAIL) {
    isBlogListAvailable = true;
  }

  return (
    <main className="root">
      <Sidebar adminBlogList={isBlogListAvailable} />
      <MobileNav />

      <div className="root-container">
        <div className="wrapper">{children}</div>
      </div>

      <Toaster toastOptions={{ duration: 3000 }} position="top-right" richColors />
    </main>
  );
};

export default Layout;
