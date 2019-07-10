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
