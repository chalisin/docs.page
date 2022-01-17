import { Link } from 'remix';
import { useDocumentationContext } from '~/context';
import { usePreviewMode } from '~/utils/local-preview-mode';

export function Footer(): JSX.Element {
  const previewMode = usePreviewMode()

  console.log(previewMode);

  const { source, baseBranch, path } = useDocumentationContext();
  // TODO: fix editUrl
  const editUrl = previewMode.enabled ? '' : `https://github.com/${source.owner}/${source.repository}/edit/${source.type === 'branch' ? source.ref : baseBranch}/docs/${path || 'index'}.mdx`;
  return (
    <footer className="mt-16 py-8 px-4 lg:px-8 border-t border-gray-900/10">
      <div className="flex text-sm font-medium text-gray-500 dark:text-gray-300">
        <div className="flex-grow">
          Powered by{' '}
          <Link to="/" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            docs.page
          </Link>
        </div>
        {previewMode.enabled ?
          '' :
          <div className="flex-shrink-0">
            <a
              href={editUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Edit this page
            </a>
          </div>
        }
      </div>
    </footer>
  );
}
