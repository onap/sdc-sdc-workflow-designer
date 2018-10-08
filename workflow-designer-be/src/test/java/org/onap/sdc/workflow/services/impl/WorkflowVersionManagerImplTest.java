package org.onap.sdc.workflow.services.impl;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.onap.sdc.workflow.services.types.WorkflowVersionState.CERTIFIED;
import static org.onap.sdc.workflow.services.types.WorkflowVersionState.DRAFT;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.apache.commons.io.IOUtils;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.MockitoJUnitRunner;
import org.onap.sdc.workflow.persistence.ArtifactRepository;
import org.onap.sdc.workflow.persistence.ParameterRepository;
import org.onap.sdc.workflow.persistence.types.ArtifactEntity;
import org.onap.sdc.workflow.persistence.types.ParameterEntity;
import org.onap.sdc.workflow.persistence.types.ParameterRole;
import org.onap.sdc.workflow.services.exceptions.EntityNotFoundException;
import org.onap.sdc.workflow.services.exceptions.VersionCreationException;
import org.onap.sdc.workflow.services.exceptions.VersionModificationException;
import org.onap.sdc.workflow.services.exceptions.VersionStateModificationException;
import org.onap.sdc.workflow.services.impl.mappers.VersionMapper;
import org.onap.sdc.workflow.services.impl.mappers.VersionStateMapper;
import org.onap.sdc.workflow.services.types.WorkflowVersion;
import org.onap.sdc.workflow.services.types.WorkflowVersionState;
import org.openecomp.sdc.versioning.VersioningManager;
import org.openecomp.sdc.versioning.dao.types.Version;
import org.openecomp.sdc.versioning.dao.types.VersionState;
import org.openecomp.sdc.versioning.dao.types.VersionStatus;
import org.openecomp.sdc.versioning.types.VersionCreationMethod;
import org.springframework.boot.test.autoconfigure.web.client.RestClientTest;
import org.springframework.mock.web.MockMultipartFile;

@RunWith(MockitoJUnitRunner.class)
public class WorkflowVersionManagerImplTest {

    private static final String ITEM1_ID = "item_id_1";
    private static final String VERSION1_ID = "version_id_1";
    private static final String VERSION2_ID = "version_id_2";

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

    @Test(expected = EntityNotFoundException.class)
    public void shouldThrowExceptionWhenVersionDontExist() {
        Version nonExistingVersion = new Version(VERSION1_ID);
        doThrow(new RuntimeException()).when(versioningManagerMock).get(ITEM1_ID, nonExistingVersion);
        workflowVersionManager.get(ITEM1_ID, VERSION1_ID);
    }

    @Test
    public void shouldReturnWorkflowVersionWhenExist() {
        Version version = new Version(VERSION1_ID);
        WorkflowVersion workflowVersion = new WorkflowVersion(VERSION1_ID);
        doReturn(workflowVersion).when(versionMapperMock).versionToWorkflowVersion(any(Version.class));
        doReturn(version).when(versioningManagerMock).get(eq(ITEM1_ID), any(Version.class));
        doReturn(Collections.emptyList()).when(parameterRepositoryMock)
                .list(eq(ITEM1_ID), eq(VERSION1_ID), any(ParameterRole.class));
        workflowVersionManager.get(ITEM1_ID, VERSION1_ID);
        verify(versioningManagerMock).get(ITEM1_ID, version);
    }

    @Test
    public void shouldReturnWorkflowVersionList() {
        Version version1 = new Version(VERSION1_ID);
        Version version2 = new Version(VERSION2_ID);
        List<Version> versionList = Arrays.asList(version1,version2);
        doReturn(versionList).when(versioningManagerMock).list(ITEM1_ID);
        WorkflowVersion workflowVersion1 = new WorkflowVersion();
        workflowVersion1.setId(VERSION1_ID);
        workflowVersion1.setName(VERSION1_ID);
        WorkflowVersion workflowVersion2 = new WorkflowVersion();
        workflowVersion2.setId(VERSION2_ID);
        workflowVersion2.setName(VERSION2_ID);
        doReturn(workflowVersion2).when(versionMapperMock).versionToWorkflowVersion(version2);
        doReturn(Collections.emptyList()).when(parameterRepositoryMock).list(eq(ITEM1_ID),anyString(),eq(ParameterRole.INPUT));
        doReturn(Collections.emptyList()).when(parameterRepositoryMock).list(eq(ITEM1_ID),anyString(),eq(ParameterRole.OUTPUT));
        workflowVersionManager.list(ITEM1_ID, null);
        verify(versioningManagerMock).list(ITEM1_ID);
        verify(versionMapperMock, times(2)).versionToWorkflowVersion(any(Version.class));
    }

