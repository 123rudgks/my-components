'use client';

import FallbackImg from '@/app/images/FallbackImg.png';
import {
  ImageLoader,
  OnLoadingComplete,
  PlaceholderValue,
  StaticImport,
  StaticRequire,
} from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const isStaticRequire = (src: string | StaticImport): src is StaticRequire =>
  typeof src === 'object' && 'default' in src;

type ImageType = Omit<
  React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >,
  'height' | 'width' | 'loading' | 'ref' | 'alt' | 'src' | 'srcSet'
> & {
  src: string | StaticImport;
  alt: string;
  width?: number | `${number}` | undefined;
  height?: number | `${number}` | undefined;
  fill?: boolean | undefined;
  loader?: ImageLoader | undefined;
  quality?: number | `${number}` | undefined;
  priority?: boolean | undefined;
  loading?: 'eager' | 'lazy' | undefined;
  placeholder?: PlaceholderValue | undefined;
  blurDataURL?: string | undefined;
  unoptimized?: boolean | undefined;
  onLoadingComplete?: OnLoadingComplete | undefined;
  layout?: string | undefined;
  objectFit?: string | undefined;
  objectPosition?: string | undefined;
  lazyBoundary?: string | undefined;
  lazyRoot?: string | undefined;
} & React.RefAttributes<HTMLImageElement | null>;

const FallbackImage = ({ src, alt, onError, ...props }: ImageType) => {
  const [imgSrc, setImgSrc] = useState<string | StaticImport>(FallbackImg);
  useEffect(() => {
    if (typeof src === 'string') {
      setImgSrc(src || FallbackImg.src);
    } else {
      if (isStaticRequire(src)) {
        setImgSrc({
          default: {
            ...src.default,
            src: src.default.src || FallbackImg.src,
          },
        });
      } else {
        setImgSrc({
          ...src,
          src: src.src || FallbackImg.src,
        });
      }
    }
  }, [src]);
  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={(e) => {
        setImgSrc(FallbackImg);
      }}
    />
  );
};

export default FallbackImage;
