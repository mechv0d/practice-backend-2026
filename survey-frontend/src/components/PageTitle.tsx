import React, { useEffect } from 'react';

interface PageTitleProps {
  title: string;
  description?: string;
}

const PageTitle: React.FC<PageTitleProps> = ({ title, description }) => {
  useEffect(() => {
    document.title = `${title} - UmFragger`;
  }, [title]);

  return null;
};

export default PageTitle;
