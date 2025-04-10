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

package org.onap.sdc.workflow.persistence.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.verify;

import com.amdocs.zusammen.adaptor.inbound.api.types.item.ElementInfo;
import com.amdocs.zusammen.adaptor.inbound.api.types.item.ZusammenElement;
import com.amdocs.zusammen.datatypes.Id;
import com.amdocs.zusammen.datatypes.SessionContext;
import com.amdocs.zusammen.datatypes.item.ElementContext;
import com.amdocs.zusammen.datatypes.item.Info;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.ap.internal.util.Collections;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.onap.sdc.common.versioning.persistence.zusammen.ZusammenSessionContextCreator;
import org.onap.sdc.common.zusammen.services.ZusammenAdaptor;
import org.onap.sdc.workflow.persistence.impl.types.ParameterPropertyName;
import org.onap.sdc.workflow.persistence.impl.types.WorkflowElementType;
import org.onap.sdc.workflow.persistence.types.ParameterEntity;
import org.onap.sdc.workflow.persistence.types.ParameterRole;
import org.onap.sdc.workflow.persistence.types.ParameterType;

@ExtendWith(MockitoExtension.class)
public class ParameterRepositoryTest {

    private static final String ITEM1_ID = "item_id_1";
    private static final String VERSION1_ID = "version_id_1";
    private static final String PARAMETER1_ID = "parameter_id_1";
    private static final String PARAMETER2_ID = "parameter_id_2";
    private static final String PARAMETERS_PARENT_ID = "parameters_id";
    private static final SessionContext SESSION_CONTEXT = new SessionContext();

    @Mock
    private ZusammenAdaptor zusammenAdaptorMock;
    @Mock
    private ZusammenSessionContextCreator contextCreatorMock;
    @Spy
    @InjectMocks
    private ParameterRepositoryImpl parameterRepository;

    @BeforeEach
    public void setUp() {
        doReturn(SESSION_CONTEXT).when(contextCreatorMock).create();
    }

    @Test
    public void shouldGetParameterById() {

        ElementInfo element = new ElementInfo();
        element.setId(new Id(PARAMETER1_ID));
        Info info = new Info();
        info.setName("testInput");
        info.addProperty(ParameterPropertyName.TYPE.name(), ParameterType.FLOAT.name());
        info.addProperty(ParameterPropertyName.MANDATORY.name(), true);
        element.setInfo(info);
        doReturn(Optional.of(element)).when(zusammenAdaptorMock)
                                      .getElementInfo(eq(SESSION_CONTEXT), any(ElementContext.class),
                                              eq(new Id(PARAMETER1_ID)));
        ParameterEntity result = parameterRepository.get(ITEM1_ID, VERSION1_ID, PARAMETER1_ID);
        verify(zusammenAdaptorMock)
                .getElementInfo(eq(SESSION_CONTEXT), any(ElementContext.class), eq(new Id(PARAMETER1_ID)));
        assertEquals("testInput", result.getName());

    }


    @Test
    public void shouldUpdateParameter() {
        ParameterEntity parameterEntityToUpdate = new ParameterEntity();
        parameterEntityToUpdate.setId(PARAMETER1_ID);
        parameterEntityToUpdate.setName("Input1");
        parameterEntityToUpdate.setMandatory(true);
        parameterEntityToUpdate.setType(ParameterType.STRING);

        parameterRepository.update(ITEM1_ID, VERSION1_ID, ParameterRole.INPUT, parameterEntityToUpdate);
        verify(zusammenAdaptorMock)
                .saveElement(eq(SESSION_CONTEXT), any(ElementContext.class), any(ZusammenElement.class),
                        eq("Update WorkflowVersion Parameter"));

    }

    @Test
    public void shouldCreateParameterStructure() {
        parameterRepository.createStructure(ITEM1_ID, VERSION1_ID);
        verify(zusammenAdaptorMock)
                .saveElement(eq(SESSION_CONTEXT), any(ElementContext.class), any(ZusammenElement.class),
                        eq("Create WorkflowVersion INPUTS Element"));
        verify(zusammenAdaptorMock)
                .saveElement(eq(SESSION_CONTEXT), any(ElementContext.class), any(ZusammenElement.class),
                        eq("Create WorkflowVersion OUTPUTS Element"));
    }

    @Test
    public void shouldDeleteParameter() {
        parameterRepository.delete(ITEM1_ID, VERSION1_ID, PARAMETER1_ID);
        verify(zusammenAdaptorMock)
                .saveElement(eq(SESSION_CONTEXT), any(ElementContext.class), any(ZusammenElement.class),
                        eq("Delete Parameter with id parameter_id_1"));
    }


