export const cleanImageUrl = (imageUrl: string | string[] | undefined | null): string => {
  if (!imageUrl) return '';
  
  try {
    // Convert input to string
    let url: string = '';
    
    if (Array.isArray(imageUrl)) {
      url = imageUrl[0] || '';
    } else if (typeof imageUrl === 'string') {
      url = imageUrl;
    } else {
      return '';
    }
    
    // Handle string input
    if (url.startsWith('[')) {
      try {
        const parsed = JSON.parse(url);
        if (Array.isArray(parsed)) {
          url = parsed[0] || '';
        } else if (typeof parsed === 'string') {
          url = parsed;
        }
      } catch (e) {
        // If parsing fails, try to extract URL directly
        const urlMatch = url.match(/https?:[^"]+/);
        if (urlMatch) {
          url = urlMatch[0];
        }
      }
    }
    
    // Clean up the URL
    return url
      .replace(/\\\//g, '/')  // Replace \/ with /
      .replace(/\\"/g, '"')   // Replace \" with "
      .replace(/^"|"$/g, '')  // Remove surrounding quotes
      .replace(/\\/g, '')     // Remove any remaining backslashes
      .trim();                // Remove whitespace
    
  } catch (e) {
    console.error('Error cleaning image URL:', e);
    return '';
  }
};
