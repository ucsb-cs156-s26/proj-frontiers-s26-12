import React from "react";
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
    // 1. Intercept native browser window navigation
    delete window.location;
    window.location = { href: "" };

    const client = new QueryClient();
    render(
      <QueryClientProvider client={client}>
        <DownloadsTabComponent
          courseId={coursesFixtures.severalCourses[0].id} // This evaluates to 1
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

    // 2. Verify visual confirmation toast fired
    expect(mockToast).toHaveBeenCalledWith("Download successfully initiated.");

    // 3. Verify window.location.href changed to point to the correct backend route
    expect(window.location.href).toBe("/api/csv/rosterstudents?courseId=1");
  });
});
