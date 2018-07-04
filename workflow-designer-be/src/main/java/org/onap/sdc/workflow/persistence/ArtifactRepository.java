package org.onap.sdc.workflow.persistence;


import java.io.InputStream;
import java.util.Optional;
import org.openecomp.sdc.versioning.dao.types.Version;


public interface ArtifactRepository {

    void updateArtifact(String id, Version version,String fileName,InputStream artifactData);

    Optional<InputStream> getArtifactData(String id, Version version);

    Optional<String> getArtifactFileName(String id, Version version);

    void createArtifactStructure(String id, Version version);

}
