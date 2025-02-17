import React, { useCallback, useState } from 'react';
import { Controlled as ControlledZoom } from 'react-medium-image-zoom';
import { Image } from '../components/Image';
import { Link } from '../components/Link';
import { useConfig } from '../hooks';

interface ImageProps
  extends React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
  caption?: string;
  zoom?: boolean;
}

export function Img({ zoom, caption, ...props }: ImageProps & { href?: string }): JSX.Element {
  const src = props.src ?? '';

  const config = useConfig();
  const zoomEnabled = zoom ?? config.zoomImages;

  if (!src) {
    return null;
  }

  const wrapper = (child: React.ReactElement) =>
    props.href
      ? withHref(withFigure(zoomEnabled ? withZoom(child) : child, caption), props.href)
      : withFigure(zoomEnabled ? withZoom(child) : child, caption);

  return wrapper(<Image {...props} className="mx-auto" />);
}

function withHref(child: React.ReactElement, href) {
  return <Link href={href}>{child}</Link>;
}

function withFigure(child: React.ReactElement, caption?: string) {
  return (
    <figure>
      {child}
      {!!caption && (
        <figcaption className="text-center text-sm italic my-3 dark:text-white">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function withZoom(child: React.ReactElement) {
  const [isZoomed, setIsZoomed] = useState(false);

  // const handleImgLoad = useCallback(() => {
  //   setIsZoomed(true);
  // }, []);

  const handleZoomChange = useCallback(shouldZoom => {
    setIsZoomed(shouldZoom);
  }, []);
  return (
    <ControlledZoom
      wrapStyle={
        isZoomed
          ? { width: '100%', height: 'auto', transition: 'height ease-out  0.5s' }
          : { transition: 'height ease-out  0.5s' }
      }
      isZoomed={isZoomed}
      onZoomChange={handleZoomChange}
    >
      {child}
    </ControlledZoom>
  );
}
