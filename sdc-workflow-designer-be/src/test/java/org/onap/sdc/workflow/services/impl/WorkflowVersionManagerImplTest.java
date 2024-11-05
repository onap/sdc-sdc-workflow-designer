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

package org.onap.sdc.workflow.services.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.onap.sdc.workflow.TestUtil.createRetrievedVersion;
import static org.onap.sdc.workflow.services.types.WorkflowVersionState.CERTIFIED;
import static org.onap.sdc.workflow.services.types.WorkflowVersionState.DRAFT;

import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import org.apache.commons.io.IOUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.onap.sdc.common.versioning.persistence.types.InternalItem;
import org.onap.sdc.common.versioning.persistence.types.InternalVersion;
import org.onap.sdc.common.versioning.services.ItemManager;
import org.onap.sdc.common.versioning.services.VersioningManager;
import org.onap.sdc.common.versioning.services.types.ItemStatus;
import org.onap.sdc.common.versioning.services.types.Version;
import org.onap.sdc.common.versioning.services.types.VersionCreationMethod;
import org.onap.sdc.common.versioning.services.types.VersionState;
import org.onap.sdc.common.versioning.services.types.VersionStatus;
import org.onap.sdc.workflow.persistence.ArtifactRepository;
import org.onap.sdc.workflow.persistence.ParameterRepository;
import org.onap.sdc.workflow.persistence.types.ArtifactEntity;
import org.onap.sdc.workflow.persistence.types.ParameterEntity;
import org.onap.sdc.workflow.persistence.types.ParameterRole;
import org.onap.sdc.workflow.services.exceptions.EntityNotFoundException;
import org.onap.sdc.workflow.services.exceptions.VersionCreationException;
import org.onap.sdc.workflow.services.exceptions.VersionModificationException;
import org.onap.sdc.workflow.services.exceptions.VersionStateModificationException;
import org.onap.sdc.workflow.services.exceptions.VersionStateModificationMissingArtifactException;
import org.onap.sdc.workflow.services.exceptions.WorkflowModificationException;
import org.onap.sdc.workflow.services.impl.mappers.VersionMapper;
import org.onap.sdc.workflow.services.impl.mappers.VersionStateMapper;
import org.onap.sdc.workflow.services.types.WorkflowVersion;
import org.onap.sdc.workflow.services.types.WorkflowVersionState;
import org.springframework.mock.web.MockMultipartFile;

@ExtendWith(MockitoExtension.class)
public class WorkflowVersionManagerImplTest {

    private static final String ITEM1_ID = "item_id_1";
    private static final String VERSION1_ID = "version_id_1";
    private static final String VERSION2_ID = "version_id_2";

    @Mock
    private ItemManager itemManagerMock;
    @Mock
    private VersioningManager versioningManagerMock;
    @Mock
    private ParameterRepository parameterRepositoryMock;
    @Mock
    private ArtifactRepository artifactRepositoryMock;
    @Mock
    private VersionMapper versionMapperMock;
    @Mock
    private VersionStateMapper versionStateMapperMock;
    @Spy
    @InjectMocks
    private WorkflowVersionManagerImpl workflowVersionManager;

    @Test
    public void shouldThrowExceptionWhenVersionDontExist() {
        assertThrows(EntityNotFoundException.class, () -> {
            doThrow(new RuntimeException()).when(versioningManagerMock).get(ITEM1_ID, VERSION1_ID);
            workflowVersionManager.get(ITEM1_ID, VERSION1_ID);
        });
    }

    @Test
    public void shouldThrowExceptionWhenCreatingVersionForArchivedWorkflow() {
        assertThrows(WorkflowModificationException.class, () -> {
            InternalItem mockItem = new InternalItem();
            mockItem.setId(ITEM1_ID);
            mockItem.setStatus(ItemStatus.ARCHIVED);
            doReturn(mockItem).when(itemManagerMock).get(ITEM1_ID);
            workflowVersionManager.create(ITEM1_ID, null, new WorkflowVersion(VERSION1_ID));
        });
    }

