package org.onap.sdc.workflow.services.impl.mappers;

import static org.junit.Assert.assertEquals;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.onap.sdc.workflow.services.types.WorkflowVersionState;
import org.openecomp.sdc.versioning.dao.types.VersionStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@ContextConfiguration(classes = VersionStateMapperTest.VersionStatusMapperSpringTestConfig.class)
@RunWith(SpringJUnit4ClassRunner.class)
public class VersionStateMapperTest {

    @Configuration
    @ComponentScan(basePackageClasses = {VersionStateMapper.class})
    public static class VersionStatusMapperSpringTestConfig { }


    @Autowired
    VersionStateMapper versionStateMapper;

    @Test
    public void shouldMapCertifiedVersionStatusToWorkflowVersionStatus() {
        WorkflowVersionState mappedVersionStatus =
                versionStateMapper.versionStatusToWorkflowVersionState(VersionStatus.Certified);
        assertEquals(WorkflowVersionState.CERTIFIED, mappedVersionStatus);
    }

    @Test
    public void shouldMapDraftVersionStatusToWorkflowVersionStatus() {
        WorkflowVersionState mappedVersionStatus =
                versionStateMapper.versionStatusToWorkflowVersionState(VersionStatus.Draft);
        assertEquals(WorkflowVersionState.DRAFT, mappedVersionStatus);
    }

    @Test
    public void shouldMapDeletedVersionStatusToWorkflowVersionStatus() {
        WorkflowVersionState mappedVersionStatus =
                versionStateMapper.versionStatusToWorkflowVersionState(VersionStatus.Deleted);
        assertEquals(WorkflowVersionState.DRAFT, mappedVersionStatus);
    }

    @Test
    public void shouldMapLockedVersionStatusToWorkflowVersionStatus() {
        WorkflowVersionState mappedVersionStatus =
                versionStateMapper.versionStatusToWorkflowVersionState(VersionStatus.Locked);
        assertEquals(WorkflowVersionState.DRAFT, mappedVersionStatus);
    }

    @Test
    public void shouldMapDeprecatedVersionStatusToWorkflowVersionStatus() {
        WorkflowVersionState mappedVersionStatus =
                versionStateMapper.versionStatusToWorkflowVersionState(VersionStatus.Deprecated);
        assertEquals(WorkflowVersionState.DRAFT, mappedVersionStatus);
    }

    @Test
    public void shouldMapCertifiedWorkflowVersionStatusToVersionStatus() {
        VersionStatus mappedVersionStatus =
                versionStateMapper.workflowVersionStateToVersionStatus(WorkflowVersionState.CERTIFIED);
        assertEquals(VersionStatus.Certified, mappedVersionStatus);
    }

    @Test
    public void shouldMapDraftWorkflowVersionStatusToVersionStatus() {
        VersionStatus mappedVersionStatus =
                versionStateMapper.workflowVersionStateToVersionStatus(WorkflowVersionState.DRAFT);
        assertEquals(VersionStatus.Draft, mappedVersionStatus);
    }
}