package org.onap.sdc.workflow.services;

import java.util.Collection;
import org.openecomp.sdc.versioning.dao.types.Version;

public interface WorkflowVersionManager {

    Collection<Version> list(String id);

    Version get(String id, Version version);

    Version create(String id, Version version);

    void update(String id,Version version);

}