    @Test
    public void shouldThrowExceptionWhenUpdatingVersionForArchivedWorkflow() {
        assertThrows(WorkflowModificationException.class, () -> {
            InternalItem mockItem = new InternalItem();
            mockItem.setId(ITEM1_ID);
            mockItem.setStatus(ItemStatus.ARCHIVED);
            doReturn(mockItem).when(itemManagerMock).get(ITEM1_ID);
            workflowVersionManager.update(ITEM1_ID, new WorkflowVersion(VERSION1_ID));
        });
    }

    @Test
    public void shouldThrowExceptionWhenUploadingArtifactForArchivedWorkflow() {
        assertThrows(WorkflowModificationException.class, () -> {
            InternalItem mockItem = new InternalItem();
            mockItem.setId(ITEM1_ID);
            mockItem.setStatus(ItemStatus.ARCHIVED);
            doReturn(mockItem).when(itemManagerMock).get(ITEM1_ID);
            MockMultipartFile mockFile = new MockMultipartFile("data", "filename.txt", "text/plain", "some xml".getBytes());
            workflowVersionManager.uploadArtifact(ITEM1_ID, VERSION1_ID, mockFile);
        });
    }

    @Test
    public void shouldThrowExceptionWhenDeletingArtifactForArchivedWorkflow() {
        assertThrows(WorkflowModificationException.class, () -> {
            InternalItem mockItem = new InternalItem();
            mockItem.setId(ITEM1_ID);
            mockItem.setStatus(ItemStatus.ARCHIVED);
            doReturn(mockItem).when(itemManagerMock).get(ITEM1_ID);
            workflowVersionManager.deleteArtifact(ITEM1_ID, VERSION1_ID);
        });
    }

    @Test
    public void shouldReturnWorkflowVersionWhenExist() {
        WorkflowVersion workflowVersion = new WorkflowVersion(VERSION1_ID);
        doReturn(workflowVersion).when(versionMapperMock).fromVersion(any(Version.class));
        doReturn(new Version()).when(versioningManagerMock).get(ITEM1_ID, VERSION1_ID);
        doReturn(Collections.emptyList()).when(parameterRepositoryMock)
                .list(eq(ITEM1_ID), eq(VERSION1_ID), any(ParameterRole.class));
        workflowVersionManager.get(ITEM1_ID, VERSION1_ID);
        verify(versioningManagerMock).get(ITEM1_ID, VERSION1_ID);
    }

    @Test
    public void shouldReturnWorkflowVersionList() {
        InternalVersion version1 = createRetrievedVersion(VERSION1_ID, VersionStatus.Certified);
        InternalVersion version2 = createRetrievedVersion(VERSION2_ID, VersionStatus.Draft);
        List<Version> versionList = Arrays.asList(version1, version2);
        doReturn(versionList).when(versioningManagerMock).list(ITEM1_ID);

        WorkflowVersion workflowVersion1 = new WorkflowVersion();
        workflowVersion1.setId(VERSION1_ID);
        workflowVersion1.setName(VERSION1_ID);
        doReturn(workflowVersion1).when(versionMapperMock).fromVersion(version1);

        WorkflowVersion workflowVersion2 = new WorkflowVersion();
        workflowVersion2.setId(VERSION2_ID);
        workflowVersion2.setName(VERSION2_ID);
        doReturn(workflowVersion2).when(versionMapperMock).fromVersion(version2);

        doReturn(Collections.emptyList()).when(parameterRepositoryMock)
                .list(eq(ITEM1_ID), anyString(), eq(ParameterRole.INPUT));
        doReturn(Collections.emptyList()).when(parameterRepositoryMock)
                .list(eq(ITEM1_ID), anyString(), eq(ParameterRole.OUTPUT));

        workflowVersionManager.list(ITEM1_ID, null);
        verify(versioningManagerMock).list(ITEM1_ID);
        verify(versionMapperMock, times(2)).fromVersion(any(Version.class));
    }

