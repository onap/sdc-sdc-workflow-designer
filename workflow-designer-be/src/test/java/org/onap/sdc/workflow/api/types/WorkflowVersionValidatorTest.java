/*
 * Copyright © 2018 European Support Limited
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

import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.fail;

import java.util.Arrays;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.onap.sdc.workflow.persistence.types.ParameterEntity;
import org.onap.sdc.workflow.persistence.types.WorkflowVersion;
import org.onap.sdc.workflow.services.exceptions.VersionValidationException;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
public class WorkflowVersionValidatorTest {

    private static final String ITEM1_ID = "item_id_1";

    @InjectMocks
    private WorkflowVersionValidator versionValidator;

    @Test
    public void invalidInputs() {
        WorkflowVersion workflowVersion = new WorkflowVersion();
        workflowVersion.setDescription("version description");
        ParameterEntity input = new ParameterEntity();
        input.setName("input1");
        workflowVersion.setInputs(Arrays.asList(input, input));
        try {
            versionValidator.validate(ITEM1_ID, workflowVersion);
            fail("Should have thrown VersionValidationException but did not!");

        } catch (VersionValidationException ex) {
            assertEquals(String.format("Error creating or modifying version for workflow with id %s: %s", ITEM1_ID,
                    "Input name must be unique"), ex.getMessage());
        }
    }

    @Test
    public void invalidOtputs(){
        WorkflowVersion workflowVersion = new WorkflowVersion();
        workflowVersion.setDescription("version description");
        ParameterEntity output = new ParameterEntity();
        output.setName("output1");
        workflowVersion.setOutputs(Arrays.asList(output, output));
        try {
            versionValidator.validate(ITEM1_ID, workflowVersion);
            fail("Should have thrown VersionValidationException but did not!");

        } catch (VersionValidationException ex) {
            assertEquals(String.format("Error creating or modifying version for workflow with id %s: %s", ITEM1_ID,
                    "Output name must be unique"), ex.getMessage());
        }
    }
}
