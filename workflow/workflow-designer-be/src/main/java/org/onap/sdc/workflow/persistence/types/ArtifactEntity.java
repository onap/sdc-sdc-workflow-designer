package org.onap.sdc.workflow.persistence.types;

import java.io.InputStream;
import lombok.Data;

@Data
public class ArtifactEntity {

    private String fileName;
    private InputStream artifactData;

    public ArtifactEntity(String fileName, InputStream artifactData) {
        this.fileName = fileName;
        this.artifactData = artifactData;
    }
}
