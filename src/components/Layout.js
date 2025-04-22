import Head from 'next/head';
import { useWeb3 } from '../context/Web3Context';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children, title = 'Document Verification DApp' }) {
  const { isLoading } = useWeb3();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Head>
        <title>{title}</title>
        <meta name="description" content="Blockchain-based document verification system" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          children
        )}
      </main>

      <Footer />
    </div>
  );
}