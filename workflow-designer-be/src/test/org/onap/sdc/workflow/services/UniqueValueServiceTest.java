package org.onap.sdc.workflow.services;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import java.util.Optional;
import org.junit.Before;
import org.junit.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.Spy;
import org.onap.sdc.workflow.persistence.UniqueValueRepository;
import org.onap.sdc.workflow.persistence.types.UniqueValueEntity;
import org.onap.sdc.workflow.services.errors.UniqueValueViolationException;

public class UniqueValueServiceTest {

    public static final String TYPE = "ss";
    public static final String DUMMY_COMBINATION = "dummy";

    @Mock
    private UniqueValueRepository uniqueValueRepositoryMock;

    @Spy
    @InjectMocks
    private UniqueValueService uniqueValueService;

    @Before
    public void setUp() throws Exception {
        MockitoAnnotations.initMocks(this);
    }

    // testing create unique value- START
    @Test
    public void shouldCallRepositoryInsertIfValueUnique(){
        doReturn(Optional.empty()).when(uniqueValueRepositoryMock).findById(any());
        uniqueValueService.createUniqueValue(TYPE, new String[]{DUMMY_COMBINATION});
        verify(uniqueValueRepositoryMock, times(1)).insert(any(UniqueValueEntity.class));
    }

    @Test
    public void shouldNotCheckValueIfNoUniqueCombination(){
        uniqueValueService.createUniqueValue(TYPE, null);
        verify(uniqueValueRepositoryMock, never()).findById(any(UniqueValueEntity.class));
    }

    @Test(expected = UniqueValueViolationException.class)
    public void shouldThrowExceptionIfValueIsNotUnique(){
        doReturn(Optional.of("xxx")).when(uniqueValueRepositoryMock).findById(any());
        uniqueValueService.createUniqueValue(TYPE, new String[]{DUMMY_COMBINATION});
    }
    // testing create unique value- END

    // testing delete unique value- START
    @Test
    public void shouldCallRepositoryDeleteIfValueValid(){
        uniqueValueService.deleteUniqueValue(TYPE, new String[]{DUMMY_COMBINATION});
        verify(uniqueValueRepositoryMock, times(1)).delete(any(UniqueValueEntity.class));
    }

    @Test
    public void shouldNotCallRepositoryDeleteIfValueNouniqueCombination(){
        uniqueValueService.deleteUniqueValue(TYPE, new String[]{});
        verify(uniqueValueRepositoryMock, never()).delete(any(UniqueValueEntity.class));
    }

    // testing delete unique value- END

    // testing update unique value- START
    @Test
    public void shouldNotUpdateIfNewAndOldValueAreEqualsCaseIgnore(){
        String value = "value";
        uniqueValueService.updateUniqueValue(TYPE, value, value.toUpperCase());
        verify(uniqueValueService, never()).createUniqueValue(anyString(), any());
    }

    @Test
    public void shouldUpdateIfNewAndOldValueAreNotEqualsCaseIgnore(){
        String oldValue = "oldValue";
        String newValue = "newValue";
        uniqueValueService.updateUniqueValue(TYPE, oldValue, newValue);
        verify(uniqueValueService, times(1)).createUniqueValue(anyString(), any());
        verify(uniqueValueService, times(1)).deleteUniqueValue(anyString(), any());
    }
    // testing update unique value- END

    // testing validateUniqueValue- START
    @Test
    public void shouldReturnTrueIfValueExist() {
        doReturn(Optional.of("xxx")).when(uniqueValueRepositoryMock).findById(any());
        assertTrue(uniqueValueService.isUniqueValueOccupied(TYPE, new String[]{DUMMY_COMBINATION}));
    }

    @Test
    public void shouldReturnFalseIfValueNotExist() {
        doReturn(Optional.empty()).when(uniqueValueRepositoryMock).findById(any());
        assertFalse(uniqueValueService.isUniqueValueOccupied(TYPE, new String[]{DUMMY_COMBINATION}));
    }

    // testing validate unique value- END


}
