import Footer from "@/components/shared/Footer";
import MainHeader from "@/components/shared/MainHeader";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <MainHeader />
      <main style={{ flexGrow: 1 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
