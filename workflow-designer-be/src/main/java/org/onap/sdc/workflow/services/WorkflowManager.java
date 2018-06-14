package org.onap.sdc.workflow.services;

import java.util.Collection;
import org.onap.sdc.workflow.persistence.types.Workflow;

public interface WorkflowManager {

    Collection<Workflow> list();

    Workflow get(Workflow workflow);

    void create(Workflow workflow);

    void update(Workflow workflow);
}
