package org.onap.sdc.workflow.api.mapping;

import static org.junit.Assert.assertEquals;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.onap.sdc.workflow.persistence.types.WorkflowVersionStatus;
import org.onap.sdc.workflow.services.mappers.VersionStatusMapper;
import org.openecomp.sdc.versioning.dao.types.VersionStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@ContextConfiguration(classes = VersionStatusMapperTest.VersionStatusMapperSpringTestConfig.class)
@RunWith(SpringJUnit4ClassRunner.class)
public class VersionStatusMapperTest {

    @Configuration
    @ComponentScan(basePackageClasses = {VersionStatusMapper.class})
    public static class VersionStatusMapperSpringTestConfig { }


    @Autowired
    VersionStatusMapper versionStatusMapper;

    @Test
    public void shouldMapCertifiedVersionStatusToWorkflowVersionStatus() {
        WorkflowVersionStatus mappedVersionStatus =
                versionStatusMapper.versionStatusToWorkflowVersionStatus(VersionStatus.Certified);
        assertEquals(WorkflowVersionStatus.CERTIFIED, mappedVersionStatus);
    }

    @Test
    public void shouldMapDraftVersionStatusToWorkflowVersionStatus() {
        WorkflowVersionStatus mappedVersionStatus =
                versionStatusMapper.versionStatusToWorkflowVersionStatus(VersionStatus.Draft);
        assertEquals(WorkflowVersionStatus.DRAFT, mappedVersionStatus);
    }

    @Test
    public void shouldMapDeletedVersionStatusToWorkflowVersionStatus() {
        WorkflowVersionStatus mappedVersionStatus =
                versionStatusMapper.versionStatusToWorkflowVersionStatus(VersionStatus.Deleted);
        assertEquals(WorkflowVersionStatus.DRAFT, mappedVersionStatus);
    }

    @Test
    public void shouldMapLockedVersionStatusToWorkflowVersionStatus() {
        WorkflowVersionStatus mappedVersionStatus =
                versionStatusMapper.versionStatusToWorkflowVersionStatus(VersionStatus.Locked);
        assertEquals(WorkflowVersionStatus.DRAFT, mappedVersionStatus);
    }

    @Test
    public void shouldMapDeprecatedVersionStatusToWorkflowVersionStatus() {
        WorkflowVersionStatus mappedVersionStatus =
                versionStatusMapper.versionStatusToWorkflowVersionStatus(VersionStatus.Deprecated);
        assertEquals(WorkflowVersionStatus.DRAFT, mappedVersionStatus);
    }

    @Test
    public void shouldMapCertifiedWorkflowVersionStatusToVersionStatus() {
        VersionStatus mappedVersionStatus =
                versionStatusMapper.workflowVersionStatusToVersionStatus(WorkflowVersionStatus.CERTIFIED);
        assertEquals(VersionStatus.Certified, mappedVersionStatus);
    }

    @Test
    public void shouldMapDraftWorkflowVersionStatusToVersionStatus() {
        VersionStatus mappedVersionStatus =
                versionStatusMapper.workflowVersionStatusToVersionStatus(WorkflowVersionStatus.DRAFT);
        assertEquals(VersionStatus.Draft, mappedVersionStatus);
    }
}
