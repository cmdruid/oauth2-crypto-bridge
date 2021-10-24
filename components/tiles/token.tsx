import useSWR from 'swr';

function TokenTile() {
  const { data, error } = useSWR('api/sign');

  return (
    <>
      {data && data.token &&
        <div className="tile">
          <div className="token">
            <p>Copy / Paste this token into your third-party application</p>
            <pre>{data.token}</pre>
          </div>
          <button>
            Copy Token to Clipboard
          </button>
        </div>
      }
    </>
  )
}

export default TokenTile;