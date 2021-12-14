import { LoaderFunction } from 'remix';
import { fetchBundle } from '@docs.page/server';

const loader: LoaderFunction = async ({ params }) => {
  const owner = params.owner!;
  const repo = params.repo!;
  const path = params['*']!;
  console.log(owner, repo);
  let data;
  try {
    data = await fetchBundle({ owner, repository: repo, path });
  } catch (error) {
    console.log(error);

    //@ts-ignore
    return error?.response?.data || { bundled: '' };
  }

  return data;
};

export default loader;
