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
        versionStateSet.setVersionState("aaa");
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