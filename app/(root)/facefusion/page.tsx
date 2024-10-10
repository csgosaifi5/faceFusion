import Header from "@/components/shared/Header";
import LockableUI from "@/components/LockableUI";
import { auth } from "@clerk/nextjs";
import { getUserById } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";

const page = async () => {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const user = await getUserById(userId);

  return (
    <>
      <Header title={"FaceFusion"} subtitle={"Use Different tools"} />

      {/* <section className="mt-10">
      <TransformationForm 
        action="Add"
        userId={user._id}
        type={transformation.type as TransformationTypeKey}
        creditBalance={user.creditBalance}
      />
    </section> */}
      <section className="mt-10">
        <LockableUI user={user} />
      </section>
    </>
  );
};

export default page;
