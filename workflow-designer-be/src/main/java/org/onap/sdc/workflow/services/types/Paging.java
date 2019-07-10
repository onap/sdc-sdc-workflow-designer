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

package org.onap.sdc.workflow.services.types;

import lombok.Getter;

@Getter
public class Paging {

    private int offset;
    private int limit;
    private int count;
    private boolean hasMore;
    private int total;

    public Paging(PagingRequest pagingRequest, int count, int total) {
        this.offset = pagingRequest.getOffset();
        this.limit = pagingRequest.getLimit();
        this.count = count;
        setTotal(total);
    }

    private void setTotal(int total) {
        this.total = total;
        this.hasMore = total > offset + limit;
    }
}
