import React from "react";
import { render } from "@testing-library/react";
import SharedYouTubePlayer from "../app/components/SharedYouTubePlayer";

// Mock react-youtube to avoid loading real YouTube iframes in tests
jest.mock("react-youtube", () => (props) => (
  <div data-testid="youtube-mock">
    videoId: {props.videoId}, start: {props.opts?.playerVars?.start}
  </div>
));

describe("SharedYouTubePlayer", () => {
  it("renders with the correct videoId and start time", () => {
    const { getByTestId } = render(
      <SharedYouTubePlayer
        videoId="dQw4w9WgXcQ"
        start={10}
        shouldPlay={true}
        duration={15}
        volume={80}
      />
    );
    const yt = getByTestId("youtube-mock");
    expect(yt).toHaveTextContent("videoId: dQw4w9WgXcQ");
    expect(yt).toHaveTextContent("start: 10");
  });
});