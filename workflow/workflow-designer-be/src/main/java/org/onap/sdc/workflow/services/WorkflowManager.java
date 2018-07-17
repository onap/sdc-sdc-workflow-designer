package org.onap.sdc.workflow.services;

import java.util.Collection;
import org.onap.sdc.workflow.persistence.types.Workflow;
import org.springframework.data.domain.Pageable;

public interface WorkflowManager {

    Collection<Workflow> list(Pageable pageable);

    Workflow get(Workflow workflow);

    Workflow create(Workflow workflow);

    void update(Workflow workflow);
}