    @Test
    public void shouldReturnCertifiedWorkflowVersionList() {
        InternalVersion version1 = createRetrievedVersion(VERSION1_ID, VersionStatus.Certified);
        InternalVersion version2 = createRetrievedVersion(VERSION2_ID, VersionStatus.Draft);
        List<Version> versionList = Arrays.asList(version1, version2);

        doReturn(versionList).when(versioningManagerMock).list(ITEM1_ID);
        WorkflowVersion workflowVersion1 = new WorkflowVersion();
        workflowVersion1.setId(VERSION1_ID);
        workflowVersion1.setName(VERSION1_ID);
        doReturn(workflowVersion1).when(versionMapperMock).fromVersion(version1);

        doReturn(Collections.emptyList()).when(parameterRepositoryMock)
                .list(eq(ITEM1_ID), anyString(), eq(ParameterRole.INPUT));
        doReturn(Collections.emptyList()).when(parameterRepositoryMock)
                .list(eq(ITEM1_ID), anyString(), eq(ParameterRole.OUTPUT));
        doReturn(VersionStatus.Certified).when(versionStateMapperMock)
                .workflowVersionStateToVersionStatus(WorkflowVersionState.CERTIFIED);

        assertEquals(1,
                workflowVersionManager.list(ITEM1_ID, Collections.singleton(WorkflowVersionState.CERTIFIED)).size());
        verify(versioningManagerMock).list(ITEM1_ID);
        verify(versionMapperMock, times(1)).fromVersion(any(Version.class));

    }

    @Test
    public void shouldUpdateWorkflowVersion() {
        doNothing().when(workflowVersionManager).validateWorkflowStatus(ITEM1_ID);
        String updatedDescription = "WorkflowVersion description updated";
        InternalVersion retrievedVersion = new InternalVersion();
        retrievedVersion.setId(VERSION1_ID);
        retrievedVersion.setName("1.0");
        retrievedVersion.setDescription("WorkflowVersion description");
        retrievedVersion.setStatus(VersionStatus.Draft);
        VersionState versionState = new VersionState();
        versionState.setDirty(true);
        retrievedVersion.setState(versionState);
        doReturn(retrievedVersion).when(versioningManagerMock).get(ITEM1_ID, VERSION1_ID);
        doReturn(DRAFT).when(versionStateMapperMock).versionStatusToWorkflowVersionState(retrievedVersion.getStatus());
        doReturn(Collections.emptyList()).when(parameterRepositoryMock)
                .list(ITEM1_ID, VERSION1_ID, ParameterRole.INPUT);

        WorkflowVersion inputVersion = new WorkflowVersion(VERSION1_ID);
        inputVersion.setName("1.0");
        inputVersion.setDescription(updatedDescription);
        ParameterEntity toBeCreated = new ParameterEntity("Input1");
        inputVersion.setInputs(Collections.singleton(toBeCreated));
        ParameterEntity toBeUpdated = new ParameterEntity("Output1");
        inputVersion.setOutputs(Collections.singleton(toBeUpdated));

        ParameterEntity toBeDeleted = new ParameterEntity("Output2");
        toBeDeleted.setId("parameter_id_1");
        Collection<ParameterEntity> currentOutputs = Arrays.asList(toBeDeleted, toBeUpdated);
        doReturn(currentOutputs).when(parameterRepositoryMock).list(ITEM1_ID, VERSION1_ID, ParameterRole.OUTPUT);

        doAnswer(invocationOnMock -> {
            WorkflowVersion workflowVersion = invocationOnMock.getArgument(0);
            Version version = invocationOnMock.getArgument(1);
            version.setDescription(workflowVersion.getDescription());
            return null;
        }).when(versionMapperMock).toVersion(inputVersion, retrievedVersion);

        ArgumentCaptor<Version> versionArgCaptor = ArgumentCaptor.forClass(Version.class);
        workflowVersionManager.update(ITEM1_ID, inputVersion);

        verify(versioningManagerMock).update(eq(ITEM1_ID), eq(VERSION1_ID), versionArgCaptor.capture());
        Version captorVersion = versionArgCaptor.getValue();
        assertEquals("1.0", captorVersion.getName());
        assertEquals(updatedDescription, captorVersion.getDescription());
        assertEquals(VersionStatus.Draft, captorVersion.getStatus());
        verify(versioningManagerMock).publish(ITEM1_ID, VERSION1_ID, "Update version");

        verify(parameterRepositoryMock).delete(ITEM1_ID, VERSION1_ID, "parameter_id_1");
        verify(parameterRepositoryMock).create(ITEM1_ID, VERSION1_ID, ParameterRole.INPUT, toBeCreated);
        verify(parameterRepositoryMock).update(ITEM1_ID, VERSION1_ID, ParameterRole.OUTPUT, toBeUpdated);

    }


