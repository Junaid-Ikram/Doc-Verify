export default function Footer() {
    const currentYear = new Date().getFullYear();
    
    return (
      <footer className="bg-white shadow-md mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="flex items-center">
              <span className="font-bold text-blue-600">DocVerify</span>
              <span className="ml-2 text-sm text-gray-500">
                &copy; {currentYear} Document Verification DApp
              </span>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-sm text-gray-500">
                Powered by Ethereum Sepolia & Next.js
              </p>
            </div>
          </div>
        </div>
      </footer>
    );
  }