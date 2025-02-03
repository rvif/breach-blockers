export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Terms of Service
      </h1>

      <div className="prose dark:prose-invert max-w-none space-y-6">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
          <p className="text-gray-600 dark:text-gray-300">
            By accessing and using Br3achBl0ckers, you agree to be bound by
            these Terms of Service. If you do not agree to these terms, please
            do not use our platform.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. Use License</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Permission is granted to temporarily access the materials on
            Br3achBl0ckers's website for personal, non-commercial transitory
            viewing only.
          </p>
          <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose</li>
            <li>Attempt to decompile or reverse engineer any software</li>
            <li>Remove any copyright or proprietary notations</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. Disclaimer</h2>
          <p className="text-gray-600 dark:text-gray-300">
            The materials on Br3achBl0ckers's website are provided on an 'as is'
            basis. Br3achBl0ckers makes no warranties, expressed or implied, and
            hereby disclaims and negates all other warranties including, without
            limitation, implied warranties or conditions of merchantability,
            fitness for a particular purpose, or non-infringement of
            intellectual property or other violation of rights.
          </p>
        </section>
      </div>
    </div>
  );
}
