import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <main>
        <section className="flex flex-col items-center justify-center h-screen">
          <Image src="/images/mapoly-logo.webp" alt="Logo" width={300} height={300} className="pb-4" />
          <h1 className="text-4xl font-bold">Clearance Form System</h1>
          <p className="text-lg">Get your clearance form online and print it out without hassle or stress</p>
          <Link href="/get-form" className="mt-4 px-4 py-2 bg-green-700 font-bold text-white rounded">Get Started</Link>
        </section>
      </main>
    </div>
  );
}