    @Test
    public void shouldListParametersByType() {

        ElementInfo parameter1 = new ElementInfo();
        parameter1.setId(new Id(PARAMETER1_ID));
        Info info1 = new Info();
        info1.setName("input1");
        info1.addProperty(ParameterPropertyName.TYPE.name(), "INTEGER");
        info1.addProperty(ParameterPropertyName.MANDATORY.name(), true);
        parameter1.setInfo(info1);
        ElementInfo parameter2 = new ElementInfo();
        parameter2.setId(new Id(PARAMETER2_ID));
        Info info2 = new Info();
        info2.setName("input2");
        info2.addProperty(ParameterPropertyName.TYPE.name(), "STRING");
        info2.addProperty(ParameterPropertyName.MANDATORY.name(), false);
        parameter2.setInfo(info2);
        Collection<ElementInfo> parameters = Collections.asSet(parameter1, parameter2);
        doReturn(parameters).when(zusammenAdaptorMock)
                            .listElementsByName(eq(SESSION_CONTEXT), any(ElementContext.class), isNull(),
                                    eq(WorkflowElementType.INPUTS.name()));
        Collection<ParameterEntity> results = parameterRepository.list(ITEM1_ID, VERSION1_ID, ParameterRole.INPUT);

        verify(zusammenAdaptorMock).listElementsByName(eq(SESSION_CONTEXT), any(ElementContext.class), isNull(),
                eq(WorkflowElementType.INPUTS.name()));
        assertTrue(results.stream().anyMatch(parameterEntity -> parameterEntity.getId().equals(PARAMETER1_ID)));
        assertTrue(results.stream().anyMatch(parameterEntity -> parameterEntity.getId().equals(PARAMETER2_ID)));
    }

    @Test
    public void shouldDeleteAllParametersByType() {
        ElementInfo parameterParentElement = new ElementInfo();
        parameterParentElement.setId(new Id(PARAMETERS_PARENT_ID));
        ElementInfo parameter1 = new ElementInfo();
        parameter1.setId(new Id(PARAMETER1_ID));
        ElementInfo parameter2 = new ElementInfo();
        parameter2.setId(new Id(PARAMETER2_ID));
        parameterParentElement.setSubElements(new ArrayList<>());
        parameterParentElement.getSubElements().add(parameter1);
        parameterParentElement.getSubElements().add(parameter2);

        Optional<ElementInfo> elementOptional = Optional.of(parameterParentElement);

        doReturn(elementOptional).when(zusammenAdaptorMock)
                                 .getElementInfoByName(eq(SESSION_CONTEXT), any(ElementContext.class), isNull(),
                                         eq(WorkflowElementType.INPUTS.name()));

        parameterRepository.deleteAll(ITEM1_ID, VERSION1_ID, ParameterRole.INPUT);
        verify(zusammenAdaptorMock)
                .saveElement(eq(SESSION_CONTEXT), any(ElementContext.class), any(ZusammenElement.class),
                        eq("Delete all INPUT"));
    }

    @Test
    public void shouldFailIfParentElementDoesNotExist() {
        assertThrows(IllegalStateException.class, () -> {
            doReturn(Optional.empty()).when(zusammenAdaptorMock)
                    .getElementInfoByName(eq(SESSION_CONTEXT), any(ElementContext.class), isNull(),
                            eq(WorkflowElementType.INPUTS.name()));
            parameterRepository.deleteAll(ITEM1_ID, VERSION1_ID, ParameterRole.INPUT);
        });
    }

    @Test
    public void shouldCreateParameter() {
        ZusammenElement zusammenParentElement = new ZusammenElement();
        zusammenParentElement.setElementId(new Id(PARAMETERS_PARENT_ID));
        ZusammenElement zusammenElement = new ZusammenElement();
        zusammenElement.setElementId(new Id(PARAMETER1_ID));
        zusammenParentElement.addSubElement(zusammenElement);
        doReturn(zusammenParentElement).when(zusammenAdaptorMock)
                                       .saveElement(eq(SESSION_CONTEXT), any(ElementContext.class),
                                               any(ZusammenElement.class), eq("Create WorkflowVersion Parameter Element"));
        ParameterEntity parameterEntity = new ParameterEntity("test_input_parameter");
        parameterEntity.setType(ParameterType.INTEGER);
        parameterEntity.setMandatory(true);

        ParameterEntity returnedParameter =
                parameterRepository.create(ITEM1_ID, VERSION1_ID, ParameterRole.INPUT, parameterEntity);
        verify(zusammenAdaptorMock)
                .saveElement(eq(SESSION_CONTEXT), any(ElementContext.class), any(ZusammenElement.class),
                        eq("Create WorkflowVersion Parameter Element"));
        assertEquals(PARAMETER1_ID, returnedParameter.getId());
    }

}
