package org.onap.sdc.workflow.persistence;


import java.io.InputStream;
import java.util.Optional;
import org.onap.sdc.workflow.persistence.types.ArtifactEntity;


public interface ArtifactRepository {

    void updateArtifact(String id, String versionId,String fileName,InputStream artifactData);

    Optional<ArtifactEntity> getArtifact(String id, String versionId);

    void createArtifactStructure(String id, String versionId);

}
