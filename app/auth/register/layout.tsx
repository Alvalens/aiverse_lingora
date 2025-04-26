import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daftar",
  description:
    "Bergabunglah dengan kami untuk memulai perjalanan wawancara dan analisis CV Anda."
}

export default function Layout({children}: {children: React.ReactNode}) {
  return (
    <section>
      {children}
    </section>
  );
}