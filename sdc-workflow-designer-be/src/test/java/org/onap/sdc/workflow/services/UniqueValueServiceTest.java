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

package org.onap.sdc.workflow.services;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
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
import org.onap.sdc.workflow.services.exceptions.UniqueValueViolationException;

public class UniqueValueServiceTest {

    private static final String TYPE = "ss";
    private static final String DUMMY_COMBINATION = "dummy";

    @Mock
    private UniqueValueRepository uniqueValueRepositoryMock;

    @Spy
    @InjectMocks
    private UniqueValueService uniqueValueService;

    @Before
    public void setUp() {
        MockitoAnnotations.initMocks(this);
    }

    @Test
    public void shouldCallRepositoryInsertIfValueUnique() {
        doReturn(Optional.empty()).when(uniqueValueRepositoryMock).findById(any());
        uniqueValueService.createUniqueValue(TYPE, DUMMY_COMBINATION);
        verify(uniqueValueRepositoryMock, times(1)).insert(any(UniqueValueEntity.class));
    }

    @Test
    public void shouldNotCheckValueIfNoUniqueCombination() {
        uniqueValueService.createUniqueValue(TYPE);
        verify(uniqueValueRepositoryMock, never()).findById(any(UniqueValueEntity.class));
    }

    @Test(expected = UniqueValueViolationException.class)
    public void shouldThrowExceptionIfValueIsNotUnique() {
        doReturn(Optional.of("xxx")).when(uniqueValueRepositoryMock).findById(any());
        uniqueValueService.createUniqueValue(TYPE, DUMMY_COMBINATION);
    }

    @Test
    public void shouldCallRepositoryDeleteIfValueValid() {
        uniqueValueService.deleteUniqueValue(TYPE, DUMMY_COMBINATION);
        verify(uniqueValueRepositoryMock, times(1)).delete(any(UniqueValueEntity.class));
    }

    @Test
    public void shouldNotCallRepositoryDeleteIfValueNouniqueCombination() {
        uniqueValueService.deleteUniqueValue(TYPE);
        verify(uniqueValueRepositoryMock, never()).delete(any(UniqueValueEntity.class));
    }

    @Test
    public void shouldNotUpdateIfNewAndOldValueAreEqualsCaseIgnore() {
        String value = "value";
        uniqueValueService.updateUniqueValue(TYPE, value, value.toUpperCase());
        verify(uniqueValueService, never()).createUniqueValue(anyString(), any());
    }

    @Test
    public void shouldUpdateIfNewAndOldValueAreNotEqualsCaseIgnore() {
        String oldValue = "oldValue";
        String newValue = "newValue";
        uniqueValueService.updateUniqueValue(TYPE, oldValue, newValue);
        verify(uniqueValueService, times(1)).createUniqueValue(anyString(), any());
        verify(uniqueValueService, times(1)).deleteUniqueValue(anyString(), any());
    }

    @Test
    public void shouldReturnTrueIfValueExist() {
        doReturn(Optional.of("xxx")).when(uniqueValueRepositoryMock).findById(any());
        assertTrue(uniqueValueService.isUniqueValueOccupied(TYPE, DUMMY_COMBINATION));
    }

    @Test
    public void shouldReturnFalseIfValueNotExist() {
        doReturn(Optional.empty()).when(uniqueValueRepositoryMock).findById(any());
        assertFalse(uniqueValueService.isUniqueValueOccupied(TYPE, DUMMY_COMBINATION));
    }
}
