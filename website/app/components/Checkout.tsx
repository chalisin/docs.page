import { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import { useNavigate } from "react-router-dom";

export function Checkout(): JSX.Element {
    const navigate = useNavigate();
    const [repo, setRepo] = useState<string>('');
    const [valid, setValid] = useState<boolean | null>(null);
    const url = useRef<string | null>();
    const githubRegex = '^https:\\/\\/[^\\/:]+[\\/:]([^\\/:]+)\\/(.+)';

    useEffect(() => {
        if (!repo) {
            url.current = null;
            return setValid(null);
        }

        if (repo.startsWith('https://github.com')) {
            const chunks = repo.match(githubRegex);
            if (chunks && chunks.length === 3) {
                url.current = `https://next.docs.page/${chunks[1]}/${chunks[2]}`;
                return setValid(true);
            }
        }

        url.current = null;
        return setValid(false);
    }, [repo]);

    return (
        <div>
            <div className="px-3 mb-4">
                <input
                    type="text"
                    placeholder="https://github.com/invertase/docs.page"
                    className="w-full px-3 py-3 appearance-none bg-transparent border rounded placeholder-gray-500 focus:border-orange-400"
                    value={repo}
                    onChange={e => setRepo(e.target.value)}
                />
            </div>
            <p className="text-lg px-3">
                Enter your GitHub repository URL above to view your new documentation!
            </p>
            <div className="px-3 mt-8">
                <button
                    type="button"
                    className={cx(
                        'px-8 py-3 rounded bg-gradient-to-br from-yellow-500 to-yellow-600 text-white font-semibold',
                        {
                            'hover:from-yellow-600 hover:to-yellow-700': valid === true,
                            'cursor-not-allowed opacity-50': !valid,
                        },
                    )}
                    onClick={() => {
                        if (valid && url.current) {
                            window.location.href = url.current;
                        }
                    }}
                >
                    View Docs
                </button>
            </div>
            <div className="px-3 mt-4 h-4">
                <p
                    className={cx('text-red-500 transition-opacity duration-100', {
                        'opacity-0': valid === true || valid === null,
                    })}
                >
                    Please enter a valid GitHub repository URL.
                </p>
            </div>
        </div>
    );
}