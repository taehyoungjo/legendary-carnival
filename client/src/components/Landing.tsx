import { Link } from "react-router-dom";

export function Landing() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center px-4">
      <div className="flex flex-col max-w-2xl space-y-2 items-center">
        <h1>Still Life</h1>

        <hr className="w-full" />

        <Link
          to={"/room/?url=https://wikipedia.com"}
          className="px-3 py-2 rounded-full bg-blue-200 w-24"
        >
          Enter
        </Link>

        <a href="" className="text-orange-600">
          Firefox extension
        </a>
        <a href="" className="text-blue-600">
          Github
        </a>

        <hr className="w-full" />

        <p>
          Still life is an experiment in making the Internet feel more like a{" "}
          <span className="underline">place</span>
        </p>
        <p>
          Places are brought to life by the people in them. See the live cursors
          & video of people that are on a site with you. Follow people to
          different locations on the Internet.
        </p>
        <p>
          The Firefox extension lets you toggle into Still Life from any website
        </p>
        <p>For now, there is only one room!</p>

        <hr className="w-full" />

        <h3>Made as part of CPSC 490 by Tae Hyoung Jo</h3>
        <h3>Thank you to Professor Lin Zhong!</h3>
      </div>
    </div>
  );
}
