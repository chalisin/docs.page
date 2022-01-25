import cx from 'classnames';
import { useEffect, useState } from 'react';
import { useDocumentationContext } from '~/context';

export function ScrollSpy(): JSX.Element {
  const { headings } = useDocumentationContext();
  const [active, setActive] = useState<string>('');

  useEffect(() => {
    if (!headings) {
      return;
    }

    // TODO improve once wrapped heading sections are applied
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          // console.log(entry.intersectionRatio)
          if (entry.isIntersecting && entry.intersectionRatio === 1) {
            const id = entry.target.getAttribute('id');
            setActive(id!);
            break;
          }
        }
      },
      {
        threshold: 1,
      },
    );

    headings.forEach(({ id }) => {
      let el;
      try {
        el = document.querySelector(`#${id}`);
      } catch (e) {
        console.error(`heading ${id} cannot be found`);
      }
      if (el) observer.observe(el);
    });

    return () => {
      setActive('');
      observer.disconnect();
    };
  }, [headings]);

  if (!headings) {
    return <ul />;
  }

  function onClick(id: string) {
    const el = document.getElementById(id);
    const sectionTop = el?.getBoundingClientRect().top;
    const currentTop = document.documentElement.scrollTop;
    window.scrollTo({ top: sectionTop! + currentTop - 100, behavior: 'smooth' });
    if (history.pushState) {
      //@ts-ignore
      history.pushState(null, null, `#${id}`);
    } else {
      location.hash = `#${id}`;
    }
    setActive(id!);
  }

  return (
    <ul className="space-y-2 text-sm">
      {headings.map(heading => (
        <li
          key={heading.id}
          className={cx(
            '-ml-px block overflow-x-hidden text-ellipsis whitespace-nowrap border-l border-transparent pl-4',
            {
              'hover:border-gray-400 hover:text-gray-800 dark:hover:text-gray-100': !(
                active === heading.id
              ),
              'text-docs-theme !border-docs-theme font-medium': active === heading.id,
            },
          )}
        >
          <a className="cursor-pointer" onClick={() => onClick(heading.id)}>
            {heading.title}
          </a>
        </li>
      ))}
    </ul>
  );
}
