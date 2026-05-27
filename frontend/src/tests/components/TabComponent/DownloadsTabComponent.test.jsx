import { fireEvent, render, screen } from "@testing-library/react";
import DownloadsTabComponent from "main/components/TabComponent/DownloadsTabComponent";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { expect, vi } from "vitest";
import coursesFixtures from "fixtures/coursesFixtures";

const mockToast = vi.fn();

vi.mock("react-toastify", async (importOriginal) => {
  return {
    ...(await importOriginal()),
    toast: (x) => mockToast(x),
  };
});

describe("DownloadsTabComponent tests", () => {
  beforeEach(() => {
    mockToast.mockClear();
  });

  test("Downloads tab component and form elements render correctly", async () => {
    const client = new QueryClient();
    render(
      <QueryClientProvider client={client}>
        <DownloadsTabComponent
          courseId={coursesFixtures.severalCourses[0].id}
          testIdPrefix="InstructorCourseShowPage"
        />
      </QueryClientProvider>,
    );

    await screen.findByTestId("InstructorCourseShowPage-downloadsTab");

    expect(screen.getByText("Course Downloads")).toBeInTheDocument();
    expect(
      screen.getByTestId("InstructorCourseShowPage-downloads-header"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("InstructorCourseShowPage-btn-download-students-csv"),
    ).toBeInTheDocument();
  });

  test("Fires submit download handler cleanly on button click", async () => {
    delete window.location;
    window.location = { href: "" };

    const client = new QueryClient();
    render(
      <QueryClientProvider client={client}>
        <DownloadsTabComponent
          courseId={coursesFixtures.severalCourses[0].id}
          testIdPrefix="InstructorCourseShowPage"
        />
      </QueryClientProvider>,
    );

    await screen.findByTestId(
      "InstructorCourseShowPage-btn-download-students-csv",
    );

    const submitButton = screen.getByTestId(
      "InstructorCourseShowPage-btn-download-students-csv",
    );
    fireEvent.click(submitButton);

    expect(mockToast).toHaveBeenCalledWith("Download successfully initiated.");

    expect(window.location.href).toBe("/api/csv/rosterstudents?courseId=1");
  });
});
