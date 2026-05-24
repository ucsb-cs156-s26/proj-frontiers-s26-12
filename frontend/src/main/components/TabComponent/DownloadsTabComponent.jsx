import React from "react";
import CourseDownloadsForm from "../Courses/CourseDownloadsForm";
import { toast } from "react-toastify";

export default function DownloadsTabComponent({ courseId, testIdPrefix }) {
  const onSuccessDownloadTriggered = () => {
    toast("Download successfully initiated.");
  };

  const handleSubmit = () => {
    onSuccessDownloadTriggered();
    window.location.href = `/api/csv/rosterstudents?courseId=${courseId}`;
  };

  return (
    <div data-testid={`${testIdPrefix}-downloadsTab`}>
      <CourseDownloadsForm
        downloadAction={handleSubmit}
        testIdPrefix={testIdPrefix}
      />
    </div>
  );
}
