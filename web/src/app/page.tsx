export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-16">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Meet. Talk. Record. <span className="text-indigo-400">SYNQ</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 mb-8">
          SYNQ is your all-in-one video calling app — fast, reliable, and
          designed for creators and teams who care about quality.
        </p>

        <a
          href="#"
          className="inline-block bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition"
        >
          Download the App
        </a>
      </div>

      <div className="mt-16 w-full max-w-4xl rounded-xl overflow-hidden shadow-xl border border-gray-800">
        <img
          src="/images/app-preview.png"
          alt="SYNQ App Preview"
          className="w-full object-cover"
        />
      </div>
    </main>
  );
}
