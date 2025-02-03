import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md p-6 space-y-8 bg-white dark:bg-cyber-black border border-gray-200 dark:border-cyber-green rounded-lg">
        <div className="text-center space-y-4">
          {/* Cyberpunk Cat ASCII Art */}
          <pre className="font-mono text-cyber-green text-xs leading-tight whitespace-pre">
            {`
    /\\_____/\\
   /  o   o  \\
  ( ==  ^  == )
   )  =====  (
  (  ||||||| ) 
 (  |||||||  ) 
(__|||||||||)
    |___|___|   
    |>>|<<|     [ERR-404]
`}
          </pre>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            404
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <p className="text-sm text-cyber-green">
            Purr-mission Denied: This file has been shredded by the cyber
            kitten!
          </p>
        </div>

        <Link
          to="/"
          className="flex items-center justify-center text-gray-700 dark:text-cyber-green hover:text-cyber-green dark:hover:text-cyber-green/80 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