    @Test
    public void shouldReturnCertifiedWorkflowVersionList() {
        Version version1 = new Version(VERSION1_ID);
        version1.setStatus(VersionStatus.Certified);
        Version version2 = new Version(VERSION2_ID);
        version2.setStatus(VersionStatus.Draft);
        List<Version> versionList = Arrays.asList(version1, version2);
        doReturn(versionList).when(versioningManagerMock).list(ITEM1_ID);
        WorkflowVersion workflowVersion1 = new WorkflowVersion();
        workflowVersion1.setId(VERSION1_ID);
        workflowVersion1.setName(VERSION1_ID);
        WorkflowVersion workflowVersion2 = new WorkflowVersion();
        workflowVersion2.setId(VERSION2_ID);
        workflowVersion2.setName(VERSION2_ID);
        doReturn(workflowVersion1).when(versionMapperMock).versionToWorkflowVersion(version1);
        doReturn(Collections.emptyList()).when(parameterRepositoryMock)
                                   .list(eq(ITEM1_ID), anyString(), eq(ParameterRole.INPUT));
        doReturn(Collections.emptyList()).when(parameterRepositoryMock)
                                   .list(eq(ITEM1_ID), anyString(), eq(ParameterRole.OUTPUT));
        doReturn(VersionStatus.Certified).when(versionStateMapperMock)
                                                                .workflowVersionStateToVersionStatus(
                                                                       WorkflowVersionState.CERTIFIED);

        assertEquals(1,  workflowVersionManager.list(ITEM1_ID, Collections.singleton(WorkflowVersionState.CERTIFIED)).size());
        verify(versioningManagerMock).list(ITEM1_ID);
        verify(versionMapperMock, times(1)).versionToWorkflowVersion(any(Version.class));

    }

    @Test
    public void shouldUpdateWorkflowVersion() {
        String updatedDescription = "WorkflowVersion description updated";
        Version retrievedVersion = new Version(VERSION1_ID);
        retrievedVersion.setName("1.0");
        retrievedVersion.setDescription("WorkflowVersion description");
        retrievedVersion.setStatus(VersionStatus.Draft);
        VersionState versionState = new VersionState();
        versionState.setDirty(true);
        retrievedVersion.setState(versionState);
        doReturn(retrievedVersion).when(versioningManagerMock).get(eq(ITEM1_ID), eqVersion(VERSION1_ID));
        doReturn(DRAFT).when(versionStateMapperMock).versionStatusToWorkflowVersionState(retrievedVersion.getStatus());

        WorkflowVersion inputVersion = new WorkflowVersion(VERSION1_ID);
        inputVersion.setName("1.0");
        inputVersion.setDescription(updatedDescription);
        ParameterEntity toBeCreated = new ParameterEntity("Input1");
        inputVersion.setInputs(Collections.singleton(toBeCreated));
        ParameterEntity toBeUpdated = new ParameterEntity("Output1");
        inputVersion.setOutputs(Collections.singleton(toBeUpdated));
        doReturn(Collections.emptyList()).when(parameterRepositoryMock).list(ITEM1_ID,VERSION1_ID,ParameterRole.INPUT);
        ParameterEntity toBeDeleted = new ParameterEntity("Output2");
        toBeDeleted.setId("parameter_id_1");
        Collection<ParameterEntity> currentOutputs = Arrays.asList(toBeDeleted, toBeUpdated);
        doReturn(currentOutputs).when(parameterRepositoryMock).list(ITEM1_ID,VERSION1_ID,ParameterRole.OUTPUT);

        Version mappedInputVersion = new Version(VERSION1_ID);
        mappedInputVersion.setName("1.0");
        mappedInputVersion.setDescription(updatedDescription);
        doReturn(mappedInputVersion).when(versionMapperMock).workflowVersionToVersion(inputVersion);

        ArgumentCaptor<Version> versionArgCaptor = ArgumentCaptor.forClass(Version.class);
        workflowVersionManager.update(ITEM1_ID, inputVersion);

        verify(versioningManagerMock).updateVersion(eq(ITEM1_ID), versionArgCaptor.capture());
        Version captorVersion = versionArgCaptor.getValue();
        assertEquals("1.0", captorVersion.getName());
        assertEquals(updatedDescription, captorVersion.getDescription());
        assertEquals(VersionStatus.Draft, captorVersion.getStatus());
        verify(versioningManagerMock).publish(ITEM1_ID, mappedInputVersion, "Update version");

        verify(parameterRepositoryMock).delete(ITEM1_ID,VERSION1_ID,"parameter_id_1");
        verify(parameterRepositoryMock).create(ITEM1_ID,VERSION1_ID,ParameterRole.INPUT,toBeCreated);
        verify(parameterRepositoryMock).update(ITEM1_ID,VERSION1_ID,ParameterRole.OUTPUT,toBeUpdated);

    }


