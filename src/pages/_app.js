import '../styles/globals.css';
import { Web3Provider } from '../context/Web3Context';
import Layout from '../components/Layout';

function MyApp({ Component, pageProps }) {
  return (
    <Web3Provider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Web3Provider>
  );
}

export default MyApp;