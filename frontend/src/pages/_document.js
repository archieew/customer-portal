/**
 * Next.js Document Component
 * 
 * Customizes the HTML document structure.
 * Sets up meta tags and custom fonts.
 */

import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Meta tags for the app */}
        <meta charSet="utf-8" />
        <meta name="description" content="Customer Portal - View bookings and communicate with service providers" />
        <meta name="theme-color" content="#009999" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

