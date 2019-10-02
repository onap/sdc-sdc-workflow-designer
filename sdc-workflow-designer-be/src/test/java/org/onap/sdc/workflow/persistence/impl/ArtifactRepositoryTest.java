/*
 * Copyright © 2016-2018 European Support Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.onap.sdc.workflow.persistence.impl;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.verify;
import static org.onap.sdc.common.zusammen.services.ZusammenElementUtil.buildStructuralElement;

import com.amdocs.zusammen.adaptor.inbound.api.types.item.Element;
import com.amdocs.zusammen.adaptor.inbound.api.types.item.ElementInfo;
import com.amdocs.zusammen.adaptor.inbound.api.types.item.ZusammenElement;
import com.amdocs.zusammen.datatypes.Id;
import com.amdocs.zusammen.datatypes.SessionContext;
import com.amdocs.zusammen.datatypes.item.Action;
import com.amdocs.zusammen.datatypes.item.ElementContext;
import com.amdocs.zusammen.datatypes.item.Info;
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
import org.onap.sdc.common.versioning.persistence.zusammen.ZusammenSessionContextCreator;
import org.onap.sdc.common.zusammen.services.ZusammenAdaptor;
import org.onap.sdc.workflow.persistence.impl.types.WorkflowElementType;
import org.onap.sdc.workflow.persistence.types.ArtifactEntity;

@RunWith(MockitoJUnitRunner.class)
public class ArtifactRepositoryTest {

    private static final String FILE_NAME_PROPERTY = "fileName";
    private static final String FILE_NAME = "fileName.txt";
    private static final String ITEM1_ID = "item_id_1";
    private static final String VERSION1_ID = "version_id_1";
    private static final SessionContext SESSION_CONTEXT = new SessionContext();


    @Mock
    private ZusammenAdaptor zusammenAdaptorMock;
    @Mock
    private ZusammenSessionContextCreator contextCreatorMock;
    @InjectMocks
    private ArtifactRepositoryImpl artifactRepository;

    @Before
    public void setUp() {
        doReturn(SESSION_CONTEXT).when(contextCreatorMock).create();
    }

    @Test
    public void shouldUpdateArtifact() throws IOException {

        InputStream inputStreamMock = IOUtils.toInputStream("some test data for my input stream", "UTF-8");
        ArtifactEntity artifactMock = new ArtifactEntity(FILE_NAME, inputStreamMock);

        artifactRepository.update(ITEM1_ID, VERSION1_ID, artifactMock);
        verify(zusammenAdaptorMock)
                .saveElement(eq(SESSION_CONTEXT), any(ElementContext.class), any(ZusammenElement.class),
                        eq("Update WorkflowVersion Artifact Element"));
    }

    @Test
    public void shouldGetArtifactWhenExist() throws IOException {

        ZusammenElement artifactElement = buildStructuralElement(WorkflowElementType.ARTIFACT.name(), Action.UPDATE);
        artifactElement.setData(IOUtils.toInputStream("some test data for my input stream", "UTF-8"));
        artifactElement.getInfo().addProperty(FILE_NAME_PROPERTY, FILE_NAME);
        Optional<Element> elementOptional = Optional.of(artifactElement);

        doReturn(elementOptional).when(zusammenAdaptorMock)
                                 .getElementByName(eq(SESSION_CONTEXT), any(ElementContext.class), isNull(),
                                         eq(WorkflowElementType.ARTIFACT.name()));

        Optional<ArtifactEntity> result = artifactRepository.get(ITEM1_ID, VERSION1_ID);
        assertTrue(result.isPresent());
        assertEquals(FILE_NAME,result.get().getFileName());
        verify(zusammenAdaptorMock).getElementByName(eq(SESSION_CONTEXT), any(ElementContext.class), isNull(),
                eq(WorkflowElementType.ARTIFACT.name()));
    }

    @Test
    public void shouldReturnOptionalEmptyWhenDoesNotExist() {

        doReturn(Optional.empty()).when(zusammenAdaptorMock)
                                 .getElementByName(eq(SESSION_CONTEXT), any(ElementContext.class), isNull(),
                                         eq(WorkflowElementType.ARTIFACT.name()));

        Optional<ArtifactEntity> result = artifactRepository.get(ITEM1_ID, VERSION1_ID);
        verify(zusammenAdaptorMock).getElementByName(eq(SESSION_CONTEXT), any(ElementContext.class), isNull(),
                eq(WorkflowElementType.ARTIFACT.name()));
        assertFalse(result.isPresent());
    }

    @Test
    public void shouldCreateArtifactStructure() {
        artifactRepository.createStructure(ITEM1_ID, VERSION1_ID);
        verify(zusammenAdaptorMock)
                .saveElement(eq(SESSION_CONTEXT), any(ElementContext.class), any(ZusammenElement.class),
                        eq("Create WorkflowVersion Artifact Element"));
    }

    @Test
    public void shouldDeleteArtifact() {
        artifactRepository.delete(ITEM1_ID,VERSION1_ID);
        verify(zusammenAdaptorMock).saveElement(eq(SESSION_CONTEXT), any(ElementContext.class), any(ZusammenElement.class),
                eq("Delete WorkflowVersion Artifact Data"));
    }

    @Test
    public void shouldReturnTrueIfExists() {
        ElementInfo elementInfo = new ElementInfo();
        elementInfo.setId(new Id("test_id"));
        Info info = new Info();
        info.addProperty(FILE_NAME_PROPERTY, "test_fileName");
        elementInfo.setInfo(info);

        doReturn(Optional.of(elementInfo)).when(zusammenAdaptorMock)
                             .getElementInfoByName(eq(SESSION_CONTEXT), any(ElementContext.class), isNull(),
                                     eq(WorkflowElementType.ARTIFACT.name()));

        assertTrue(artifactRepository.isExist(ITEM1_ID, VERSION1_ID));
    }

}
