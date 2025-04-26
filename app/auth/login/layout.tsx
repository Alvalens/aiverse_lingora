import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Masuk",
  description:
    "Masuk ke akun Anda untuk mengakses fitur wawancara dan analisis CV kami."
}

export default function Layout({children}: {children: React.ReactNode}) {
  return (
    <section>
      {children}
    </section>
  );
}