export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Privacy Policy
      </h1>

      <div className="prose dark:prose-invert max-w-none space-y-6">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
          <p className="text-gray-600 dark:text-gray-300">
            We collect information that you provide directly to us, including:
          </p>
          <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300">
            <li>Account information (name, email, password)</li>
            <li>Profile information</li>
            <li>Content you submit</li>
            <li>Communications with us</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            2. How We Use Your Information
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300">
            <li>Provide and maintain our services</li>
            <li>Process your transactions</li>
            <li>Send you technical notices and support messages</li>
            <li>Communicate with you about products, services, and events</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. Data Security</h2>
          <p className="text-gray-600 dark:text-gray-300">
            We take reasonable measures to help protect information about you
            from loss, theft, misuse and unauthorized access, disclosure,
            alteration and destruction.
          </p>
        </section>
      </div>
    </div>
  );
}
