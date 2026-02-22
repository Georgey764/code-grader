export default function Footer() {
  return (
    <footer className="bg-accent text-white py-10 px-6 mt-12">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <p className="font-bold text-secondary">
            The University of Louisiana Monroe
          </p>
          <p className="text-sm opacity-70 text-gray-300">
            700 University Ave, Monroe, LA 71209
          </p>
        </div>
        <p className="text-caption text-gray-400 italic">
          Developed & Maintained by The Devs
        </p>
      </div>
    </footer>
  );
}
