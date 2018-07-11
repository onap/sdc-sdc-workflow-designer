package org.onap.sdc.workflow.persistence;


import java.util.Optional;
import org.onap.sdc.workflow.persistence.types.ArtifactEntity;


public interface ArtifactRepository {

    void update(String id, String versionId,ArtifactEntity artifactEntity);

    Optional<ArtifactEntity> get(String id, String versionId);

    void createStructure(String id, String versionId);

    void delete(String id, String versionId);

}
