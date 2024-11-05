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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.onap.sdc.workflow.services.types.PagingConstants.MAX_LIMIT;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
public class PagingTest {

    @InjectMocks
    private Paging paging;

    @Test
    public void setOffsetNotNumber() {
        paging.setOffset("aaa");
        assertNull(paging.getOffset());
    }

    @Test
    public void setOffsetNegative() {
        paging.setOffset("-5");
        assertNull(paging.getOffset());
    }

    @Test
    public void setOffsetZero() {
        paging.setOffset("0");
        assertEquals(Integer.valueOf(0), paging.getOffset());
    }

    @Test
    public void setOffsetPositive() {
        paging.setOffset("8");
        assertEquals(Integer.valueOf(8), paging.getOffset());
    }

    @Test
    public void setLimitNotNumber() {
        paging.setLimit("aaa");
        assertNull(paging.getLimit());
    }

    @Test
    public void setLimitNegative() {
        paging.setLimit("-5");
        assertNull(paging.getLimit());
    }

    @Test
    public void setLimitZero() {
        paging.setLimit("0");
        assertNull(paging.getLimit());
    }

    @Test
    public void setLimitPositive() {
        paging.setLimit("8");
        assertEquals(Integer.valueOf(8), paging.getLimit());
    }

    @Test
    public void setLimitGreaterThanMax() {
        paging.setLimit("7000");
        assertEquals(Integer.valueOf(MAX_LIMIT), paging.getLimit());
    }
}
