package org.onap.sdc.workflow.persistence.impl;

import java.io.IOException;
import org.junit.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.openecomp.core.zusammen.api.ZusammenAdaptor;

public class ArtifactRepositoryTest {

    private static final String FILE_NAME_PROPERTY = "fileName";
    private static final String EMPTY_DATA = "{}";
    private static final String ITEM1_ID = "item_id_1";
    private static final String VERSION1_ID = "version_id_1";


    @Mock
    private ZusammenAdaptor zusammenAdaptorMock;

    @InjectMocks
    private ArtifactRepositoryImpl artifactRepository;

    @Test
    public void shouldUpdateArtifact() throws IOException {

    }


}
