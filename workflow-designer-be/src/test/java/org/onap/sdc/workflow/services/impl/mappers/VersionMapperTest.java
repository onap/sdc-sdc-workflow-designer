package org.onap.sdc.workflow.services.impl.mappers;

import static org.junit.Assert.assertEquals;

import java.util.Date;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.onap.sdc.workflow.persistence.types.WorkflowVersion;
import org.onap.sdc.workflow.persistence.types.WorkflowVersionState;
import org.openecomp.sdc.versioning.dao.types.Version;
import org.openecomp.sdc.versioning.dao.types.VersionStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@ContextConfiguration(classes = VersionMapperTest.VersionMapperSpringTestConfig.class)
@RunWith(SpringJUnit4ClassRunner.class)
public class VersionMapperTest {

    @Configuration
    @ComponentScan(basePackageClasses = {VersionMapper.class, VersionStateMapper.class})
    public static class VersionMapperSpringTestConfig { }

    @Autowired
    VersionMapper versionMapper;


    @Test
    public void shouldMapVersionToWorkflowVersion() {
        Version version = createVersion();
        WorkflowVersion mappedWorkflowVersion = versionMapper.versionToWorkflowVersion(version);
        assertEquals(mappedWorkflowVersion.getId(), version.getId());
        assertEquals(mappedWorkflowVersion.getBaseId(), version.getBaseId());
        assertEquals(mappedWorkflowVersion.getDescription(), version.getDescription());
        assertEquals(mappedWorkflowVersion.getName(), version.getName());
        assertEquals(mappedWorkflowVersion.getCreationTime(), version.getCreationTime());
        assertEquals(mappedWorkflowVersion.getModificationTime(), version.getModificationTime());
    }

    @Test
    public void shouldMapWorkflowVersionToVersion() {
        WorkflowVersion workflowVersion = createWorkflowVersion();
        Version mappedVersion = versionMapper.workflowVersionToVersion(workflowVersion);
        assertEquals(mappedVersion.getId(), workflowVersion.getId());
        assertEquals(mappedVersion.getBaseId(), workflowVersion.getBaseId());
        assertEquals(mappedVersion.getDescription(), workflowVersion.getDescription());
        assertEquals(mappedVersion.getName(), workflowVersion.getName());
        assertEquals(mappedVersion.getCreationTime(), workflowVersion.getCreationTime());
        assertEquals(mappedVersion.getModificationTime(), workflowVersion.getModificationTime());

    }

    private Version createVersion() {
        Version version = new Version("version_id");
        version.setBaseId("base_version_id");
        version.setName("1.0");
        version.setCreationTime(new Date());
        version.setModificationTime(new Date());
        version.setDescription("version_description");
        version.setStatus(VersionStatus.Draft);

        return version;

    }

    private WorkflowVersion createWorkflowVersion() {
        WorkflowVersion workflowVersion = new WorkflowVersion();
        workflowVersion.setId("wf_version_id");
        workflowVersion.setBaseId("wf_base_version_id");
        workflowVersion.setName("1.0");
        workflowVersion.setCreationTime(new Date());
        workflowVersion.setModificationTime(new Date());
        workflowVersion.setDescription("version_description");
        workflowVersion.setState(WorkflowVersionState.CERTIFIED);

        return workflowVersion;
    }
}
