import { IKImage } from 'imagekitio-react';

const Image = (props) => {
  const { path, w, h, className, alt } = props;

  return (
    <IKImage
      urlEndpoint={import.meta.env.VITE_IK_URL_ENDPOINT} path={path}
      width={w}
      height={h} 
      className={`${className}`}
      loading='lazy'
      lqip={{ active: true, quality: 20 }}
      alt={alt}
    />
  );
};

export default Image;
