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

package org.onap.sdc.workflow.services.impl.mappers;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.Date;
import org.junit.jupiter.api.Test;
import org.onap.sdc.common.versioning.persistence.types.InternalVersion;
import org.onap.sdc.common.versioning.services.types.Version;
import org.onap.sdc.common.versioning.services.types.VersionStatus;
import org.onap.sdc.workflow.services.types.WorkflowVersion;
import org.onap.sdc.workflow.services.types.WorkflowVersionState;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

@SpringJUnitConfig(classes = VersionMapperTest.VersionMapperSpringTestConfig.class)
public class VersionMapperTest {

    @Configuration
    @ComponentScan(basePackageClasses = {VersionMapper.class, VersionStateMapper.class})
    public static class VersionMapperSpringTestConfig { }

    @Autowired
    VersionMapper versionMapper;

    @Test
    public void shouldMapVersionToWorkflowVersion() {
        Version version = createVersion();
        WorkflowVersion mappedWorkflowVersion = versionMapper.fromVersion(version);
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
        Version mappedVersion = new Version();
        versionMapper.toVersion(workflowVersion, mappedVersion);
        assertEquals(mappedVersion.getDescription(), workflowVersion.getDescription());

    }

    private Version createVersion() {
        InternalVersion version = new InternalVersion();
        version.setId("version_id");
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
