import Header from '@/components/shared/Header'
import LockableUI from '@/components/LockableUI'

const page = () => {
  return (
    <>
    <Header 
      title={"FaceFusion"}
      subtitle={"Use Different tools"}
    />
  
    {/* <section className="mt-10">
      <TransformationForm 
        action="Add"
        userId={user._id}
        type={transformation.type as TransformationTypeKey}
        creditBalance={user.creditBalance}
      />
    </section> */}
    <section className="mt-10">
    <LockableUI/>
    </section>
   
  </>
  )
}

export default page