    @Test
    public void shouldCreateWorkflowVersion() {
        doNothing().when(workflowVersionManager).validateWorkflowStatus(ITEM1_ID);
        Version version = createRetrievedVersion(VERSION1_ID, VersionStatus.Draft);
        doReturn(version).when(versioningManagerMock)
                .create(eq(ITEM1_ID), isNull(), any(Version.class), eq(VersionCreationMethod.major));

        WorkflowVersion versionRequest = new WorkflowVersion();
        versionRequest.setDescription("version desc");
        versionRequest.setInputs(Collections.emptyList());
        versionRequest.setOutputs(Collections.emptyList());
        WorkflowVersion workflowVersion = new WorkflowVersion(VERSION1_ID);
        doReturn(workflowVersion).when(workflowVersionManager).get(ITEM1_ID, VERSION1_ID);

        workflowVersionManager.create(ITEM1_ID, null, versionRequest);
    }

    @Test
    public void shouldTrowExceptionWhenDraftVersionExists() {
        assertThrows(VersionCreationException.class, () -> {
            doNothing().when(workflowVersionManager).validateWorkflowStatus(ITEM1_ID);
            WorkflowVersion versionRequestDto = new WorkflowVersion();

            Version baseVersion = createRetrievedVersion(VERSION2_ID, VersionStatus.Draft);
            List<Version> versions = Collections.singletonList(baseVersion);
            doReturn(versions).when(versioningManagerMock).list(ITEM1_ID);

            workflowVersionManager.create(ITEM1_ID, VERSION2_ID, versionRequestDto);
        });
    }

    @Test
    public void shouldTrowExceptionWhenInputsSupplied() {
        assertThrows(VersionCreationException.class, () -> {
            doNothing().when(workflowVersionManager).validateWorkflowStatus(ITEM1_ID);
            WorkflowVersion versionRequestDto = new WorkflowVersion();
            versionRequestDto.setInputs(Collections.singleton(new ParameterEntity()));
            InternalVersion baseVersion = createRetrievedVersion(VERSION2_ID, VersionStatus.Draft);
            List<Version> versions = Collections.singletonList(baseVersion);
            doReturn(versions).when(versioningManagerMock).list(ITEM1_ID);

            workflowVersionManager.create(ITEM1_ID, VERSION2_ID, versionRequestDto);
        });
    }


    @Test
    public void getStateOfNonExisting() {
        assertThrows(EntityNotFoundException.class, () -> {
            doThrow(new RuntimeException()).when(versioningManagerMock).get(ITEM1_ID, VERSION1_ID);
            workflowVersionManager.getState(ITEM1_ID, VERSION1_ID);
        });
    }

    @Test
    public void getState() {
        InternalVersion version = createRetrievedVersion(VERSION1_ID, VersionStatus.Certified);
        doReturn(version).when(versioningManagerMock).get(ITEM1_ID, VERSION1_ID);
        doReturn(CERTIFIED).when(versionStateMapperMock).versionStatusToWorkflowVersionState(version.getStatus());

        WorkflowVersionState state = workflowVersionManager.getState(ITEM1_ID, VERSION1_ID);
        assertEquals(CERTIFIED, state);
    }

