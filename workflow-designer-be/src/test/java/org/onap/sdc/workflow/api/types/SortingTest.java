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

import java.util.Arrays;
import java.util.Collections;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.onap.sdc.workflow.services.types.Sort;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
public class SortingTest {

    @InjectMocks
    private Sorting sorting;

    @Test
    public void setSortInvalid() {
        sorting.setSort("name:asc:a,:,");
        assertEquals(Collections.emptyList(), sorting.getSorts());
    }

    @Test
    public void setSortAscByDefault() {
        sorting.setSort("name");
        assertEquals(Collections.singletonList(new Sort("name", true)), sorting.getSorts());
    }

    @Test
    public void setSortAsc() {
        sorting.setSort("name:asc");
        assertEquals(Collections.singletonList(new Sort("name", true)), sorting.getSorts());
    }

    @Test
    public void setSortDesc() {
        sorting.setSort("name:desc");
        assertEquals(Collections.singletonList(new Sort("name", false)), sorting.getSorts());
    }

    @Test
    public void setSortMoreThanOne() {
        sorting.setSort("name:asc,type,date:desc");
        assertEquals(Arrays.asList(
                new Sort("name", true),
                new Sort("type", true),
                new Sort("date", false)), sorting.getSorts());
    }
}
