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

          <div className="mt-8 flex flex-col items-center">
            <p>DONE BY:</p>
            <h1 className="flex gap-2 font-bold text-xl">
              <span>23/305/01/F/0112,</span> 
              <span>23/305/01/F/0153,</span> 
              <span>20/69/0036 &</span> 
              <span>20/69/0071</span>
            </h1>
          </div>
        </section>
      </main>
    </div>
  );
}
