// Logo utility - try different paths to find logo
export const getLogoPath = () => {
  // Try different possible paths
  const paths = [
    '/logo.png',
    '/images/logo.png',
    './logo.png',
    'logo.png'
  ];
  
  // For now, return the most common one
  return '/logo.png';
};

// Alternative: Import logo if it's in src folder
// import logoImage from '../assets/logo.png';
// export const logoImage = logoImage;

