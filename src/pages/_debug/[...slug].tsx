import React, { useCallback, useState } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { GitHub } from '../../components/Icons';
import Link from 'next/link';
import NextHead from 'next/head';
import { useRouter } from 'next/router';
import cx from 'classnames';

import { Error, ErrorBoundary } from '../../templates/error';
import { IRenderError, redirect, RenderError } from '../../utils/error';

import { DarkModeToggle } from '../../components/DarkModeToggle';
import { ExternalLink } from '../../components/Link';
import { CustomDomain, CustomDomainContext } from '../../utils/domain';
import { SlugProperties, SlugPropertiesContext, Properties } from '../../utils/properties';
import { mdxSerialize } from '../../utils/mdx-serialize';

import { getPageContent, PageContent, HeadingNode } from '../../utils/content';
import { isProduction } from '../../utils';
import {
  getPullRequestMetadata,
  getRepositoriesPaths,
  getRepositoryList,
} from '../../utils/github';

import { Loading } from '../../templates/Loading';

type Tab = 'general' | 'properties' | 'content' | 'config' | 'frontmatter';

const tabs: { [key in Tab]: string } = {
  general: 'General',
  properties: 'Properties',
  content: 'Content',
  config: 'Config',
  frontmatter: 'Frontmatter',
};

