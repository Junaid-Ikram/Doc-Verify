import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useWeb3 } from '../context/Web3Context';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { account, isConnected, connectWallet, network, error } = useWeb3();
  const router = useRouter();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Upload Document', href: '/upload' },
    { name: 'Verify Document', href: '/verify' },
    { name: 'My Documents', href: '/my-documents' },
    { name: 'Share Documents', href: '/share-document' },
    { name: 'Transfer Ownership', href: '/transfer-ownership' },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Format account address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <span className="font-bold text-xl text-blue-600 cursor-pointer">DocVerify</span>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navigation.map((item) => (
                  <Link href={item.href} key={item.name}>
                    <span
                      className={`${
                        router.pathname === item.href
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      } px-3 py-2 rounded-md text-sm font-medium cursor-pointer`}
                    >
                      {item.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {error && <p className="text-sm text-red-500 mr-4">{error}</p>}
              
              {network && network.chainId != 11155111 && (
                <p className="text-sm text-amber-500 mr-4">Please connect to Sepolia network</p>
              )}
              
              <button
                onClick={connectWallet}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  isConnected
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isConnected ? formatAddress(account) : 'Connect Wallet'}
              </button>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navigation.map((item) => (
            <Link href={item.href} key={item.name}>
              <span
                className={`${
                  router.pathname === item.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                } block px-3 py-2 rounded-md text-base font-medium cursor-pointer`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </span>
            </Link>
          ))}
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          <div className="flex items-center px-5">
            <button
              onClick={connectWallet}
              className={`w-full px-4 py-2 rounded-md text-sm font-medium ${
                isConnected
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isConnected ? formatAddress(account) : 'Connect Wallet'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}