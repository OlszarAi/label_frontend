// Custom image loader for Supabase signed URLs
// This bypasses Vercel Image Optimization which doesn't work with signed URLs

export default function supabaseImageLoader({ src }: {
  src: string;
  width?: number;
  quality?: number;
}) {
  // For Supabase signed URLs, return them as-is without optimization
  if (src.includes('supabase.co') && src.includes('token=')) {
    return src;
  }
  
  // For other images, return them as-is without optimization
  return src;
}