export default function DebugPage({ properties, page, error }) {
  const [tab, setTab] = useState<Tab>('general');

  const onTabSwitch = useCallback((activeTab: Tab) => {
    setTab(activeTab);
  }, []);

  const { isFallback } = useRouter();

  if (isFallback) {
    return <Loading />;
  }

  if (error) {
    return <Error {...error} />;
  }

  return (
    <>
      <NextHead>
        <title>Debug | docs.page</title>
        <meta name="robots" content="noindex" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png" />
      </NextHead>
      <header className="bg-gray-800 dark:bg-gray-900">
        <div className="flex h-16 max-w-4xl py-4 mx-auto">
          <div className="flex-1">
            <img src="/assets/docs-page-logo.png" alt="docs.page" className="max-h-full" />
          </div>
          <DarkModeToggle />
        </div>
      </header>
      <section className="max-w-4xl mx-auto mt-24">
        <h1 className="text-5xl font-extrabold dark:text-white">Debug Mode</h1>
        <div className="my-6">
          <button className="px-3 py-1 mr-2 text-sm text-white bg-green-500 rounded-lg">
            No Errors
          </button>
          <button className="px-3 py-1 mr-2 text-sm text-white bg-green-500 rounded-lg">
            Valid Config
          </button>
          <button className="px-3 py-1 mr-2 text-sm text-white bg-green-500 rounded-lg">
            Forked
          </button>
          <button className="px-3 py-1 mr-2 text-sm text-white bg-green-500 rounded-lg">
            Indexed
          </button>
        </div>
        <div className="desktop:hidden">
          <div className="mt-6">
            <label htmlFor="selected-tab" className="sr-only">
              Select a tab
            </label>
            <select
              id="selected-tab"
              name="selected-tab"
              className="block w-full py-2 pl-3 pr-10 mt-1 text-base border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            >
              {Object.entries(tabs).map(([key, value]) => (
                <option key={key}>{value}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="hidden desktop:block">
          <div className="mt-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px space-x-8 dark:text-white">
                {Object.entries(tabs).map(([key, value]) => (
                  <div
                    key={key}
                    className={cx(
                      'border-transparent whitespace-nowrap py-4 px-1 border-b-2 font-medium tracking-wide',
                      {
                        'text-blue-500 border-blue-500 hover:text-blue-400 hover:border-blue-400':
                          tab === key,
                        'hover:text-gray-500 hover:border-gray-500 dark:hover:text-gray-300 dark:hover:border-gray-300':
                          tab !== key,
                      },
                    )}
                    role="button"
                    tabIndex={0}
                    onClick={() => onTabSwitch(key as Tab)}
                  >
                    {value}
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </div>
        <div className="py-8 dark:text-white">
          {tab === 'general' && <GeneralTab properties={properties} />}
          {tab === 'properties' && <PropertiesTab properties={properties} />}
          {tab === 'content' && <ContentTab properties={page.content} />}
          {tab === 'config' && <ConfigTab properties={page.config} />}
          {tab === 'frontmatter' && <FrontMatterTab properties={page.frontmatter} />}
        </div>
      </section>
    </>
  );
}

function Row({
  title,
  href,
  children,
}: {
  title: string;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex px-4 py-4 border-b dark:border-gray-700">
      <div className="w-1/2 font-semibold">{title}</div>
      <div className="w-1/2">
        {!!href && <ExternalLink href={href}>{children}</ExternalLink>}
        {!href && children}
      </div>
    </div>
  );
}

function ActiveButton({ value }: { value: string }) {
  const activeStyle = value ? 'bg-green-500' : 'bg-red-500';
  const title = value ? 'Active' : 'Inactive';
  return (
    <button className={`px-3 py-1 mr-2 text-sm text-white ${activeStyle} rounded-lg`}>
      {title}
    </button>
  );
}

function GeneralTab({ properties }) {
  return (
    <div className="">
      <Row title="Owner">
        <code>{properties.owner}</code>
      </Row>
      <Row title="Repository">
        <code>{properties.repository}</code>
      </Row>
    </div>
  );
}

function PropertiesTab({ properties }) {
  return (
    <div className="">
      <Row title="Ref">
        <code>{properties.ref}</code>
      </Row>
      <Row title="Ref Type">
        <code>{properties.refType}</code>
      </Row>
      <Row title="Hash">
        <code>{properties?.hash}</code>
      </Row>
      <Row title="Github Url">
        <Link href={properties?.githubUrl}>
          <code className="flex space-x-4 cursor-pointer">
            <GitHub size={26} className="text-black dark:text-white hover:opacity-80" />
            <span>{properties?.githubUrl}</span>
          </code>
        </Link>
      </Row>
      <Row title="Base Branch">
        <ActiveButton value={properties.isBaseBranch} />
      </Row>
    </div>
  );
}

function ContentTab({ properties }) {
  return <div className="">{properties}</div>;
}

function ConfigTab({ properties }) {
  const mapItems = $ => {
    if (!$.length) return 'n/a';

    return $.map(([title]) => title).join(', ');
  };

  return (
    <div className="">
      <Row title="Logo">
        <code>{properties.logo || 'n/a'}</code>
      </Row>
      <Row title="Name">
        <code>{properties.name}</code>
      </Row>
      <Row title="Default Layout">
        <code>{properties.defaultLayout}</code>
      </Row>
      <Row title="Header Depth">
        <code>{properties.headerDepth}</code>
      </Row>
      <Row title="Theme">
        <code className="flex space-x-4">
          <span>{properties.theme}</span>
          <button className="p-3" style={{ backgroundColor: properties.theme }}></button>
        </code>
      </Row>
      <Row title="Navigation">{mapItems(properties.navigation)}</Row>
      <Row title="Sidebar">{mapItems(properties.sidebar)}</Row>
      <Row title="Google Analyrics">
        <ActiveButton value={properties.googleAnalytics} />
      </Row>
      <Row title="Zoom Images">
        <ActiveButton value={properties.zoomImages} />
      </Row>
      <Row title="No Index">
        <ActiveButton value={properties.noindex} />
      </Row>
    </div>
  );
}

function FrontMatterTab({ properties }) {
  return (
    <div className="">
      <Row title="Title">
        <code>{properties.title}</code>
      </Row>
      <Row title="Description">
        <code>{properties.description}</code>
      </Row>

      <Row title="Redirect">
        <code>{properties.redirect || 'n/a'}</code>
      </Row>
      <Row title="layout">
        <code>{properties.layout || 'n/a'}</code>
      </Row>
      <Row title="Image">
        <code>{properties.image || 'n/a'}</code>
      </Row>
      <Row title="Table of contents">
        <ActiveButton value={properties.tableOfContents} />
      </Row>
      <Row title="Sidebar">
        <ActiveButton value={properties.sidebar} />
      </Row>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  let paths = [];

  // Since this call can be fairly large, only run it on production
  // and let the development pages fallback each time.
  if (isProduction()) {
    const repositories = await getRepositoryList();
    paths = await getRepositoriesPaths(repositories);
    console.info(`- gathered ${paths.length} static pages.`);
  }

  return {
    paths: paths.map($ => `/_debug${$}`),
    fallback: true,
  };
};

type StaticProps = {
  domain: CustomDomain;
  properties: SlugProperties;
  headings: HeadingNode[];
  source?: string;
  page?: PageContent;
  error?: IRenderError;
};

export const getStaticProps: GetStaticProps<StaticProps> = async ({ params }) => {
  let source = null;
  let headings: HeadingNode[] = [];
  let error: RenderError = null;
  let page: PageContent;
  // console.log('here');
  // // Extract the slug properties from the request.
  const properties = new Properties(params.slug as string[]);

  // // If the ref looks like a PR, update the details to point towards
  // // the PR owner (which might be a different repo)
  if (properties.isPullRequest()) {
    const metadata = await getPullRequestMetadata(
      properties.owner,
      properties.repository,
      parseInt(properties.ref),
    );

    // If a PR was found, update the property metadata
    if (metadata) {
      properties.setPullRequestMetadata(metadata);
    }
  }

  page = await getPageContent(properties);

  if (!page) {
    console.error('Page not found');
    error = RenderError.pageNotFound(properties);
  } else if (page.frontmatter.redirect) {
    return redirect(page.frontmatter.redirect, properties);
  } else {
    const serialization = await mdxSerialize(page);

    if (serialization.error) {
      error = RenderError.serverError(properties);
    } else {
      source = serialization.source;
      page.headings = serialization.headings as HeadingNode[];
    }
  }

  return {
    props: {
      domain: null, // await getCustomDomain(properties),
      properties: properties.toObject(),
      source,
      headings,
      page,
      error: error?.toObject() ?? null,
    },
    revalidate: 30,
  };
};

// import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
// import { getPageContent, PageContent } from '../../utils/content';
// import { Properties, SlugPropertiesContext, SPLITTER } from '../../utils/properties';
// import { getDefaultBranch, getPullRequestMetadata } from '../../utils/github';
// import mdxSerialize from 'next-mdx-remote/serialize';
// import { RepoInfo } from '../../templates/debug/RepoInfo';
// import { Configuration } from '../../templates/debug/Configuration';
// import { Error } from '../../templates/debug/Error';
// import { RenderError } from '../../templates/debug/RenderError';
// import { serializeError } from 'serialize-error';
// import { Header } from '../../components/Header';
// import NextHead from 'next/head';
// import { getHeadTags } from '../../hooks';
// import { MetaTags } from '../../templates/debug/MetaTags';

// export default function Debug({
//   error,
//   properties,
//   page,
// }: InferGetStaticPropsType<typeof getStaticProps>) {
//   let tags = null;
//   if (properties.ref) {
//     tags = getHeadTags(properties, page);
//   }

//   return (
//     <>
//       <NextHead>
//         <base href={properties.path} />
//         <meta name="robots" content="noindex" />
//         <title>
//           Debug Mode | {properties.owner}/{properties.repository}
//         </title>
//       </NextHead>
//       <SlugPropertiesContext.Provider value={properties}>
//         <Header />
//         <div className="my-10 space-y-10">
//           {!properties.ref && <Error>Repository not found</Error>}
//           {!page && properties.ref && <Error>Page not found</Error>}

//           <RepoInfo properties={properties} />

//           {error && <RenderError error={error} />}
//           {page && (
//             <>
//               <Configuration config={page.config} />
//               <MetaTags tags={tags} />
//             </>
//           )}
//         </div>
//       </SlugPropertiesContext.Provider>
//     </>
//   );
// }

// export const getStaticPaths: GetStaticPaths = async () => {
//   return {
//     paths: [],
//     fallback: 'blocking',
//   };
// };

// type StaticProps = {
//   error?: object;
//   source?: any;
//   properties?: any;
//   page?: any;
// };

// export const getStaticProps: GetStaticProps<StaticProps> = async ({ params }) => {
//   let source = null;
//   let error = null;
//   let page: PageContent;

//   // Extract the slug properties from the request.
//   let properties = new Properties(params.slug as string[]);
//   console.log(properties);

//   // If no ref was found in the slug, grab the default branch name
//   // from the GQL API.
//   if (!properties.ref) {
//     const defaultBranch = await getDefaultBranch(properties.owner, properties.repository);

//     if (!defaultBranch) {
//       properties.ref = null;
//     } else {
//       // Assign the default branch to the ref
//       properties.ref = defaultBranch;
//       properties.base = `${properties.base}${SPLITTER}${properties.ref}`;
//     }
//   }
//   // If the ref looks like a PR
//   else if (properties.isPullRequest()) {
//     const metadata = await getPullRequestMetadata(
//       properties.owner,
//       properties.repository,
//       parseInt(properties.ref),
//     );

//     // If a PR was found, update the property metadata
//     if (metadata) {
//       properties.owner = metadata.owner;
//       properties.repository = metadata.repository;
//       properties.ref = metadata.ref;
//     }
//   }

//   page = await getPageContent(properties);
//   if (page) {
//     try {
//       source = await mdxSerialize(page.content, {
//         mdxOptions: {
//           rehypePlugins: [
//             require('../../../rehype-prism'), // Using local version to handle `react-live`
//             require('../../../rehype-prose'),
//             require('rehype-slug'),
//           ],
//           remarkPlugins: [require('@fec/remark-a11y-emoji'), require('remark-admonitions')],
//         },
//       });
//     } catch (e) {
//       error = serializeError(e);
//     }
//   } else {
//     // TODO: Temporary workaround to check if repo exists if user has given a branch or PR
//     const defaultBranch = await getDefaultBranch(properties.owner, properties.repository);
//     if (!defaultBranch) properties.ref = null;
//     console.error('No page content found');
//   }

//   return {
//     props: {
//       properties: properties.toObject(),
//       source,
//       page,
//       error,
//     },
//     revalidate: 3,
//   };
// };
