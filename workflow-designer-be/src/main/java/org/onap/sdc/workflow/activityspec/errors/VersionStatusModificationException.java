package org.onap.sdc.workflow.activityspec.errors;

import org.openecomp.sdc.versioning.dao.types.VersionStatus;

public class VersionStatusModificationException extends RuntimeException {

    public VersionStatusModificationException(String activitySpecId, String versionId, VersionStatus sourceState,
            VersionStatus targetState) {
        super(String.format("Activity spec %s, version %s: status can not be changed from %s to %s", activitySpecId,
                versionId, sourceState.name(), targetState.name()));
    }
}