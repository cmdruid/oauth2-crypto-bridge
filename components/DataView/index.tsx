// import useSWR

export default function DisplayToken({ session, secret, account }) {


  
  return (
    <div className="card">
      <div className="card-content">
        <div className="media">
          <div className="media-left">
            <figure className="image is-48x48">
              <img src={session?.user?.picture} alt="Placeholder image"/>
            </figure>
          </div>
          <div className="media-content">
            <p className="title is-4">{`Logged in as ${session?.user?.name}`}</p>
            <p className="subtitle is-6">{session?.user?.email}</p>
          </div>
        </div>

        <div className="content">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          Phasellus nec iaculis mauris. <a>@bulmaio</a>.
          <a href="#">#css</a> <a href="#">#responsive</a>
          <br/>
          <time datetime="2016-1-1">11:09 PM - 1 Jan 2016</time>
        </div>
      </div>
      <div>
        <p>Session: {JSON.stringify(session, null, 2)}</p>
        <p>Account: {account}</p>
        <p>Secret: {secret}</p>
      </div>
    </div>
  )
}