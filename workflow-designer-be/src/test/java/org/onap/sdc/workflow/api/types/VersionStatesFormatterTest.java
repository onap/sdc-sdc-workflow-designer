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

package org.onap.sdc.workflow.api.types;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.onap.sdc.workflow.services.types.WorkflowVersionState.CERTIFIED;
import static org.onap.sdc.workflow.services.types.WorkflowVersionState.DRAFT;

import java.util.Collections;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
public class VersionStatesFormatterTest {

    @InjectMocks
    private VersionStatesFormatter versionStateSet;

    @Test
    public void setVersionStateInvalid() {
        versionStateSet.setVersionState(",,a");
        assertEquals(Collections.emptySet() ,versionStateSet.getVersionStates());
    }

    @Test
    public void setVersionStateDraft() {
        versionStateSet.setVersionState("DRAFT");
        assertEquals(Collections.singleton(DRAFT), versionStateSet.getVersionStates());
    }

    @Test
    public void setVersionStateCertified() {
        versionStateSet.setVersionState("CERTIFIED");
        assertEquals(Collections.singleton(CERTIFIED), versionStateSet.getVersionStates());
    }

    @Test
    public void setVersionStateBoth() {
        versionStateSet.setVersionState("DRAFT,CERTIFIED");
        assertEquals(Stream.of(DRAFT, CERTIFIED).collect(Collectors.toSet()), versionStateSet.getVersionStates());
    }
}
