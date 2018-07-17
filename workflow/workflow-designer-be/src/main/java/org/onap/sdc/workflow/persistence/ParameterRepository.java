package org.onap.sdc.workflow.persistence;

import java.util.Collection;
import org.onap.sdc.workflow.persistence.types.ParameterEntity;
import org.onap.sdc.workflow.persistence.types.ParameterRole;


public interface ParameterRepository {

    void createStructure(String id, String versionId);

    Collection<ParameterEntity> list(String id, String versionId, ParameterRole role);

    void deleteAll(String id, String versionId, ParameterRole role);

    ParameterEntity get(String id, String versionId, String parameterId);

    void delete(String id, String versionId, String parameterId);

    ParameterEntity create(String id, String versionId , ParameterRole role, ParameterEntity parameter);

    void update(String id, String versionId, ParameterRole role, ParameterEntity parameter);
}
