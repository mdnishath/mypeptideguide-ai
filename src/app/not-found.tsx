import Footer from "@/design/Footer";
import Header from "@/design/Header";
import { Button, Container, Display, Em, Eyebrow, Lede } from "@/design/primitives";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Container className="pt-20 pb-10">
          <Eyebrow>404</Eyebrow>
          <Display size="lg" className="mt-4">
            That page isn&rsquo;t <Em>in the record.</Em>
          </Display>
          <Lede className="mt-5">The link may be old, or the compound profile may still be in progress.</Lede>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/compounds" size="lg" arrow>
              Browse the library
            </Button>
            <Button href="/" variant="secondary" size="lg">
              Back home
            </Button>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
