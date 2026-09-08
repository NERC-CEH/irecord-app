declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.svg?react' {
  import { FC, SVGProps } from 'react';

  const ReactComponent: FC<SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.scss';
declare module '*.css';
