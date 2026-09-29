import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const sanityClient = createClient({
  projectId: 'k9turclc',
  dataset: 'production',
  useCdn: typeof document !== 'undefined' && process.env.NODE_ENV === 'production',
  apiVersion: '2022-03-07',
});

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: any) {
  return builder.image(source);
}