    @Test
    public void updateStateOfNonExisting() {
        assertThrows(EntityNotFoundException.class, () -> {
            doThrow(new RuntimeException()).when(versioningManagerMock).get(ITEM1_ID, VERSION1_ID);
            workflowVersionManager.updateState(ITEM1_ID, VERSION1_ID, CERTIFIED);
        });
    }

    @Test
    public void updateStateToCurrentState() {
        assertThrows(VersionStateModificationException.class, () -> {
            InternalVersion version = createRetrievedVersion(VERSION1_ID, VersionStatus.Draft);
            doReturn(version).when(versioningManagerMock).get(ITEM1_ID, VERSION1_ID);
            doReturn(DRAFT).when(versionStateMapperMock).versionStatusToWorkflowVersionState(version.getStatus());

            workflowVersionManager.updateState(ITEM1_ID, VERSION1_ID, DRAFT);
        });
    }

    @Test
    public void updateStateWhenCertified() {
        assertThrows(VersionStateModificationMissingArtifactException.class, () -> {
            InternalVersion version = createRetrievedVersion(VERSION1_ID, VersionStatus.Certified);
            doReturn(version).when(versioningManagerMock).get(ITEM1_ID, VERSION1_ID);
            doReturn(CERTIFIED).when(versionStateMapperMock).versionStatusToWorkflowVersionState(version.getStatus());

            workflowVersionManager.updateState(ITEM1_ID, VERSION1_ID, CERTIFIED);
        });
    }

    @Test
    public void shouldFailUpdateStateWhenNoArtifact() {
        Throwable exception = assertThrows(VersionStateModificationMissingArtifactException.class, () -> {
            InternalVersion retrievedVersion = createRetrievedVersion(VERSION1_ID, VersionStatus.Draft);
            doReturn(retrievedVersion).when(versioningManagerMock).get(ITEM1_ID, VERSION1_ID);
            doReturn(DRAFT).when(versionStateMapperMock).versionStatusToWorkflowVersionState(VersionStatus.Draft);
            workflowVersionManager.updateState(ITEM1_ID, VERSION1_ID, CERTIFIED);

            verify(versioningManagerMock).updateStatus(ITEM1_ID, VERSION1_ID, VersionStatus.Certified, anyString());
        });
        assertTrue(exception.getMessage().contains(String.format(
                VersionStateModificationMissingArtifactException.WORKFLOW_MODIFICATION_STATE_MISSING_ARTIFACT_TEMPLATE,
                ITEM1_ID, VERSION1_ID, DRAFT, CERTIFIED)));
    }

    @Test
    public void shouldSuccessUpdateStateWhenArtifactExist() {
        InternalVersion retrievedVersion = createRetrievedVersion(VERSION1_ID, VersionStatus.Draft);
        doReturn(retrievedVersion).when(versioningManagerMock).get(ITEM1_ID, VERSION1_ID);
        doReturn(DRAFT).when(versionStateMapperMock).versionStatusToWorkflowVersionState(VersionStatus.Draft);
        doReturn(true).when(artifactRepositoryMock).isExist(ITEM1_ID, VERSION1_ID);
        workflowVersionManager.updateState(ITEM1_ID, VERSION1_ID, CERTIFIED);
        verify(versioningManagerMock)
                .updateStatus(eq(ITEM1_ID), eq(VERSION1_ID), eq(VersionStatus.Certified), anyString());
    }

    @Test
    public void shouldUploadArtifact() {
        doNothing().when(workflowVersionManager).validateWorkflowStatus(ITEM1_ID);
        InternalVersion version = createRetrievedVersion(VERSION1_ID, VersionStatus.Draft);
        VersionState versionState = new VersionState();
        versionState.setDirty(false);
        version.setState(versionState);
        doReturn(version).when(versioningManagerMock).get(ITEM1_ID, VERSION1_ID);
        doReturn(DRAFT).when(versionStateMapperMock).versionStatusToWorkflowVersionState(version.getStatus());

        MockMultipartFile mockFile = new MockMultipartFile("data", "filename.txt", "text/plain", "some xml".getBytes());
        workflowVersionManager.uploadArtifact(ITEM1_ID, VERSION1_ID, mockFile);

        verify(artifactRepositoryMock).update(eq(ITEM1_ID), eq(VERSION1_ID), any(ArtifactEntity.class));
    }

