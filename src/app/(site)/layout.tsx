import Footer from "@/design/Footer";
import Header from "@/design/Header";

/** Every page except the guide flow gets the full site chrome. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
