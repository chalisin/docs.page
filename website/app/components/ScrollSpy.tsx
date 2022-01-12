import cx from 'classnames';
import { useEffect, useState } from 'react';
import { useDocumentationContext } from "~/context";

export function ScrollSpy() {
  const { headings } = useDocumentationContext();
  const [active, setActive] = useState<string>('');

  useEffect(() => {
    if (!headings) {
      return;
    }

    // TODO improve once wrapped heading sections are applied
    const observer = new IntersectionObserver((entries) => {
      const visibleEntries = entries.filter(entry => entry.isIntersecting)
      const id = visibleEntries[0].target.getAttribute('id');
      setActive(id!)
    }, {
      rootMargin: '-100px 0px 0px 0px',
      threshold: 0.0,
    });

    headings.forEach(({ id }) => {
      const el = document.querySelector(`#${id}`)
      if (el) observer.observe(el);
    });

    return () => {
      setActive('')
      observer.disconnect()
    };
  }, [headings]);

  if (!headings) {
    return <ul />
  }

  function onClick(id: string) {
    const el = document.getElementById(id)
    const sectionTop = el?.getBoundingClientRect().top;
    const currentTop = document.documentElement.scrollTop;
    window.scrollTo({ top: sectionTop! + currentTop - 100, behavior: 'smooth' })
    if (history.pushState) {
      //@ts-ignore
      history.pushState(null, null, `#${id}`);
    }
    else {
      location.hash = `#${id}`;
    }
    setActive(id!);
  }

  return (
    <ul className="text-sm space-y-2">
      {headings.map(heading => (
        <li
          key={heading.id}
          className={cx({
            'text-docs-theme': active === heading.id,
          })}
        >
          <a className="cursor-pointer" onClick={() => onClick(heading.id)} >{heading.title}</a>
        </li>
      ))}
    </ul>
  );
}
