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
        sorting.setSort("a");
        assertEquals(Collections.emptyList(), sorting.getSorts());
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
        sorting.setSort("name:asc,date:desc");
        assertEquals(Arrays.asList(new Sort("name", true), new Sort("date", false)), sorting.getSorts());
    }
}