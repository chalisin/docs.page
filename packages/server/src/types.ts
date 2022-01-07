import type { Message } from 'esbuild';

export type FetchBundleInput = {
  owner: string;
  repository: string;
  ref?: string;
  path?: string;
};

type HeadingNode = {
  id: string;
  title: string;
  rank: number | null;
};

export type BundleError = {
  errors: Message[];
};

export type BundleSuccess = {
  code: string | null;
  config: {
    [key: string]: any;
  } | null;
  frontmatter: {
    [key: string]: any;
  };
  headings: HeadingNode[] | null;
  baseBranch: string | null;
  path: string | null;
  repositoryFound: boolean;
  source: {
    type: 'PR' | 'branch' | 'commit';
    owner: string;
    repository: string;
    ref: string;
  };
};

export type BundleResponseData = BundleSuccess | BundleError;
