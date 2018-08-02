package org.onap.sdc.workflow.api.types;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.onap.sdc.workflow.services.types.PagingConstants.MAX_LIMIT;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
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