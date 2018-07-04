package org.onap.sdc.workflow.services.impl;

import static org.junit.Assert.assertEquals;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Matchers.any;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import org.apache.commons.io.IOUtils;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.MockitoJUnitRunner;
import org.onap.sdc.workflow.api.types.VersionRequestDto;
import org.onap.sdc.workflow.persistence.ArtifactRepository;
import org.onap.sdc.workflow.persistence.types.ArtifactEntity;
import org.onap.sdc.workflow.persistence.types.VersionStatus;
import org.onap.sdc.workflow.persistence.types.WorkflowVersion;
import org.onap.sdc.workflow.services.exceptions.EntityNotFoundException;
import org.onap.sdc.workflow.services.exceptions.VersioningErrorException;
import org.onap.sdc.workflow.services.mappers.VersionMapper;
import org.openecomp.sdc.versioning.VersioningManager;
import org.openecomp.sdc.versioning.dao.types.Version;
import org.openecomp.sdc.versioning.types.VersionCreationMethod;
import org.springframework.mock.web.MockMultipartFile;

@RunWith(MockitoJUnitRunner.class)
public class WorkflowWorkflowVersionManagerTest {


    private static final String ITEM1_ID = "item_id_1";
    private static final String VERSION1_ID = "version_id_1";
    private static final String VERSION2_ID = "version_id_2";

    @Mock
    private VersionMapper versionMapperMock;

    @Mock
    private VersioningManager versioningManagerMock;

    @Mock
    private ArtifactRepository artifactRepositoryMock;

    @Spy
    @InjectMocks
    private WorkflowVersionManagerImpl workflowVersionManager;


    @Test(expected = EntityNotFoundException.class)
    public void shouldThrowExceptionWhenVersionDontExist(){
        Version nonExistingVersion = new Version(VERSION1_ID);
        WorkflowVersion nonExistingWorkflowVersion = new WorkflowVersion(VERSION1_ID);
        doThrow(new RuntimeException()).when(versioningManagerMock).get(ITEM1_ID, nonExistingVersion);
        workflowVersionManager.get(ITEM1_ID, nonExistingWorkflowVersion);
    }

    @Test
    public void shouldReturnWorkflowVersionWhenExist(){
        Version version = new Version(VERSION1_ID);
        WorkflowVersion workflowVersion = new WorkflowVersion(VERSION1_ID);
        doReturn(version).when(versioningManagerMock).get(ITEM1_ID,version);
        workflowVersionManager.get(ITEM1_ID,workflowVersion);
        verify(versioningManagerMock).get(ITEM1_ID,version);
    }

    @Test
    public void shouldReturnWorkflowVersionList(){
        List<Version> versionList =
                Arrays.asList(new Version(VERSION1_ID), new Version(VERSION2_ID));
        versionList.forEach(version -> {
            version.setBaseId("baseVersionId");
            version.setDescription("Version description");
            version.setName("name");
            version.setMajor(1);
            version.setMinor(0);
            version.setCreationTime(new Date());
            version.setModificationTime(new Date());
        });
        doReturn(versionList).when(versioningManagerMock).list(ITEM1_ID);
        workflowVersionManager.list(ITEM1_ID);
        verify(versioningManagerMock).list(ITEM1_ID);
        verify(versionMapperMock ,times(2)).versionToWorkflowVersion(any(Version.class));
    }

    @Test
    public void shouldUpdateWorkflowVersion(){
        Version version = new Version(VERSION1_ID);
        version.setName("1.0");
        version.setMinor(0);
        version.setMajor(1);
        version.setDescription("WorkflowVersion description");
        WorkflowVersion workflowVersion = new WorkflowVersion(VERSION1_ID);
        workflowVersion.setName("1.0");
        workflowVersion.setMinor(0);
        workflowVersion.setMajor(1);
        workflowVersion.setDescription("WorkflowVersion description");
        doReturn(version).when(versionMapperMock).workflowVersionToVersion(workflowVersion);
        doReturn(version).when(workflowVersionManager).mapVersionInfo(ITEM1_ID,version);
        workflowVersionManager.update(ITEM1_ID,workflowVersion);
        verify(versioningManagerMock).updateVersion(ITEM1_ID,version);
    }

    @Test
    public void shouldCreateWorkflowVersion(){
        Version version = new Version(VERSION1_ID);
        version.setDescription("version desc");
        doReturn(version).when(versioningManagerMock).create(ITEM1_ID,version, VersionCreationMethod.major);
        VersionRequestDto workflowVersion = new VersionRequestDto();
        workflowVersion.setDescription("version desc");
        workflowVersionManager.create(ITEM1_ID,workflowVersion);
        verify(versioningManagerMock).create(ITEM1_ID,version, VersionCreationMethod.major);

    }

    @Test(expected = VersioningErrorException.class)
    public void shouldTrowExceptionWhenDraftVersionExists(){
        VersionRequestDto versionRequestDto = new VersionRequestDto();
        versionRequestDto.setBaseVersionId(VERSION2_ID);
        versionRequestDto.setDescription("version desc");
        WorkflowVersion baseVersion = new WorkflowVersion(VERSION2_ID);
        baseVersion.setStatus(VersionStatus.Draft);
        doReturn(baseVersion).when(workflowVersionManager).get(ITEM1_ID,baseVersion);

        workflowVersionManager.create(ITEM1_ID,versionRequestDto);
    }

    @Test
    public void shouldUploadArtifact() {

        String mockFileName = "filename.txt";
        MockMultipartFile mockFile =
                new MockMultipartFile("data", mockFileName, "text/plain", "some xml".getBytes());
        WorkflowVersion version = new WorkflowVersion(VERSION1_ID);

        workflowVersionManager.uploadArtifact(ITEM1_ID,version,mockFile);

        verify(artifactRepositoryMock).updateArtifact(eq(ITEM1_ID),eq(VERSION1_ID),eq(mockFileName),any(ByteArrayInputStream.class));
    }

    @Test(expected = EntityNotFoundException.class)
    public void shouldThrowExceptionWhenArtifactNotFound(){
        WorkflowVersion version = new WorkflowVersion(VERSION1_ID);
        doReturn(version).when(workflowVersionManager).get(ITEM1_ID,version);
        doReturn(Optional.empty()).when(artifactRepositoryMock).getArtifact(ITEM1_ID,VERSION1_ID);
        workflowVersionManager.getArtifact(ITEM1_ID,version);
    }

    @Test
    public void shouldReturnArtifact() throws IOException {
        WorkflowVersion version = new WorkflowVersion(VERSION1_ID);
        doReturn(version).when(workflowVersionManager).get(ITEM1_ID,version);

        InputStream inputStreamMock =
                IOUtils.toInputStream("some test data for my input stream", "UTF-8");
        ArtifactEntity artifactMock = new ArtifactEntity("fileName.txt",inputStreamMock);
        doReturn(Optional.of(artifactMock)).when(artifactRepositoryMock).getArtifact(ITEM1_ID,VERSION1_ID);
        ArtifactEntity returnedArtifact = workflowVersionManager.getArtifact(ITEM1_ID, new WorkflowVersion(VERSION1_ID));
        assertEquals(artifactMock,returnedArtifact);
    }

}
