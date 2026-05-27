import { useState } from "react";
import { Alert, Button } from "react-bootstrap";
import { useBackend, useBackendMutation } from "main/utils/useBackend";

export function CourseWarningBanner({
  courseId,
  orgName,
  hideBasePermissionWarning = false,
}) {
  const [isLocallyHidden, setIsLocallyHidden] = useState(false);

  const objectToExtensionMethod = (courseId) => ({
    url: `/api/courses/warnings/hideBasePermissionWarning/${courseId}`,
    method: "POST",
  });

  const mutation = useBackendMutation(
    objectToExtensionMethod,
    {
      onSuccess: () => {
        setIsLocallyHidden(true);
      },
    },
    [`/api/courses/warnings/${courseId}`],
  );

  const { data: warnings } = useBackend(
    [`/api/courses/warnings/${courseId}`],
    {
      method: "GET",
      url: `/api/courses/warnings/${courseId}`,
    },
    undefined,
    true,
    {
      placeholderData: {
        showOrganizationAgeWarning: false,
        showDefaultBasePermissions: false,
      },
      staleTime: "static",
    },
  );

  const showDefaultBasePermissionWarning =
    warnings?.showDefaultBasePermissions &&
    orgName &&
    !hideBasePermissionWarning &&
    !isLocallyHidden;

  const memberPrivilegesUrl = orgName
    ? `https://github.com/organizations/${orgName}/settings/member_privileges`
    : null;

  const handleHide = () => {
    mutation.mutate(courseId);
  };

  return (
    <>
      {warnings?.showOrganizationAgeWarning && (
        <Alert variant="warning">
          Warning: This GitHub Organization is less than 30 days old. You will
          experience difficulties enrolling more than 50 students in a day.
        </Alert>
      )}
      {showDefaultBasePermissionWarning && (
        <Alert
          variant="warning"
          data-testid="CourseWarningBanner-defaultBasePermission"
          className="d-flex justify-content-between align-items-center"
        >
          <div>
            Warning: the organization setting for Default Base Permission is not
            the recommended value of None. This means that students in the
            organization may be able to access other students&apos; private
            repos.{" "}
            <a
              href={memberPrivilegesUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="CourseWarningBanner-defaultBasePermission-link"
            >
              You can change that setting here
            </a>
            .
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleHide}
            data-testid="CourseWarningBanner-defaultBasePermission-hide-btn"
          >
            Hide
          </Button>
        </Alert>
      )}
    </>
  );
}