    @Test
    public void shouldCreateWorkflowVersion() {
        Version version = new Version(VERSION1_ID);
        version.setDescription("version desc");
        doReturn(version).when(versioningManagerMock).create(ITEM1_ID, version, VersionCreationMethod.major);
        WorkflowVersion versionRequest = new WorkflowVersion();
        versionRequest.setDescription("version desc");
        versionRequest.setInputs(Collections.emptyList());
        versionRequest.setOutputs(Collections.emptyList());
        WorkflowVersion workflowVersion = new WorkflowVersion(VERSION1_ID);
        doReturn(workflowVersion).when(workflowVersionManager).get(ITEM1_ID, VERSION1_ID);
        workflowVersionManager.create(ITEM1_ID, null, versionRequest);
        verify(versioningManagerMock).create(ITEM1_ID, version, VersionCreationMethod.major);
    }

    @Test(expected = VersionCreationException.class)
    public void shouldTrowExceptionWhenDraftVersionExists() {
        WorkflowVersion versionRequestDto = new WorkflowVersion();

        Version baseVersion = new Version(VERSION2_ID);
        baseVersion.setStatus(VersionStatus.Draft);
        List<Version> versions = Collections.singletonList(baseVersion);
        doReturn(versions).when(versioningManagerMock).list(ITEM1_ID);

        workflowVersionManager.create(ITEM1_ID, VERSION2_ID, versionRequestDto);
    }

    @Test(expected = VersionCreationException.class)
    public void shouldTrowExceptionWhenInputsSupplied() {
        WorkflowVersion versionRequestDto = new WorkflowVersion();
        versionRequestDto.setInputs(Collections.singleton(new ParameterEntity()));
        Version baseVersion = new Version(VERSION2_ID);
        baseVersion.setStatus(VersionStatus.Draft);
        List<Version> versions = Collections.singletonList(baseVersion);
        doReturn(versions).when(versioningManagerMock).list(ITEM1_ID);

        workflowVersionManager.create(ITEM1_ID, VERSION2_ID, versionRequestDto);
    }

    @Test(expected = EntityNotFoundException.class)
    public void getStateOfNonExisting() {
        doThrow(new RuntimeException()).when(versioningManagerMock).get(eq(ITEM1_ID), eqVersion(VERSION1_ID));
        workflowVersionManager.getState(ITEM1_ID, VERSION1_ID);
    }

    @Test
    public void getState() {
        Version version = new Version(VERSION1_ID);
        version.setStatus(VersionStatus.Certified);
        doReturn(version).when(versioningManagerMock).get(eq(ITEM1_ID), eqVersion(VERSION1_ID));
        doReturn(CERTIFIED).when(versionStateMapperMock).versionStatusToWorkflowVersionState(version.getStatus());

        WorkflowVersionState state = workflowVersionManager.getState(ITEM1_ID, VERSION1_ID);
        assertEquals(CERTIFIED, state);
    }

    @Test(expected = EntityNotFoundException.class)
    public void updateStateOfNonExisting() {
        doThrow(new RuntimeException()).when(versioningManagerMock).get(eq(ITEM1_ID), eqVersion(VERSION1_ID));
        workflowVersionManager.updateState(ITEM1_ID, VERSION1_ID, CERTIFIED);
    }

    @Test(expected = VersionStateModificationException.class)
    public void updateStateToCurrentState() {
        Version version = new Version(VERSION1_ID);
        version.setStatus(VersionStatus.Draft);
        doReturn(version).when(versioningManagerMock).get(eq(ITEM1_ID), eqVersion(VERSION1_ID));
        doReturn(DRAFT).when(versionStateMapperMock).versionStatusToWorkflowVersionState(version.getStatus());

        workflowVersionManager.updateState(ITEM1_ID, VERSION1_ID, DRAFT);
    }

