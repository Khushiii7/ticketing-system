import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <div className="app-container">
      <Component {...pageProps} />
    </div>
  );
}
