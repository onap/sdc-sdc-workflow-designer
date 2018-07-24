package org.onap.sdc.workflow.persistence.impl;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.eq;
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
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mapstruct.ap.internal.util.Collections;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.MockitoJUnitRunner;
import org.onap.sdc.workflow.persistence.types.ParameterEntity;
import org.onap.sdc.workflow.persistence.types.ParameterPropertyName;
import org.onap.sdc.workflow.persistence.types.ParameterRole;
import org.onap.sdc.workflow.persistence.types.ParameterType;
import org.onap.sdc.workflow.persistence.types.WorkflowElementType;
import org.openecomp.core.zusammen.api.ZusammenAdaptor;
import org.openecomp.sdc.common.session.SessionContextProviderFactory;

@RunWith(MockitoJUnitRunner.class)
public class ParameterRepositoryTest {

    private static final String ITEM1_ID = "item_id_1";
    private static final String VERSION1_ID = "version_id_1";
    private static final String PARAMETER1_ID = "parameter_id_1";
    private static final String PARAMETER2_ID = "parameter_id_2";
    private static final String PARAMETERS_PARENT_ID = "parameters_id";


    @Mock
    private ZusammenAdaptor zusammenAdaptorMock;
    @Spy
    @InjectMocks
    private ParameterRepositoryImpl parameterRepository;

    @Before
    public void setUp() {
        SessionContextProviderFactory.getInstance().createInterface().create("test_user", "workflow");
    }

    @Test
    public void shouldGetParameterById() {

        ElementInfo element = new ElementInfo();
        element.setId(new Id(PARAMETER1_ID));
        Info info = new Info();
        info.setName("testInput");
        info.addProperty(ParameterPropertyName.TYPE.name(), ParameterType.FLOAT.name());
        info.addProperty(ParameterPropertyName.mandatory.name(), true);
        element.setInfo(info);
        doReturn(Optional.of(element)).when(zusammenAdaptorMock)
                                      .getElementInfo(any(SessionContext.class), any(ElementContext.class),
                                              eq(new Id(PARAMETER1_ID)));
        ParameterEntity result = parameterRepository.get(ITEM1_ID, VERSION1_ID, PARAMETER1_ID);
        verify(zusammenAdaptorMock)
                .getElementInfo(any(SessionContext.class), any(ElementContext.class), eq(new Id(PARAMETER1_ID)));
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
                .saveElement(any(SessionContext.class), any(ElementContext.class), any(ZusammenElement.class),
                        eq("Update WorkflowVersion Parameter"));

    }

    @Test
    public void shouldCreateParameterStructure() {
        parameterRepository.createStructure(ITEM1_ID, VERSION1_ID);
        verify(zusammenAdaptorMock)
                .saveElement(any(SessionContext.class), any(ElementContext.class), any(ZusammenElement.class),
                        eq("Create WorkflowVersion INPUTS Element"));
        verify(zusammenAdaptorMock)
                .saveElement(any(SessionContext.class), any(ElementContext.class), any(ZusammenElement.class),
                        eq("Create WorkflowVersion OUTPUTS Element"));
    }

    @Test
    public void shouldDeleteParameter() {
        parameterRepository.delete(ITEM1_ID, VERSION1_ID, PARAMETER1_ID);
        verify(zusammenAdaptorMock)
                .saveElement(any(SessionContext.class), any(ElementContext.class), any(ZusammenElement.class),
                        eq("Delete Parameter with id parameter_id_1"));
    }


    @Test
    public void shouldListParametersByType() {

        ElementInfo parameter1 = new ElementInfo();
        parameter1.setId(new Id(PARAMETER1_ID));
        Info info1 = new Info();
        info1.setName("input1");
        info1.addProperty(ParameterPropertyName.TYPE.name(), "INTEGER");
        info1.addProperty(ParameterPropertyName.mandatory.name(), true);
        parameter1.setInfo(info1);
        ElementInfo parameter2 = new ElementInfo();
        parameter2.setId(new Id(PARAMETER2_ID));
        Info info2 = new Info();
        info2.setName("input2");
        info2.addProperty(ParameterPropertyName.TYPE.name(), "STRING");
        info2.addProperty(ParameterPropertyName.mandatory.name(), false);
        parameter2.setInfo(info2);
        Collection<ElementInfo> parameters = Collections.asSet(parameter1, parameter2);
        doReturn(parameters).when(zusammenAdaptorMock)
                            .listElementsByName(any(SessionContext.class), any(ElementContext.class), isNull(),
                                    eq(WorkflowElementType.INPUTS.name()));
        Collection<ParameterEntity> results = parameterRepository.list(ITEM1_ID, VERSION1_ID, ParameterRole.INPUT);

        verify(zusammenAdaptorMock).listElementsByName(any(SessionContext.class), any(ElementContext.class), isNull(),
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
                                 .getElementInfoByName(any(SessionContext.class), any(ElementContext.class), isNull(),
                                         eq(WorkflowElementType.INPUTS.name()));

        parameterRepository.deleteAll(ITEM1_ID, VERSION1_ID, ParameterRole.INPUT);
        verify(zusammenAdaptorMock)
                .saveElement(any(SessionContext.class), any(ElementContext.class), any(ZusammenElement.class),
                        eq("Delete all INPUT"));
    }

}