    @Test(expected = VersionStateModificationException.class)
    public void updateStateWhenCertified() {
        Version version = new Version(VERSION1_ID);
        version.setStatus(VersionStatus.Certified);
        doReturn(version).when(versioningManagerMock).get(eq(ITEM1_ID), eqVersion(VERSION1_ID));
        doReturn(CERTIFIED).when(versionStateMapperMock).versionStatusToWorkflowVersionState(version.getStatus());
        doThrow(new RuntimeException()).when(versioningManagerMock)
                .submit(eq(ITEM1_ID), eqVersion(VERSION1_ID), anyString());

        workflowVersionManager.updateState(ITEM1_ID, VERSION1_ID, CERTIFIED);
    }

    @Test
    public void updateState() {
        Version retrievedVersion = new Version(VERSION1_ID);
        retrievedVersion.setStatus(VersionStatus.Draft);
        doReturn(retrievedVersion).when(versioningManagerMock).get(eq(ITEM1_ID), eqVersion(VERSION1_ID));
        doReturn(DRAFT).when(versionStateMapperMock).versionStatusToWorkflowVersionState(VersionStatus.Draft);

        workflowVersionManager.updateState(ITEM1_ID, VERSION1_ID, CERTIFIED);

        verify(versioningManagerMock).submit(eq(ITEM1_ID), eqVersion(VERSION1_ID), anyString());
    }

    @Test
    public void shouldUploadArtifact() {
        Version version = new Version(VERSION1_ID);
        version.setStatus(VersionStatus.Draft);
        VersionState versionState = new VersionState();
        versionState.setDirty(false);
        version.setState(versionState);
        doReturn(version).when(versioningManagerMock).get(eq(ITEM1_ID), eqVersion(VERSION1_ID));
        doReturn(DRAFT).when(versionStateMapperMock).versionStatusToWorkflowVersionState(version.getStatus());

        MockMultipartFile mockFile = new MockMultipartFile("data", "filename.txt", "text/plain", "some xml".getBytes());
        workflowVersionManager.uploadArtifact(ITEM1_ID, VERSION1_ID, mockFile);

        verify(artifactRepositoryMock).update(eq(ITEM1_ID), eq(VERSION1_ID), any(ArtifactEntity.class));
    }

    @Test(expected = EntityNotFoundException.class)
    public void shouldThrowExceptionWhenArtifactNotFound() {
        doReturn(new Version(VERSION1_ID)).when(versioningManagerMock).get(eq(ITEM1_ID), eqVersion(VERSION1_ID));

        doReturn(Optional.empty()).when(artifactRepositoryMock).get(ITEM1_ID, VERSION1_ID);
        workflowVersionManager.getArtifact(ITEM1_ID, VERSION1_ID);
    }

    @Test
    public void shouldReturnArtifact() throws IOException {
        doReturn(new Version(VERSION1_ID)).when(versioningManagerMock).get(eq(ITEM1_ID), eqVersion(VERSION1_ID));

        InputStream inputStreamMock = IOUtils.toInputStream("some test data for my input stream", "UTF-8");
        ArtifactEntity artifactMock = new ArtifactEntity("fileName.txt", inputStreamMock);
        doReturn(Optional.of(artifactMock)).when(artifactRepositoryMock).get(ITEM1_ID, VERSION1_ID);
        ArtifactEntity returnedArtifact = workflowVersionManager.getArtifact(ITEM1_ID, VERSION1_ID);
        assertEquals(artifactMock, returnedArtifact);
    }

    @Test(expected = VersionModificationException.class)
    public void shouldThrowExceptionInDeleteArtifactWhenVersionIsCertified() {
        Version version = new Version(VERSION1_ID);
        doReturn(version).when(versioningManagerMock).get(ITEM1_ID,version);
        WorkflowVersion workflowVersion = new WorkflowVersion(VERSION1_ID);
        workflowVersion.setState(WorkflowVersionState.CERTIFIED);
        doReturn(workflowVersion).when(versionMapperMock).versionToWorkflowVersion(version);
        workflowVersionManager.deleteArtifact(ITEM1_ID,VERSION1_ID);
    }

    @Test
    public void shouldDeleteArtifact() {
        Version version = new Version(VERSION1_ID);
        doReturn(version).when(versioningManagerMock).get(ITEM1_ID,version);
        WorkflowVersion workflowVersion = new WorkflowVersion(VERSION1_ID);
        doReturn(workflowVersion).when(versionMapperMock).versionToWorkflowVersion(version);
        workflowVersionManager.deleteArtifact(ITEM1_ID,VERSION1_ID);
        verify(artifactRepositoryMock).delete(ITEM1_ID,VERSION1_ID);
        verify(versioningManagerMock).publish(ITEM1_ID,version,"Delete Artifact");
    }

    private static Version eqVersion(String versionId) {
        return argThat(version -> versionId.equals(version.getId()));
    }
}