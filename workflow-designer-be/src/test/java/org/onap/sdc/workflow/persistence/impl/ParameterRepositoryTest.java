package org.onap.sdc.workflow.persistence.impl;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.times;

import com.amdocs.zusammen.adaptor.inbound.api.types.item.ZusammenElement;
import com.amdocs.zusammen.datatypes.Id;
import com.amdocs.zusammen.datatypes.SessionContext;
import com.amdocs.zusammen.datatypes.item.ElementContext;
import com.amdocs.zusammen.datatypes.item.Info;
import java.util.Optional;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.MockitoJUnitRunner;
import org.onap.sdc.workflow.persistence.types.ParameterEntity;
import org.onap.sdc.workflow.persistence.types.ParameterPropertyName;
import org.onap.sdc.workflow.persistence.types.ParameterRole;
import org.onap.sdc.workflow.persistence.types.ParameterType;
import org.openecomp.core.zusammen.api.ZusammenAdaptor;
import org.openecomp.sdc.common.session.SessionContextProviderFactory;
import org.springframework.boot.test.autoconfigure.web.client.RestClientTest;

@RunWith(MockitoJUnitRunner.class)
public class ParameterRepositoryTest {

    private static final String ITEM1_ID = "item_id_1";
    private static final String VERSION1_ID = "version_id_1";
    private static final String PARAMETER1_ID = "parameter_id_1";

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

        ZusammenElement element = new ZusammenElement();
        element.setElementId(new Id(PARAMETER1_ID));
        Info info = new Info();
        info.setName("testInput");
        info.addProperty(ParameterPropertyName.type.name(),ParameterType.FLOAT.name());
        info.addProperty(ParameterPropertyName.mandatory.name(),true);
        element.setInfo(info);
        doReturn(Optional.of(element)).when(zusammenAdaptorMock)
                                      .getElement(any(SessionContext.class), any(ElementContext.class),
                                              eq(PARAMETER1_ID));
        ParameterEntity result = parameterRepository.get(ITEM1_ID, VERSION1_ID, PARAMETER1_ID);
        verify(parameterRepository,times(1)).elementToParameterEntity(element);
        verify(zusammenAdaptorMock).getElement(any(SessionContext.class), any(ElementContext.class),eq(PARAMETER1_ID));
        assertEquals("testInput",result.getName());

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
    public void shouldCreateParameterStructure(){
        parameterRepository.createStructure(ITEM1_ID,VERSION1_ID);
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







}
