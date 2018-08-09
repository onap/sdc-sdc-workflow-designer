package org.onap.sdc.workflow.persistence.impl;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.isNull;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.verify;
import static org.openecomp.core.zusammen.api.ZusammenUtil.buildStructuralElement;

import com.amdocs.zusammen.adaptor.inbound.api.types.item.Element;
import com.amdocs.zusammen.adaptor.inbound.api.types.item.ZusammenElement;
import com.amdocs.zusammen.datatypes.Id;
import com.amdocs.zusammen.datatypes.SessionContext;
import com.amdocs.zusammen.datatypes.item.Action;
import com.amdocs.zusammen.datatypes.item.ElementContext;
import java.io.IOException;
import java.io.InputStream;
import java.util.Optional;
import org.apache.commons.io.IOUtils;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.onap.sdc.workflow.persistence.types.ArtifactEntity;
import org.onap.sdc.workflow.persistence.impl.types.WorkflowElementType;
import org.openecomp.core.zusammen.api.ZusammenAdaptor;
import org.openecomp.sdc.common.session.SessionContextProviderFactory;

@RunWith(MockitoJUnitRunner.class)
public class ArtifactRepositoryTest {

    private static final String FILE_NAME_PROPERTY = "fileName";
    private static final String FILE_NAME = "fileName.txt";
    private static final String ITEM1_ID = "item_id_1";
    private static final String VERSION1_ID = "version_id_1";


    @Mock
    private ZusammenAdaptor zusammenAdaptorMock;

    @InjectMocks
    private ArtifactRepositoryImpl artifactRepository;

    @Before
    public void setUp() {
        SessionContextProviderFactory.getInstance().createInterface().create("test_user", "workflow");
    }

    @Test
    public void shouldUpdateArtifact() throws IOException {

        InputStream inputStreamMock = IOUtils.toInputStream("some test data for my input stream", "UTF-8");
        ArtifactEntity artifactMock = new ArtifactEntity(FILE_NAME, inputStreamMock);

        artifactRepository.update(ITEM1_ID, VERSION1_ID, artifactMock);
        verify(zusammenAdaptorMock)
                .saveElement(any(SessionContext.class), any(ElementContext.class), any(ZusammenElement.class),
                        eq("Update WorkflowVersion Artifact Element"));
    }

    @Test
    public void shouldGetArtifactWhenExist() throws IOException {

        ZusammenElement artifactElement = buildStructuralElement(WorkflowElementType.ARTIFACT.name(), Action.UPDATE);
        artifactElement.setData(IOUtils.toInputStream("some test data for my input stream", "UTF-8"));
        artifactElement.getInfo().addProperty(FILE_NAME_PROPERTY, FILE_NAME);
        Optional<Element> elementOptional = Optional.of(artifactElement);

        doReturn(elementOptional).when(zusammenAdaptorMock)
                                 .getElementByName(any(SessionContext.class), any(ElementContext.class), isNull(Id.class),
                                         eq(WorkflowElementType.ARTIFACT.name()));

        Optional<ArtifactEntity> result = artifactRepository.get(ITEM1_ID, VERSION1_ID);
        assertTrue(result.isPresent());
        assertEquals(FILE_NAME,result.get().getFileName());
        verify(zusammenAdaptorMock).getElementByName(any(SessionContext.class), any(ElementContext.class), isNull(Id.class),
                eq(WorkflowElementType.ARTIFACT.name()));
    }

    @Test
    public void shouldCreateArtifactStructure() {
        artifactRepository.createStructure(ITEM1_ID, VERSION1_ID);
        verify(zusammenAdaptorMock)
                .saveElement(any(SessionContext.class), any(ElementContext.class), any(ZusammenElement.class),
                        eq("Create WorkflowVersion Artifact Element"));
    }

    @Test
    public void shouldDeleteArtifact(){
        artifactRepository.delete(ITEM1_ID,VERSION1_ID);
        verify(zusammenAdaptorMock).saveElement(any(SessionContext.class), any(ElementContext.class), any(ZusammenElement.class),
                eq("Delete WorkflowVersion Artifact Data"));
    }

}
