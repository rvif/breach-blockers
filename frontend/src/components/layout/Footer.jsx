export default function Footer() {
  return (
    <footer className="bg-white dark:bg-cyber-black border-t border-gray-200 dark:border-cyber-green mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} Br3achBl0ckers. All rights reserved.
          </div>

          <div className="flex space-x-6 mt-4 md:mt-0">
            <a
              href="/privacy"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-cyber-green transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-cyber-green transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="/contact"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-cyber-green transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
