export function getFileExtension(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return ext;
}

export function getFileTypeColor(ext: string): string {
  const colorMap: { [key: string]: string } = {
    // Documents
    'pdf': 'text-red-400',
    'doc': 'text-blue-400',
    'docx': 'text-blue-400',
    'txt': 'text-gray-400',
    'rtf': 'text-gray-400',
    
    // Spreadsheets
    'xls': 'text-green-400',
    'xlsx': 'text-green-400',
    'csv': 'text-green-400',
    
    // Presentations
    'ppt': 'text-orange-400',
    'pptx': 'text-orange-400',
    
    // Images
    'jpg': 'text-pink-400',
    'jpeg': 'text-pink-400',
    'png': 'text-pink-400',
    'gif': 'text-pink-400',
    'svg': 'text-pink-400',
    'webp': 'text-pink-400',
    
    // Audio
    'mp3': 'text-purple-400',
    'wav': 'text-purple-400',
    'ogg': 'text-purple-400',
    
    // Video
    'mp4': 'text-indigo-400',
    'mov': 'text-indigo-400',
    'avi': 'text-indigo-400',
    'mkv': 'text-indigo-400',
    
    // Archives
    'zip': 'text-yellow-400',
    'rar': 'text-yellow-400',
    '7z': 'text-yellow-400',
    
    // Code
    'js': 'text-yellow-400',
    'ts': 'text-blue-400',
    'jsx': 'text-blue-400',
    'tsx': 'text-blue-400',
    'html': 'text-orange-400',
    'css': 'text-blue-400',
    'json': 'text-yellow-400',
    'py': 'text-green-400',
    'java': 'text-red-400',
    'cpp': 'text-blue-400',
    'c': 'text-blue-400',
    
    // Other
    'sql': 'text-blue-400',
    'md': 'text-blue-400',
  };

  return colorMap[ext] || 'text-gray-400';
}

export const getFileTypeIcon = (extension: string): string => {
  const ext = extension.toLowerCase();
  
  // Document types
  if (['doc', 'docx'].includes(ext)) {
    return `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 4C4 2.89543 4.89543 2 6 2H14L20 8V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4Z M14 2V8H20"/>
    </svg>`;
  }
  
  if (['pdf'].includes(ext)) {
    return `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 2H16L22 8V20C22 21.1046 21.1046 22 20 22H4C2.89543 22 2 21.1046 2 20V4C2 2.89543 2.89543 2 4 2H8ZM8 4H4V20H20V8L16 4H8Z"/>
      <path d="M12 9H8V11H12V9Z M16 13H8V15H16V13Z M14 17H8V19H14V17Z"/>
    </svg>`;
  }

  // Image types
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) {
    return `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 16L8.586 11.414C9.367 10.633 10.633 10.633 11.414 11.414L16 16M14 14L15.586 12.414C16.367 11.633 17.633 11.633 18.414 12.414L20 14M14 8H14.01M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z"/>
    </svg>`;
  }

  // Code files
  if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) {
    return `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 3H21V21H3V3ZM9 9V11C9 12.1046 8.10457 13 7 13H6V15H7C8.10457 15 9 15.8954 9 17V19H11V17C11 15.8954 10.1046 15 9 15V13C10.1046 13 11 12.1046 11 11V9H9ZM15 9V11C15 12.1046 15.8954 13 17 13H18V15H17C15.8954 15 15 15.8954 15 17V19H13V17C13 15.8954 13.8954 15 15 15V13C13.8954 13 13 12.1046 13 11V9H15Z"/>
    </svg>`;
  }

  // Spreadsheets
  if (['xls', 'xlsx', 'csv'].includes(ext)) {
    return `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 4C4 2.89543 4.89543 2 6 2H14L20 8V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4Z M14 2V8H20 M8 13H10L12 17L14 13H16"/>
    </svg>`;
  }

  // Text files
  if (['txt', 'md'].includes(ext)) {
    return `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 4C4 2.89543 4.89543 2 6 2H14L20 8V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4Z M14 2V8H20 M8 13H16M8 17H16M8 9H10"/>
    </svg>`;
  }

  // Default file icon
  return `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 4C4 2.89543 4.89543 2 6 2H14L20 8V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4Z M14 2V8H20"/>
  </svg>`;
};
