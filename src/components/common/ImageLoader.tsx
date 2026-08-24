import React, { useState, useEffect, ReactNode, isValidElement, cloneElement, ReactElement } from 'react';

interface ImageLoaderProps {
  src: string;
  srcSet?: string;
  className?: string;
  children?: ReactNode;
}

type Status = 'loading' | 'loaded' | 'failed';

export const ImageLoader: React.FC<ImageLoaderProps> = ({ src, srcSet, className, children }) => {
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    setStatus('loading');
    const img = new Image();
    img.onload = () => {
      setStatus('loaded');
    };
    img.onerror = () => {
      setStatus('failed');
    };
    img.src = src;
    if (srcSet) {
      img.srcset = srcSet;
    }

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, srcSet]);

  const childrenArray = React.Children.toArray(children);

  return (
    <div className={`imageloader imageloader-${status} ${className || ''}`}>
      {status === 'loaded' && childrenArray[0] && isValidElement(childrenArray[0])
        ? cloneElement(childrenArray[0] as ReactElement<{ src?: string; srcSet?: string; loading?: string; decoding?: string }>, {
            src,
            srcSet: srcSet || src,
            loading: 'lazy',
            decoding: 'async',
          })
        : null}
      {status === 'failed' && childrenArray[1]}
      {status === 'loading' && (childrenArray[2] || childrenArray[0])}
    </div>
  );
};

export default ImageLoader;