    @Test
    public void shouldThrowExceptionWhenArtifactNotFound() {
        assertThrows(EntityNotFoundException.class, () -> {
            doReturn(new Version()).when(versioningManagerMock).get(ITEM1_ID, VERSION1_ID);

            doReturn(Optional.empty()).when(artifactRepositoryMock).get(ITEM1_ID, VERSION1_ID);
            workflowVersionManager.getArtifact(ITEM1_ID, VERSION1_ID);
        });
    }

    @Test
    public void shouldReturnArtifact() throws IOException {
        doReturn(new Version()).when(versioningManagerMock).get(ITEM1_ID, VERSION1_ID);

        InputStream inputStreamMock = IOUtils.toInputStream("some test data for my input stream", "UTF-8");
        ArtifactEntity artifactMock = new ArtifactEntity("fileName.txt", inputStreamMock);
        doReturn(Optional.of(artifactMock)).when(artifactRepositoryMock).get(ITEM1_ID, VERSION1_ID);
        ArtifactEntity returnedArtifact = workflowVersionManager.getArtifact(ITEM1_ID, VERSION1_ID);
        assertEquals(artifactMock, returnedArtifact);
    }

    @Test
    public void shouldThrowExceptionInDeleteArtifactWhenVersionIsCertified() {
        assertThrows(VersionModificationException.class, () -> {
            doNothing().when(workflowVersionManager).validateWorkflowStatus(ITEM1_ID);
            Version version = new Version();
            doReturn(version).when(versioningManagerMock).get(ITEM1_ID, VERSION1_ID);
            WorkflowVersion workflowVersion = new WorkflowVersion(VERSION1_ID);
            workflowVersion.setState(WorkflowVersionState.CERTIFIED);
            doReturn(workflowVersion).when(versionMapperMock).fromVersion(version);
            workflowVersionManager.deleteArtifact(ITEM1_ID, VERSION1_ID);
        });
    }

    @Test
    public void shouldNotDeleteArtifactIfNotExist() {
        doNothing().when(workflowVersionManager).validateWorkflowStatus(ITEM1_ID);
        Version version = new Version();
        doReturn(version).when(versioningManagerMock).get(ITEM1_ID, VERSION1_ID);
        WorkflowVersion workflowVersion = new WorkflowVersion(VERSION1_ID);
        doReturn(workflowVersion).when(versionMapperMock).fromVersion(version);
        workflowVersionManager.deleteArtifact(ITEM1_ID, VERSION1_ID);
        verify(artifactRepositoryMock, times(0)).delete(ITEM1_ID, VERSION1_ID);
        verify(versioningManagerMock, times(0)).publish(ITEM1_ID, VERSION1_ID, "Delete Artifact");
    }

    @Test
    public void shouldDeleteArtifactIfExist() {
        doNothing().when(workflowVersionManager).validateWorkflowStatus(ITEM1_ID);
        Version version = new Version();
        doReturn(version).when(versioningManagerMock).get(ITEM1_ID, VERSION1_ID);
        WorkflowVersion workflowVersion = new WorkflowVersion(VERSION1_ID);
        doReturn(true).when(artifactRepositoryMock).isExist(ITEM1_ID, VERSION1_ID);
        doReturn(workflowVersion).when(versionMapperMock).fromVersion(version);
        workflowVersionManager.deleteArtifact(ITEM1_ID, VERSION1_ID);
        verify(artifactRepositoryMock, times(1)).delete(ITEM1_ID, VERSION1_ID);
        verify(versioningManagerMock, times(1)).publish(ITEM1_ID, VERSION1_ID, "Delete Artifact");
    }
}
