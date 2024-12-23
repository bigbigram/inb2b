export const deeplinkConfig = {
  androidPackageName: 'com.indob2bt.app', // Android package name
  iosBundleId: 'com.indob2bt.app', // iOS bundle ID
  appStoreId: 'your-app-store-id', // Replace with your App Store ID
  playStoreId: 'your-play-store-id', // Replace with your Play Store ID
  scheme: 'indob2bt', // Your app's URL scheme
  host: 'app', // Your app's host
  fallbackUrl: 'https://ims.indob2c.com', // Web fallback URL
}

export const generateDeepLink = (path: string, params?: Record<string, string>) => {
  const baseUrl = `${deeplinkConfig.scheme}://${deeplinkConfig.host}/${path}`;
  
  if (!params) {
    return baseUrl;
  }

  const queryString = Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  return `${baseUrl}?${queryString}`;
}

export const generateUniversalLink = (path: string, params?: Record<string, string>) => {
  const platform = /iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'ios' : 'android';
  
  // Generate store URLs with deep link as fallback
  if (platform === 'ios') {
    const storeUrl = `https://itunes.apple.com/app/${deeplinkConfig.appStoreId}?mt=8`;
    return `${storeUrl}&url=${encodeURIComponent(generateDeepLink(path, params))}`;
  } else {
    const storeUrl = `https://play.google.com/store/apps/details?id=${deeplinkConfig.androidPackageName}`;
    return `${storeUrl}&url=${encodeURIComponent(generateDeepLink(path, params))}`;
  }
}
