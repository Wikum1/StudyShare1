
import { render, screen } from "@testing-library/react";
import ResourceModeration from "../pages/admin/ResourceModeration";

test("renders Admin Resource Moderation heading", () => {
  render(<ResourceModeration />);
  const heading = screen.getByText(/Admin Resource Moderation/i);
  expect(heading).toBeInTheDocument();
});
