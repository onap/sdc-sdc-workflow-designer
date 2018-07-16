package org.onap.sdc.workflow.services.impl;

import static org.junit.Assert.assertEquals;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.onap.sdc.workflow.persistence.types.WorkflowVersionState.CERTIFIED;
import static org.onap.sdc.workflow.persistence.types.WorkflowVersionState.DRAFT;

import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import org.apache.commons.io.IOUtils;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.ArgumentMatcher;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.onap.sdc.workflow.api.types.VersionRequestDto;
import org.onap.sdc.workflow.persistence.ArtifactRepository;
import org.onap.sdc.workflow.persistence.types.ArtifactEntity;
import org.onap.sdc.workflow.persistence.types.WorkflowVersion;
import org.onap.sdc.workflow.persistence.types.WorkflowVersionState;
import org.onap.sdc.workflow.services.exceptions.EntityNotFoundException;
import org.onap.sdc.workflow.services.exceptions.VersionCreationException;
import org.onap.sdc.workflow.services.exceptions.VersionStateModificationException;
import org.onap.sdc.workflow.services.impl.mappers.VersionMapper;
import org.onap.sdc.workflow.services.impl.mappers.VersionStateMapper;
import org.openecomp.sdc.versioning.VersioningManager;
import org.openecomp.sdc.versioning.dao.types.Version;
import org.openecomp.sdc.versioning.dao.types.VersionStatus;
import org.openecomp.sdc.versioning.types.VersionCreationMethod;
import org.springframework.mock.web.MockMultipartFile;

@RunWith(MockitoJUnitRunner.class)
public class WorkflowVersionManagerImplTest {

    private static final String ITEM1_ID = "item_id_1";
    private static final String VERSION1_ID = "version_id_1";
    private static final String VERSION2_ID = "version_id_2";

    @Mock
    private VersioningManager versioningManagerMock;
    @Mock
    private ArtifactRepository artifactRepositoryMock;
    @Mock
    private VersionMapper versionMapperMock;
    @Mock
    private VersionStateMapper versionStateMapperMock;
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
        doReturn(version).when(versioningManagerMock).get(ITEM1_ID, version);
        workflowVersionManager.get(ITEM1_ID, VERSION1_ID);
        verify(versioningManagerMock).get(ITEM1_ID, version);
    }

    @Test
    public void shouldReturnWorkflowVersionList() {
        List<Version> versionList = Arrays.asList(new Version(VERSION1_ID), new Version(VERSION2_ID));
        versionList.forEach(version -> {
            version.setBaseId("baseVersionId");
            version.setDescription("Version description");
            version.setName("name");
            version.setCreationTime(new Date());
            version.setModificationTime(new Date());
        });
        doReturn(versionList).when(versioningManagerMock).list(ITEM1_ID);
        workflowVersionManager.list(ITEM1_ID);
        verify(versioningManagerMock).list(ITEM1_ID);
        verify(versionMapperMock, times(2)).versionToWorkflowVersion(any(Version.class));
    }

    @Test
    public void shouldUpdateWorkflowVersion() {
        Version retrievedVersion = new Version(VERSION1_ID);
        retrievedVersion.setName("1.0");
        retrievedVersion.setDescription("WorkflowVersion description");
        retrievedVersion.setStatus(VersionStatus.Draft);
        doReturn(retrievedVersion).when(versioningManagerMock).get(eq(ITEM1_ID), eqVersion(VERSION1_ID));
        doReturn(DRAFT).when(versionStateMapperMock).versionStatusToWorkflowVersionState(retrievedVersion.getStatus());

        WorkflowVersion inputVersion = new WorkflowVersion(VERSION1_ID);
        inputVersion.setName("1.0");
        inputVersion.setDescription("WorkflowVersion description updated");

        Version mappedInputVersion = new Version(VERSION1_ID);
        mappedInputVersion.setName("1.0");
        mappedInputVersion.setDescription("WorkflowVersion description updated");
        doReturn(mappedInputVersion).when(versionMapperMock).workflowVersionToVersion(inputVersion);

        ArgumentCaptor<Version> versionArgCaptor = ArgumentCaptor.forClass(Version.class);
        workflowVersionManager.update(ITEM1_ID, inputVersion);

        verify(versioningManagerMock).updateVersion(eq(ITEM1_ID), versionArgCaptor.capture());
        Version captorVersion = versionArgCaptor.getValue();
        assertEquals("1.0", captorVersion.getName());
        assertEquals("WorkflowVersion description updated", captorVersion.getDescription());
        assertEquals(VersionStatus.Draft, captorVersion.getStatus());
        verify(versioningManagerMock).publish(ITEM1_ID, mappedInputVersion, "Update version");
    }

    @Test
    public void shouldCreateWorkflowVersion() {
        Version version = new Version(VERSION1_ID);
        version.setDescription("version desc");
        doReturn(version).when(versioningManagerMock).create(ITEM1_ID, version, VersionCreationMethod.major);
        VersionRequestDto workflowVersion = new VersionRequestDto();
        workflowVersion.setDescription("version desc");
        workflowVersionManager.create(ITEM1_ID, workflowVersion);
        verify(versioningManagerMock).create(ITEM1_ID, version, VersionCreationMethod.major);

    }

    @Test(expected = VersionCreationException.class)
    public void shouldTrowExceptionWhenDraftVersionExists() {
        VersionRequestDto versionRequestDto = new VersionRequestDto();
        versionRequestDto.setBaseVersionId(VERSION2_ID);

        Version baseVersion = new Version(VERSION2_ID);
        baseVersion.setStatus(VersionStatus.Draft);
        List<Version> versions = Collections.singletonList(baseVersion);
        doReturn(versions).when(versioningManagerMock).list(ITEM1_ID);

        workflowVersionManager.create(ITEM1_ID, versionRequestDto);
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

        workflowVersionManager.updateState(ITEM1_ID, VERSION1_ID, CERTIFIED);
    }

    @Test
    public void updateState() {
        Version retrievedVersion = new Version(VERSION1_ID);
        retrievedVersion.setStatus(VersionStatus.Draft);
        doReturn(retrievedVersion).when(versioningManagerMock).get(eq(ITEM1_ID), eqVersion(VERSION1_ID));
        doReturn(DRAFT).when(versionStateMapperMock).versionStatusToWorkflowVersionState(VersionStatus.Draft);
        doReturn(VersionStatus.Certified).when(versionStateMapperMock).workflowVersionStateToVersionStatus(CERTIFIED);

        ArgumentCaptor<Version> versionArgCaptor = ArgumentCaptor.forClass(Version.class);
        workflowVersionManager.updateState(ITEM1_ID, VERSION1_ID, CERTIFIED);

        verify(versioningManagerMock).updateVersion(eq(ITEM1_ID), versionArgCaptor.capture());
        assertEquals(VersionStatus.Certified, versionArgCaptor.getValue().getStatus());
        verify(versioningManagerMock)
                .publish(eq(ITEM1_ID), eqVersion(VERSION1_ID), eq("Update version state from DRAFT to CERTIFIED"));
    }

    @Test
    public void shouldUploadArtifact() {
        Version version = new Version(VERSION1_ID);
        version.setStatus(VersionStatus.Draft);
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

    private static Version eqVersion(String versionId) {
        return argThat(new EqVersion(versionId));
    }

    private static class EqVersion implements ArgumentMatcher<Version> {

        private final String versionId;

        EqVersion(String versionId) {
            this.versionId = versionId;
        }

        @Override
        public boolean matches(Version version) {
            return versionId.equals(version.getId());
        }
    }

}