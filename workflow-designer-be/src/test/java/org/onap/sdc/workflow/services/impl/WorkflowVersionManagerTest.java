package org.onap.sdc.workflow.services.impl;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.MockitoJUnitRunner;
import org.onap.sdc.workflow.services.exceptions.VersionNotFoundException;
import org.openecomp.sdc.versioning.VersioningManager;
import org.openecomp.sdc.versioning.dao.types.Version;
import org.openecomp.sdc.versioning.types.VersionCreationMethod;

@RunWith(MockitoJUnitRunner.class)
public class WorkflowVersionManagerTest {


    private static final String ITEM1_ID = "item_id_1";
    private static final String VERSION1_ID = "version_id_1";
    private static final String VERSION2_ID = "version_id_2";
    private List<Version> versionList;

    @Mock
    private VersioningManager versioningManagerMock;

    @Spy
    @InjectMocks
    private WorkflowVersionManagerImpl workflowVersionManager;

    @Before
    public void setUp(){
        versionList = Arrays.asList( new Version(VERSION1_ID),new Version(VERSION2_ID));
    }


    @Test(expected = VersionNotFoundException.class)
    public void shouldThrowExceptionWhenVersionDontExist(){
        Version nonExistingVersion = new Version(VERSION1_ID);
        doThrow(new RuntimeException()).when(versioningManagerMock).get(ITEM1_ID, nonExistingVersion);
        workflowVersionManager.get(ITEM1_ID, nonExistingVersion);
    }

    @Test
    public void shouldReturnWorkflowVersionWhenExist(){
        Version version = new Version(VERSION1_ID);
        doReturn(version).when(versioningManagerMock).get(ITEM1_ID,version);
        workflowVersionManager.get(ITEM1_ID,version);
        verify(versioningManagerMock).get(ITEM1_ID,version);
    }

    @Test
    public void shouldReturnWorkflowVersionList(){
        doReturn(versionList).when(versioningManagerMock).list(ITEM1_ID);
        Collection<Version> result = workflowVersionManager.list(ITEM1_ID);
        verify(versioningManagerMock).list(ITEM1_ID);
        assertEquals(versionList,result);
    }

    @Test
    public void shouldUpdateWorkflowVersion(){
        Version version = new Version(VERSION1_ID);
        workflowVersionManager.update(ITEM1_ID,version);
        verify(versioningManagerMock).updateVersion(ITEM1_ID,version);
    }

    @Test
    public void shouldCreateWorkflowVersion(){
        Version version = new Version();
        workflowVersionManager.create(ITEM1_ID,version);
        verify(versioningManagerMock).create(ITEM1_ID,version, VersionCreationMethod.major);
        verify(workflowVersionManager).getLatestVersion(ITEM1_ID);
    }



}
